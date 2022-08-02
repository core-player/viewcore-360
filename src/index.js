/**
 * A display layer to play 360 video contents
 * */
import { EVENTS } from 'vue-core-video-player'
import webGL from './webgl'
import UI from './ui'
import WebXR from './webXR'

const _viewCore = {
  init (player) {
      this.player = player;
      this.createCanvas();
  },

  createCanvas() {
      const { $el, $video, config } = this.player;
      console.log($video);
      const canvas = document.createElement('canvas')
      canvas.style.position = 'absolute'
      canvas.style.left = 0
      canvas.style.top = 0
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      canvas.width = $el.offsetWidth
      canvas.height = $el.offsetHeight
      canvas.style.backgroundColor = '#000'
      $el.insertBefore(canvas, $video.nextSibling)
      this.$canvas = canvas
      webGL.init(canvas, $video, config, (err) => {
        this.player.emit('error', err)
      })
      UI.init(this.player, canvas)
      WebXR.init(this.player, UI.$XRButton, webGL.gl)
      this.player.on(EVENTS.LOADEDMETADATA, () => {
        console.log($video)
        // webGL.start()
        this._bindEvents();
      })
  },

  _bindEvents() {
    if (this.eventsBind) {
      return
    }
    this.eventsBind = true
    this.player.on(EVENTS.PLAY, () => {
      webGL.start()
    })
    this.player.on(EVENTS.PAUSE, () => {
      webGL.stop()
    })
  }

}
export default function viewcore360 (player, config) {
  console.log(player)
  console.log(config)
  _viewCore.init(player)
}
