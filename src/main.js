import Vue from 'vue'
import VueCoreVideoPlayer from 'vue-core-video-player'
import App from './App.vue'


Vue.config.productionTip = false

Vue.use(VueCoreVideoPlayer)

new Vue({
  render: h => h(App),
}).$mount('#app')
