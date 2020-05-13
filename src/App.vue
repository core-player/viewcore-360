<template>
  <div id="app">
    <div class="player-container">
      <vue-core-video-player src="/videos/avengers.mp4" :viewCore="viewCore"></vue-core-video-player>
    </div>
  </div>
</template>

<script>
import viewcore360 from './index';

export default {
  name: 'App',

  data () {
    return {
      viewCore: [
        viewcore360
      ]
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
#app .player-container {
  width: 640px;
  height: 320px;
}
</style>
