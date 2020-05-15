// handle webXR

const MODE = {
  WEBXR: 'webXR',
  WEBVR: 'webVR'
}

const WebXR = {

  init(player, XRButton, gl) {
    this.$XRButton = XRButton
    this.webGL = gl
    this.isSupport(result => {
      if (result) {
        if (this.mode === MODE.WEBXR) {
          this._requestXR()
        } else if (this.mode === MODE.WEBVR) {
          this._requestXR()
        }
      }
    })
  },

  isSupport () {
    // keep support for old Android (enable WebVR) Headsets
    return new Promise(resolve => {
      if (typeof navigator.getVRDisplays === 'function') {
        this.mode = 'webVR'
        navigator.getVRDisplays().then(displays => {
          if (displays.length) {
            WebXR.MODE = MODE.WEBVR
            this.display = displays[0]
            return resolve(true)
          } else {
            return resolve(false)
          }
        });
      } else if (typeof navigator.xr === 'object') {
        navigator.xr.sSessionSupported('immersive-vr').then((isSupported) => {
          if (isSupported) {
            WebXR.mode = MODE.WEBXR
          }
          resolve(isSupported)
        })
      } else {
        return resolve(false)
      }
    })
  },

  _requestXR() {
    const webGL = this.webGL
    navigator.xr.requestSession('immersive-vr').then((session) => {
      this.session = session
      session.addEventListener('end', () => {
        this.exit()
      })
      session.updateRenderState({ baseLayer: new XRWebGLLayer(session, webGL) })
      const onXRFrame = (t, frame) => {
        let session = frame.session;

        session.requestAnimationFrame(onXRFrame);
        let pose = frame.getViewerPose(this.xrRefSpace);
        if (pose) {
          // handle pos
        }
      }
      session.requestReferenceSpace('local').then((refSpace) => {
        this.xrRefSpace = refSpace;

        // Inform the session that we're ready to begin drawing.
        session.requestAnimationFrame(onXRFrame);
      });
    });
  },

  _requestVR() {
    if (!this._frameData && window.VRFrameData) {
      this.frameData = new VRFrameData()
    }
    if (this.frameData && this.display && this.display.isPresenting) {
      this.display.getFrameData(this.frameData);
      const pose = this.frameData.pose
      if (pose.position) {
        const position = pose.position;
        this._cameraPosition[0] = position[0]
        this._cameraPosition[1] = position[1]
        this._cameraPosition[2] = position[2]
      }
      if (pose.orientation) {
        const orientation = pose.orientation
        this._cameraQuat[0] = orientation[0]
        this._cameraQuat[1] = orientation[1]
        this._cameraQuat[2] = orientation[2]
        this._cameraQuat[3] = orientation[3]
      }

    }

    window.addEventListener('vrdisplayconnect', (display) => {
      if (this.display) {
        return;
      }
      this.setDisplay(display);
    })
    window.addEventListener('vrdisplaydisconnect', () => {
      this.setDisplay(null);
    })
    
  },
  
  setDisplay (display) {
    this.display = display
  },

  exit () {
    this.showXRButton()
  },

  hideXRButton () {
    this.$XRButton.style.display = 'none'
  },

  showXRButton () {
    this.$XRButton.style.display = ''
  }
    
}

export default WebXR;

