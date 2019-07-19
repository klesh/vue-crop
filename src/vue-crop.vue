<template>
  <div class="vp" @mousewheel.stop.prevent="mouseWheel" @mousedown="mouseDown"
    @mouseup="mouseUp" @mousemove="mouseMove" @contextmenu.prevent @dblclick="box.actived = false">
    <div class="movable bgoverlap" :style="bgOverlapStyle" />
    <img class="movable" :src="src" :style="bgImageStyle" draggable="false">
    <div v-if="box.actived" :style="boxStyle" class="movable box">
      <div class="vp fill" @mousedown.left="setMoving" @dblclick.stop="ok">
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
        opacity: this.box.actived ? 0.3 : 1
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
      bg: { x: 0, y: 0, w: 0, h: 0, ow: null, oh: null, or: null, zr: 1 }, // background image
      box: { x: 10, y: 10, w: 100, h: 100, ax: 0, ay: 0, actived: false, mode: null },
    };
  },
  mounted() {
    this.$watch('value', () => this.reload(), {deep: true});
    this.$watch('src', () => this.reload());
    setTimeout(() => this.reload());
  },
  methods: {
    reload() {
      // get image original width/height
      const i = new Image();
      i.onload = () => {
        const {bg} = this;
        if (bg.ow === i.width && bg.oh === i.height) return;
        bg.ow = i.width;
        bg.oh = i.height;
        bg.or = bg.ow / bg.oh;
        const r = this.$el.offsetWidth / this.$el.offsetHeight;
        if (bg.or > r)  {
          bg.w = Math.min(bg.ow, this.$el.offsetWidth);
          bg.h = bg.w / bg.or;
        } else {
          bg.h = Math.min(bg.oh, this.$el.offsetHeight);
          bg.w = bg.h * bg.or;
        }
        bg.zr = bg.w / bg.ow;
        bg.x = (this.$el.offsetWidth - bg.w) / 2;
        bg.y = (this.$el.offsetHeight - bg.h) / 2;
      };
      i.src = this.src;

      // load box
      if (this.value) {
        const{x, y, w, h} = this.value;
        this.box = {...this.box, x, y, w, h, actived: true};
      } else {
        this.box.actived = false;
      }
    },
    mouseWheel(e) {
      const {bg} = this;
      // zoom image
      const oldWidth = bg.w;
      const w = bg.w + e.wheelDeltaY;
      if (w < 50) return;
      bg.w = w;
      bg.h = bg.w / bg.or;
      // move background with respect to cursor position
      const r = bg.w / oldWidth - 1;
      bg.x -= (e.offsetX) * r;
      bg.y -= (e.offsetY) * r;
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
      const {bg, box} = this;
      if (r) { // moving canvas
        bg.x = r.bg.x + e.x - r.e.x;
        bg.y = r.bg.y + e.y - r.e.y;
      }
      if (l && e.target.tagName === 'IMG') { // creating / moving / resizing box
        if (!box.actived && Math.abs(e.x - l.e.x) > 5 && Math.abs(e.y - l.e.y) > 5) {
          const ax = l.e.offsetX / bg.zr;
          const ay = l.e.offsetY / bg.zr;
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
              mx = e.offsetX / bg.zr;
              x = Math.min(mx, ax);
              w = Math.abs(mx - ax);
            }
            if (~ay) {
              my = e.offsetY / bg.zr;
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
      };
    },
    setResizing(direction) {
      const {box} = this;
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
    ok() {
      const {x, y, w, h} = this.box;
      this.$emit('input', {...this.value, x, y, w, h});
      this.$emit('change');
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
