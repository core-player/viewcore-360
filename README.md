## viewcore-360

A Display Layer of [vue-core-video-player](https://github.com/core-player/vue-core-video-player) to Show 360 Video Contents 

[DEMO](http://events.jackpu.com/viewcore-360)

### Get Started

``` bash
$ npm install vue-core-video-player --save
$ npm install @core-player/viewcore-360 --save
```

``` vue
<template>
  <div id="app">
    <div class="player-container">
      <vue-core-video-player :view-core="viewCore" src="your_file.mp4"></vue-core-video-player>
    </div>
  </div>
</template>
<script>
import VueCoreVideoPlayer from 'vue-core-video-player'
import Viewcore360 from '@core-player/viewcore-360'

Vue.use(VueCoreVideoPlayer)

export default {
  name: 'App',
  data () {
    return {
      viewCore: [Viewcore360]
    }
  }
}

</script>
```

### Props

| name        | Type         | Example  | Description  |
| ------------- |:-------------:| -----:|----------:|
| hfov     | Number | 360 | The horizontal field of view [fov](https://wiki.panotools.org/Field_of_View) |
| vfov     | Number | 180 | The vertical field of view  [fov](https://wiki.panotools.org/Field_of_View) |
| projection     | String | 'mono','stere' | The VR projection effect |
| disableDrag |  Boolean | false     | Disable user to drag camera to view other angles |


[Example Code](./example)