<template>
  <div>
    <VueCrop ref="crop" class="crop" :src="images[imageIndex]" :ratio="ratio" v-model="box"></VueCrop>
    <div style="text-align: center">
      Ratio(w/h): <input type="number" v-model.number="ratio"/>
      <template v-if="box">
        x: <input type="number" v-model.number="box.x">
        y: <input type="number" v-model.number="box.y">
        w: <input type="number" v-model.number="box.w">
        h: <input type="number" v-model.number="box.h">
        <button type="button" @click="ok">Ok</button>
        <button type="button" @click="cancel">Cancel</button>
      </template>
      <button v-else type="button" @click="setBox">Set box</button>
      <button type="button" @click="changeImage">Change image</button>
    </div>
    <div>
    </div>
  </div>
</template>

<style>
.crop {
  width: 60%;
  height: 600px;
  border: solid 1px black;
  margin: auto;
  margin-top: 100px;
}
input {
  width: 6em;
}
</style>

<script>
import VueCrop from './vue-crop.vue';

export default {
  name: 'Example',
  components: {VueCrop},
  data() {
    return {
      images: [
        'https://images.unsplash.com/flagged/photo-1563274289-72ab8547b6fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80',
        'https://images.unsplash.com/photo-1556909172-bd5315ff61a0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80'
      ],
      ratio: 1,
      box: null,
      imageIndex: 0
    }
  },
  methods: {
    ok() {
      this.$refs.crop.ok();
    },
    cancel() {
      this.box = null;
    },
    setBox() {
      this.box = {x: 10, y: 10, w: 100, h: 100};
    },
    changeImage() {
      this.imageIndex = (this.imageIndex + 1) % this.images.length;
      this.box = null;
    }
  }
};
</script>
