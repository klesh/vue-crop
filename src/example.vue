<template>
  <div>
    <link rel="stylesheet" href="https://unpkg.com/bootstrap@4.3.1/dist/css/bootstrap.min.css">
    <nav class="navbar navbar-dark bg-dark">
      <span class="navbar-brand mb-0 h1">VueCrop</span>
    </nav>
    <div class="container content">
    <div class="card">
      <div class="card-body">
        <ol>
          <li>Hold down Right Button to drag canvas</li>
          <li>Hold down Left Button to create box</li>
          <li>Double Click on box to update <code>v-model</code>, and emit <code>change</code> event</li>
          <li>Double Click on dimmed area to remove box for creating a new one (will not update <code>v-model</code> or emit <code>change</code> event)</li>
        </ol>
      </div>
    </div>
    <div class="row content">
      <div class="col-sm-9">
        <VueCrop ref="crop" class="crop" :src="images[imageIndex]" :ratio="ratio" v-model="box" @change="syncPreview"></VueCrop>
      </div>
      <div class="col-sm-3">
        <div id="preview" :style="previewBoxStyle" ref="preview">
          <img v-if="box" :src="images[imageIndex]" :style="previewImgStyle">
        </div>

        <form class="mt-sm-2">
          <div class="form-group row">
            <label class="col-sm-6 col-form-label">Aspect Ratio: </label>
            <div class="col-sm-6">
              <input id="ratio" type="number" class="form-control" v-model.number="ratio"/>
            </div>
          </div>
          <template v-if="box">
            <div class="form-group row">
              <label class="col-sm-6 col-form-label">x: </label>
              <div class="col-sm-6">
                <input type="number" v-model.number="box.x" class="form-control">
              </div>
            </div>
            <div class="form-group row">
              <label class="col-sm-6 col-form-label">y: </label>
              <div class="col-sm-6">
                <input type="number" v-model.number="box.y" class="form-control">
              </div>
            </div>
            <div class="form-group row">
              <label class="col-sm-6 col-form-label">w: </label>
              <div class="col-sm-6">
                <input type="number" v-model.number="box.w" class="form-control">
              </div>
            </div>
            <div class="form-group row">
              <label class="col-sm-6 col-form-label">h: </label>
              <div class="col-sm-6">
                <input type="number" v-model.number="box.h" class="form-control">
              </div>
            </div>
            <button type="button" @click="ok" class="btn btn-primary">Ok</button>
            <button type="button" @click="cancel" class="btn btn-warning">Cancel</button>
          </template>
          <button v-else type="button" @click="setBox" class="btn btn-primary btn-block">Set box</button>
          <button type="button" @click="changeImage" class="btn btn-primary btn-block mt-2">Change image</button>
        </form>
      </div>
    </div>
    </div>
  </div>
</template>

<style>
.content {
  margin-top: 40px;
}
.crop {
  width: 100%;
  height: 600px;
  border: solid 1px black;
  margin: auto;
}
#preview {
  overflow: hidden;
  width: 100%;
  position: relative;
  background: #eee;
}
#preview img {
  position: absolute;
  top: 0;
  left: 0;
}
.card {
  margin-top: 40px;
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
      ratio: 0,
      box: null,
      imageIndex: 0,
      previewBoxStyle: {height: '100px'},
      previewImgStyle: null
    }
  },
  methods: {
    ok() {
      this.$refs.crop.ok();
    },
    cancel() {
      this.box = null;
      this.syncPreview();
    },
    setBox() {
      this.box = {x: 10, y: 10, w: 100, h: 100};
      this.syncPreview();
    },
    changeImage() {
      this.imageIndex = (this.imageIndex + 1) % this.images.length;
      this.box = null;
      this.syncPreview();
    },
    syncPreview() {
      const {box} = this;
      if (!box)
        return;
      const pw = this.$refs.preview.offsetWidth;
      const pr = pw / box.w;
      console.log(pw, box.w, box.h);
      this.previewBoxStyle = {
        height: `${pw / box.w * box.h || 100}px`
      };
      this.previewImgStyle = {
        top: `-${pr * box.y}px`,
        left: `-${pr * box.x}px`,
        width: `${pr * this.$refs.crop.bg.ow}px`
      };
    }
  }
};
</script>
