<template>
  <div class="vp" @mousewheel="mouseWheel" @mousedown="mouseDown"
    @mouseup="mouseUp" @mousemove="mouseMove" @contextmenu.prevent>
    <div class="movable bgoverlap" :style="bgOverlapStyle" />
    <img class="movable" :src="src" :style="bgImageStyle" draggable="false">
    <div v-if="box.actived" :style="boxStyle" class="movable box">
      <div class="vp fill" @mousedown.left="setMoving" @dbclick="done">
        <img class="movable" :src="src" :style="boxImageStyle" draggable="false">
      </div>
      <div class="indicator top left" @mousedown.left="setResizing('nw')"></div>
      <div class="indicator top center" @mousedown.left="setResizing('n')"></div>
      <div class="indicator top right" @mousedown.left="setResizing('ne')"></div>
      <div class="indicator middle left " @mousedown.left="setResizing('w')"></div>
      <div class="indicator middle right " @mousedown.left="setResizing('e')"></div>
      <div class="indicator bottom left" @mousedown.left="setResizing('sw')"></div>
      <div class="indicator bottom center" @mousedown.left="setResizing('s')"></div>
      <div class="indicator bottom right" @mousedown.left="setResizing('se')"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VueCrop',
  props: {
    src: {type: String},
    value: {type: Object},
    ratio: {type: Number}
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
      };
    },
    boxStyle() {
      const {box, bg} = this;
      return {
        top: `${box.y * bg.zr + bg.y - 1}px`,
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
      box: { x: 10, y: 10, w: 100, h: 100, ax: 0, ay: 0, actived: false, mode: null },
    };
  },
  async mounted() {
    const reload = () => this.reload();
    reload();
    this.$watch('value', reload, {deep: true});
    this.$watch('src', reload);
  },
  methods: {
    reload() {
      // caculate viewport offset to the page
      let parent = this.$el;
      let [x, y] = [0, 0];
      while (parent) {
        x += parent.offsetLeft;
        y += parent.offsetTop;
        parent = parent.offsetParent;
      }
      this.vp = {x, y, w: this.$el.offsetWidth, h: this.$el.offsetHeight};

      // get image original width/height
      const img = new Image();
      img.onload = () => {
        const {width: ow, height: oh} = img;
        const or = ow / oh;
        const {w: vw, h: vh} = this.vp;
        const w = Math.min(ow, vw);
        const h = w / or;
        const x = (vw - w) / 2;
        const y = (vh - h) / 2;
        this.bg = {x, y, w, h, ow, oh, or, zr: 1};
      };
      img.src = this.src;

      // load box
      if (this.value) {
        const{x, y, w, h} = this.value;
        this.box = {...this.box, x, y, w, h, actived: true};
      } else {
        this.box.actived = false;
      }
    },
    mouseWheel(e) {
      const {bg, vp} = this;
      // zoom image
      const oldWidth = bg.w;
      bg.w += e.wheelDeltaY;
      bg.h = bg.w / bg.or;
      // move background with respect to cursor position
      const r = bg.w / oldWidth - 1;
      bg.x -= (e.x - vp.x - bg.x) * r;
      bg.y -= (e.y - vp.y - bg.y) * r;
      bg.zr = bg.w / bg.ow;
    },
    mouseDown(e) {
      this.initials[e.button] = {e, bg: {...this.bg}, box: {...this.box}};
    },
    mouseUp(e) {
      this.initials[e.button] = null;
      this.box.mode = null;
    },
    mouseMove(e) {
      const [l, , r] = this.initials;
      const {bg, box, vp} = this;
      if (r) { // moving canvas
        bg.x = r.bg.x + e.x - r.e.x;
        bg.y = r.bg.y + e.y - r.e.y;
      }
      if (l) { // creating / moving / resizing box
        if (!box.actived && Math.abs(e.x - l.e.x) > 5 && Math.abs(e.y - l.e.y) > 5) {
          const ax = (l.e.x - vp.x - bg.x) / bg.zr;
          const ay = (l.e.y - vp.y - bg.y) / bg.zr;
          if (ax > 0 && ay > 0) {
            this.box = {ax, ay, mode: 'resizing', actived: true};
          }
        }
        if (box.mode) {
          let {x, y, w, h} = l.box;
          if (box.mode === 'resizing') {
            const {ax, ay} = box;
            let mx, my
            if (~ax) {
              mx = (e.x - vp.x - bg.x) / bg.zr;
              x = Math.min(mx, ax);
              w = Math.abs(mx - ax);
            }
            if (~ay) {
              my = (e.y - vp.y - bg.y) / bg.zr;
              y = Math.min(my, ay);
              h = Math.abs(my - ay);
            }
            if (this.ratio) {
              if (Math.abs(e.x - l.e.x) > Math.abs(e.y - l.e.y)) {
                const nh = w / this.ratio;
                if (my < ay) y += h - nh;
                h = nh;
              } else {
                const nw = h * this.ratio;
                if (mx < ax) x += w - nw;
                w = nw;
              }
            }
            if (x < 0 || x + w > bg.ow || y < 0 || y + h > bg.oh) return;
          } else if (box.mode === 'moving') {
            x = l.box.x + (e.x - l.e.x) / bg.zr;
            y = l.box.y + (e.y - l.e.y) / bg.zr;
            x = Math.min(Math.max(0, x), bg.ow - box.w);
            y = Math.min(Math.max(0, y), bg.oh - box.h);
          }
          this.box = {...this.box, x, y, w, h};
        }
      }
    },
    setResizing(direction) {
      const {box, ratio} = this;
      box.ax = -1;
      box.ay = -1;
      if (~direction.indexOf('n')) box.ay = box.y + box.h;
      if (~direction.indexOf('s')) box.ay = box.y;
      if (~direction.indexOf('w')) box.ax = box.x + box.w;
      if (~direction.indexOf('e')) box.ax = box.x;
      box.mode = 'resizing';
    },
    setMoving() {
      this.box.mode = 'moving';
    },
    done() {
      const {x, y, w, h} = this.box;
      this.$emit('input', {...this.value, x, y, w, h});
    }
  }
};
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
