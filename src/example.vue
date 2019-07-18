<template>
  <div>
    <VueCrop ref="crop" class="crop" src="http://2paragraphs.com/wp-content/uploads/2014/03/lenna.jpg" :ratio="ratio" v-model="box"></VueCrop>
    <div style="text-align: center">
      x: <input type="number" v-model.number="box.x">
      y: <input type="number" v-model.number="box.y">
      w: <input type="number" v-model.number="box.w">
      h: <input type="number" v-model.number="box.h">
      ratio(w/h): <input type="number" v-model.number="ratio"/>
      <button type="button" @click="done">Done</button>
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
      ratio: 1,
      box: {x: 10, y: 10, w: 100, h: 100}
    }
  },
  methods: {
    done() {
      this.$refs.crop.done();
    }
  }
};
</script>
