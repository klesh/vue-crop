# VueCrop
VueCrop is a lightweight cropping component less than 250 lines of code all in a single file, no external dependency, and yet, still, provides suffient functionalities for photo cropping

# Demo

https://klesh.github.io/vue-crop

# Usage

## CDN

```vue
<script src="https://unpkg.com/@klesh/vue-crop@1.0.0/dist/vue-crop.min.js"></script>

<template>
  <div>
    <vue-crop src="photo.jpg" :ratio="ratio" v-model="box" @change="done"></vue-crop>
  </div>
</template>

<script>
var app = new Vue({
  el: '#app',
  components: {VueCrop: VueCrop.default},
  data: {
    ratio: 0,
    box: null,
  },
  methods: {
    done() {
      console.log('done');
    }
  }
});
</script>
```

## ESM
```vue
<template>
  <div>
    <vue-crop src="photo.jpg" :ratio="ratio" v-model="box" @change="done"></vue-crop>
  </div>
</template>

<script>
import VueCrop from 'https://unpkg.com/@klesh/vue-crop@1.0.0/dist/vue-crop.esm.js';

var app = new Vue({
  el: '#app',
  components: {VueCrop},
  data: {
    ratio: 0,
    box: null,
  },
  methods: {
    done() {
      console.log('done');
    }
  }
});
</script>
```

## NPM
```shell
$ npm install @klesh/vue-crop
```

```vue
import VueCrop from 'vue-crop';

var app = new Vue({
  el: '#app',
  components: {VueCrop},
  data: {
    ratio: 0,
    box: null,
  },
  methods: {
    done() {
      console.log('done');
    }
  }
});
```
