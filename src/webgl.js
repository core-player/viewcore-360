// webGL helper
import { mat4, quat, vec4 } from 'gl-matrix'
import { isPortrait } from './util'
import { fragmentShader, vertexShader } from './shader'
import { ERROR_CODE, WIDE_SCREEN_FOV, PORTRAIT_SCREEN_FOV, DEFAULT_WEBGL_CONFIG } from './constants'
import rotationHelper from './device-rotation-helper'

const webGL = {
  init (canvas, video, config, handleError) {
    this._canvas = canvas
    this._video = video
    this.config = Object.assign(DEFAULT_WEBGL_CONFIG, config)
    this.handleError = handleError
    try {
      const gl = canvas.getContext('webgl')
      if (this.gl) {
        this.gl = canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true })
      }
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
      this._gl = gl
    } catch (err) {
      this.handleError(err)
    }
    this._link()
    this._createBuffer()
    this._createTextures()
    window.addEventListener('resize', () => {
      this.resize()
    })
  },

  _createBuffer () {
    const buffer = this._gl.createBuffer()
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer)
    this._buffer = buffer
    const position = [
      -1.0, -1.0,
      1.0, -1.0,
      1.0, 1.0,
      -1.0, 1.0,
    ]
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(position), this._gl.STATIC_DRAW)
    const vertexBuffer = this._gl.createBuffer()
    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, vertexBuffer)
    this._vertexBuffer = vertexBuffer
    const vertexIndices = [
      0, 1, 2, 0, 2, 3
    ]
    this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), this._gl.STATIC_DRAW)
  },

  _createTextures () {
    const webGL = this._gl
    const texture = webGL.createTexture()
    webGL.bindTexture(webGL.TEXTURE_2D, texture)
    webGL.texParameteri(webGL.TEXTURE_2D, webGL.TEXTURE_MAG_FILTER, webGL.LINEAR)
    webGL.texParameteri(webGL.TEXTURE_2D, webGL.TEXTURE_MIN_FILTER, webGL.LINEAR)
    webGL.texParameteri(webGL.TEXTURE_2D, webGL.TEXTURE_WRAP_S, webGL.CLAMP_TO_EDGE)
    webGL.texParameteri(webGL.TEXTURE_2D, webGL.TEXTURE_WRAP_T, webGL.CLAMP_TO_EDGE)
    const pixel = new Uint8Array([0, 0, 255, 255])
    webGL.texImage2D(
      webGL.TEXTURE_2D, 0, webGL.RGB, 1.5, 1.5, 0,
      webGL.RGB, webGL.UNSIGNED_BYTE, pixel
    )
    this._texture = texture
  },

  _updateTextures () {
    const webGL = this._gl
    // webGL.bindTexture(webGL.TEXTURE2D, this._texture)
    webGL.pixelStorei(webGL.UNPACK_FLIP_Y_WEBGL, true)
    webGL.texImage2D(
      webGL.TEXTURE_2D, 0, webGL.RGB, webGL.RGB,
      webGL.UNSIGNED_BYTE, this._video
    )
  },

  _link () {
    const webGL = this._gl
    const program = webGL.createProgram()
    webGL.attachShader(program, this._getShader('vs'))
    webGL.attachShader(program, this._getShader('fs'))
    webGL.linkProgram(program)
    this._program = program
    if (!webGL.getProgramParameter(program, webGL.LINK_STATUS)) {
      return this.handleError({
        error_code: ERROR_CODE.LINK_ERROR,
        message: 'Cannot Link Program!'
      })
    }
    webGL.useProgram(program)
    this.attributes = {
      aVertexPosition : webGL.getAttribLocation(program, 'aVertexPosition')
    }
    webGL.enableVertexAttribArray(this.attributes.aVertexPosition)

    this.uniforms = {}
    const uniforms = [
      'uSampler', 
      'eye', 
      'PI',
      'projection', 
      'proj_inv',
      'rotateFlag', 
      'hfov', 
      'vfov',
    ]
    for (let i = 0; i < uniforms.length; i++) {
      const uniformName = uniforms[i]
      this.uniforms[uniformName] = webGL.getUniformLocation(this._program, uniformName)
      webGL.enableVertexAttribArray(this.attributes[uniformName])
    }

  },

  _getShader (name) {
    let result
    let theSource
    const webGL = this._gl
    if (name === 'fs') {
      result = webGL.createShader(webGL.FRAGMENT_SHADER)
      theSource = fragmentShader
    } else if (name === 'vs') {
      result = webGL.createShader(webGL.VERTEX_SHADER)
      theSource = vertexShader
    } else {
      return null
    }
    webGL.shaderSource(result, theSource)
    webGL.compileShader(result)
    if (!webGL.getShaderParameter(result, webGL.COMPILE_STATUS)) {
      const info = webGL.getShaderInfoLog(result)
      this.handleError({
        error_code: ERROR_CODE.SHADER_ERROR,
        message: `An error occurred compiling the shaders: ${info}`
      })
      throw new Error(`An error occurred compiling the shaders: ${info}`)
    }
    return result
  },

  _render (projectionMatrix) {
    const webGL = this._gl
    const {hfov, vfov} = this.config
    this._justifyManualRotation()

    webGL.uniform1i(this.uniforms.rotateFlag, 0)
    webGL.useProgram(this._program)

    webGL.bindBuffer(webGL.ARRAY_BUFFER, this._buffer)
    webGL.vertexAttribPointer(
      this.attributes.aVertexPosition, 2, webGL.FLOAT, false, 0, 0,
    )

    // Specify the texture to map onto the faces.
    webGL.activeTexture(webGL.TEXTURE0)
    webGL.bindTexture(webGL.TEXTURE_2D, this._texture)
    webGL.uniform1i(this.uniforms.uSampler, 0)

    webGL.uniform1f(this.uniforms.projection, this._projection)
    webGL.uniform1f(this.uniforms.hfov, parseFloat(hfov))
    webGL.uniform1f(this.uniforms.vfov, parseFloat(vfov))
    webGL.uniform1f(this.uniforms.PI, parseFloat(Math.PI))

    this._rotation = mat4.create()
    this._totalRotation = quat.create()
    quat.multiply(this._totalRotation, this._manualRotation, rotationHelper.rotationQuat())
    mat4.fromQuat(this._rotation, this._totalRotation)

    const projectionInverse = mat4.create()
    mat4.invert(projectionInverse, projectionMatrix)
    const inv = mat4.create()
    mat4.multiply(inv, this._rotation, projectionInverse)

    webGL.uniformMatrix4fv(this.uniforms.proj_inv, false, inv)

    // Draw
    webGL.bindBuffer(webGL.ELEMENT_ARRAY_BUFFER, this._vertexBuffer)
    webGL.drawElements(webGL.TRIANGLES, 6, webGL.UNSIGNED_SHORT, 0)
  },

  _justifyManualRotation () {
    if (!this._manualRotation) {
      this._manualRotation = quat.create()
    }
    if (!this._totalRotation) {
      this._totalRotation = quat.create()
    }

    if (!this._rotation) {
      this._rotation = mat4.create()
    }

    const sensorRotation = mat4.create()
    mat4.fromQuat(sensorRotation, rotationHelper.rotationQuat())

    const xAxe = vec4.fromValues(1, 0, 0, 1)
    const yAxe = vec4.fromValues(0, 1, 0, 1)
    const zAxe = vec4.fromValues(0, 0, 1, 1)

    const xAxeAfter = vec4.create()
    const yAxeAfter = vec4.create()
    const zAxeAfter = vec4.create()

    vec4.transformMat4(xAxeAfter, xAxe, sensorRotation)
    vec4.transformMat4(yAxeAfter, yAxe, sensorRotation)
    vec4.transformMat4(zAxeAfter, zAxe, sensorRotation)

    // let x = yAxe[0] * Math.sin(controls.offsetX / 2)
    // let y = yAxe[1] * Math.sin(controls.offsetX / 2)
    // let z = yAxe[2] * Math.sin(controls.offsetX / 2)
    // let w = Math.cos(controls.offsetX / 2)

    // const yOffset = quat.fromValues(x, y, z, w)

    // /**
    //  * X轴围绕新的坐标轴进行旋转
    //  */
    // x = xAxeAfter[0] * Math.sin(controls.offsetY / 2)
    // y = xAxeAfter[1] * Math.sin(controls.offsetY / 2)
    // z = xAxeAfter[2] * Math.sin(controls.offsetY / 2)
    // w = Math.cos(controls.offsetY / 2)

    // const xOffset = quat.fromValues(x, y, z, w)

    // quat.multiply(manualRotation, yOffset, xOffset)
  },

  render () {
    const fovDegree = isPortrait() ? PORTRAIT_SCREEN_FOV : WIDE_SCREEN_FOV
    this.resize()
    this.clear()
    this._updateTextures()
    const perspectiveMatrix = mat4.create()
    mat4.perspective(perspectiveMatrix, (Math.PI * fovDegree) / 180, this._ratio, 0.1, 10.0)
    this._render(perspectiveMatrix)
    this._frame = requestAnimationFrame(()=>{
      if (this._running) {
        this.render()
      }
    })
    console.log('render');
  },

  resize () {
    const {_canvas, _gl} = this
    const width = _canvas.clientWidth
    const height = _canvas.clientHeight
    const currentAspect = width / height
    const aspect = _canvas.width / _canvas.height
    if (aspect !== currentAspect) {
      _canvas.width = width
      _canvas.height = height
      _gl.viewport(0, 0, _gl.drawingBufferWidth, _gl.drawingBufferHeight)
    }
  },
  

  clear () {
    const webGL = this._gl
    webGL.clearColor(0.0, 0.0, 0.0, 1.0)
    webGL.clearDepth(1.0)
    webGL.enable(webGL.DEPTH_TEST)
    webGL.depthFunc(webGL.LEQUAL)
    webGL.clear(webGL.COLOR_BUFFER_BIT | webGL.DEPTH_BUFFER_BIT)
  },

  start () {
    this._running = true
    this.render()
  },

  stop () {
    this._running = false
  }


}

export default webGL
