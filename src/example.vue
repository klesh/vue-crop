<template>
  <div>
    <VueCrop ref="crop" class="crop" src="http://2paragraphs.com/wp-content/uploads/2014/03/lenna.jpg" :ratio="1" v-model="box"></VueCrop>
    x: <input type="number" v-model="box.x">
    y: <input type="number" v-model="box.y">
    <button type="button" @click="changePosition">change position</button>
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
</style>

<script>
import VueCrop from './vue-crop.vue';

export default {
  name: 'Example',
  components: {VueCrop},
  data() {
    return {
      box: {x: 10, y: 10, w: 100, h: 100}
    }
  },
  methods: {
    changePosition() {
      this.$refs.crop.reload();
    }
  }
};
</script>
