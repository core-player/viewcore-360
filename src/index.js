/**
 * a display layer to play 360 video contents
 * **/

const _viewCore = {
    init (player) {
        this.player = player;
        this.createCanvas();
    },

    createCanvas() {
        const { $el, $video } = this.player;
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.left = 0;
        canvas.style.top = 0;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.width = $el.offsetWidth;
        canvas.height = $el.offsetHeight;
        canvas.style.backgroundColor = '#000';
        $el.insertBefore(canvas, $video.nextSibling);
        this.$canvas = canvas;
    },

    cerateVRUI () {

    },

    linkShader () {

    }
}
export default function viewcore360 (player, config) {
    console.log(player)
    console.log(config)
    _viewCore.init(player)
}