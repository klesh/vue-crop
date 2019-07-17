<template>
  <VueCrop class="crop" src="http://2paragraphs.com/wp-content/uploads/2014/03/lenna.jpg" :ratio="1"></VueCrop>
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
  components: {VueCrop}
};
</script>
