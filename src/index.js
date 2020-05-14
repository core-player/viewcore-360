/**
 * A display layer to play 360 video contents
 * */
import webGL from './webGL'

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
      this.player.on('loadedmetadata', () => {
        console.log($video)
        webGL.start()
      })
  },

}
export default function viewcore360 (player, config) {
  console.log(player)
  console.log(config)
  _viewCore.init(player)
}