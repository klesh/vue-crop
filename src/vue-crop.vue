<template>
  <div class="vp" @mousewheel="mouseWheel" @mousedown="mouseDown" @mouseup="mouseUp" @mousemove="mouseMove" @contextmenu.prevent>
    <div class="movable bgoverlap" :style="bgOverlapStyle" />
    <img class="movable" :src="src" :style="bgImageStyle" draggable="false">
    <div v-if="box.actived" :style="boxStyle" class="movable box">
      <div class="vp fill">
        <img class="movable" :src="src" :style="boxImageStyle" draggable="false">
      </div>
      <div class="indicator top left" @mousedown.left="e => setResizing(e, 'nw')"></div>
      <div class="indicator top center" @mousedown.left="e => setResizing(e, 'n')"></div>
      <div class="indicator top right" @mousedown.left="e => setResizing(e, 'ne')"></div>
      <div class="indicator middle left " @mousedown.left="e => setResizing(e, 'w')"></div>
      <div class="indicator middle right " @mousedown.left="e => setResizing(e, 'e')"></div>
      <div class="indicator bottom left" @mousedown.left="e => setResizing(e, 'sw')"></div>
      <div class="indicator bottom center" @mousedown.left="e => setResizing(e, 's')"></div>
      <div class="indicator bottom right" @mousedown.left="e => setResizing(e, 'se')"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VueCrop',
  props: {
    src: {type: String},
    value: {type: Object}
  },
  computed: {
    bgOverlapStyle() {
      const {x, y, w, h} = this.bg;
      return {
        top: `${y}px`,
        left: `${x}px`,
        width: `${w}px`,
        height: `${h}px`,
      };
    },
    bgImageStyle() {
      return {
        ...this.bgOverlapStyle,
        opacity: this.box.actived ? 0.6 : 1
      }
    },
    boxStyle() {
      const {box, bg} = this;
      return {
        top: `${box.y * bg.zr + bg.y  - 1}px`,
        left: `${box.x * bg.zr + bg.x - 1}px`,
        width: `${box.w * bg.zr}px`,
        height: `${box.h * bg.zr}px`,
      };
    },
    boxImageStyle() {
      const {box, bg} = this;
      return {
        top: `${-box.y * bg.zr}px`,
        left: `${-box.x * bg.zr}px`,
        width: `${bg.w}px`,
        height: `${bg.h}px`,
      };
    }
  },
  data() {
    return {
      initials: [],
      vp: { x: 0, y: 0, w: 0, h: 0}, // viewport
      bg: { x: 0, y: 0, w: 0, h: 0, ow: null, oh: null, or: null, zr: 1 }, // background image
      box: { x: 10, y: 10, w: 100, h: 100, ax: 0, ay: 0, actived: true, mode: null },
    };
  },
  async mounted() {
    this.vp = this.getViewPortData();
    this.bg = await this.getBgData();
  },
  methods: {
    getViewPortData() {
      // caculate viewport offset to the page
      let parent = this.$el;
      let [x, y] = [0, 0];
      while (parent) {
        x += parent.offsetLeft;
        y += parent.offsetTop;
        parent = parent.offsetParent;
      }
      return {x, y, w: this.$el.offsetWidth, h: this.$el.offsetHeight};
    },
    async getBgData() {
      // get image original width/height
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const {width: ow, height: oh} = img;
          const or = ow / oh;
          const {w: vw, h: vh} = this.vp;
          const w = Math.min(ow, vw);
          const h = w / or;
          const x = (vw - w) / 2;
          const y = (vh - h) / 2;
          resolve({x, y, w, h, ow, oh, or, zr: 1});
        }
        img.src = this.src;
      });
    },
    mouseWheel(e) {
      let {x, y, w, h, zr, ...rest} = this.bg;
      const {x: vx, y: vy} = this.vp;
      // zoom image
      const oldWidth = w;
      w = w + e.wheelDeltaY;
      h = w / rest.or;
      // move background with respect to cursor position
      const r = w / oldWidth - 1;
      x -= (e.x - vx - x) * r;
      y -= (e.y - vy - y) * r;
      zr = w / rest.ow;
      this.bg = {x, y, w, h, zr, ...rest};
    },
    mouseDown(e) {
      this.initials[e.button] = {e, bg: {...this.bg}, box: {...this.box}};
    },
    mouseUp(e) {
      this.initials[e.button] = null;
      this.box.mode = null;
    },
    mouseMove(e) {
      const [l, c, r] = this.initials;
      const {bg, box, vp} = this;
      if (r) { // moving canvas
        bg.x = r.bg.x + e.x - r.e.x;
        bg.y = r.bg.y + e.y - r.e.y;
      }
      if (l) { // moving / resizing box
        if (box.mode === 'resizing') {
          let {x, y, w, h, ...rest} = l.box;
          const {ax, ay} = rest;
          if (ax) {
            const mx = (e.x - vp.x - bg.x) * bg.ow / bg.w;
            x = Math.min(mx, ax);
            w = Math.abs(mx - ax);
          }
          if (ay) {
            const my = (e.y - vp.y - bg.y) * bg.oh / bg.h;
            y = Math.min(my, ay);
            h = Math.abs(my - ay);
          }
          this.box = {x, y, w, h, ...rest};
        }
      }
    },
    setResizing(e, direction) {
      const {box} = this;
      box.ax = 0;
      box.ay = 0;
      if (~direction.indexOf('n')) box.ay = box.y + box.h;
      if (~direction.indexOf('s')) box.ay = box.y;
      if (~direction.indexOf('w')) box.ax = box.x + box.w;
      if (~direction.indexOf('e')) box.ax = box.x;
      box.mode = 'resizing';
    }
  }
}
</script>


<style scoped>
.vp {
  position: relative;
  overflow: hidden;
  user-select: none;
}
.vp .movable { position: absolute; }
.vp .bgoverlap { background: black; }
.vp .box { border: solid 1px blue; }
.vp .fill { width:100%; height:100%; }
.vp .box .indicator {
  position: absolute;
  background: blue;
  border: solid 1px white;
  width: 8px;
  height: 8px;
  margin: -4px 0 0 -4px;
  box-sizing: border-box;
}
.indicator.top { top: 0%; }
.indicator.middle { top: 50%; }
.indicator.bottom  { top: 100%; }
.indicator.left  { left: 0%; }
.indicator.center  { left: 50%; }
.indicator.right  { left: 100%; }
.indicator.top.left { cursor: nw-resize; }
.indicator.top.center { cursor: n-resize; }
.indicator.top.right { cursor: ne-resize; }
.indicator.middle.left { cursor: w-resize; }
.indicator.middle.right { cursor: e-resize; }
.indicator.bottom.left { cursor: sw-resize; }
.indicator.bottom.center { cursor: s-resize; }
.indicator.bottom.right { cursor: se-resize; }
</style>
