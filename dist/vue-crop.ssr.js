'use strict';Object.defineProperty(exports,'__esModule',{value:true});//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script = {
  name: 'VueCrop',
  props: {
    src: {type: String},
    value: {type: Object},
    ratio: {type: Number}
  },
  computed: {
    bgOverlapStyle: function bgOverlapStyle() {
      var ref = this.bg;
      var x = ref.x;
      var y = ref.y;
      var w = ref.w;
      var h = ref.h;
      return {
        top: (y + "px"),
        left: (x + "px"),
        width: (w + "px"),
        height: (h + "px"),
      };
    },
    bgImageStyle: function bgImageStyle() {
      return Object.assign({}, this.bgOverlapStyle,
        {opacity: this.box.actived ? 0.6 : 1});
    },
    boxStyle: function boxStyle() {
      var ref = this;
      var box = ref.box;
      var bg = ref.bg;
      return {
        top: ((box.y * bg.zr + bg.y - 1) + "px"),
        left: ((box.x * bg.zr + bg.x - 1) + "px"),
        width: ((box.w * bg.zr) + "px"),
        height: ((box.h * bg.zr) + "px"),
      };
    },
    boxImageStyle: function boxImageStyle() {
      var ref = this;
      var box = ref.box;
      var bg = ref.bg;
      return {
        top: ((-box.y * bg.zr) + "px"),
        left: ((-box.x * bg.zr) + "px"),
        width: ((bg.w) + "px"),
        height: ((bg.h) + "px"),
      };
    }
  },
  data: function data() {
    return {
      initials: [],
      vp: { x: 0, y: 0, w: 0, h: 0}, // viewport
      bg: { x: 0, y: 0, w: 0, h: 0, ow: null, oh: null, or: null, zr: 1 }, // background image
      box: { x: 10, y: 10, w: 100, h: 100, ax: 0, ay: 0, actived: false, mode: null },
    };
  },
  mounted: function mounted() {
    var this$1 = this;

    this.reload(true);
    this.$watch('value', function () { return this$1.reload(); }, {deep: true});
    this.$watch('src', function () { return this$1.reload(); });
  },
  methods: {
    reload: function reload() {
      var this$1 = this;

      // caculate viewport offset to the page
      var parent = this.$el;
      var ref = [0, 0];
      var x = ref[0];
      var y = ref[1];
      while (parent) {
        x += parent.offsetLeft;
        y += parent.offsetTop;
        parent = parent.offsetParent;
      }
      this.vp = {x: x, y: y, w: this.$el.offsetWidth, h: this.$el.offsetHeight};

      // get image original width/height
      var i = new Image();
      i.onload = function () {
        var ref = this$1;
        var bg = ref.bg;
        var vp = ref.vp;
        bg.ow = i.width;
        bg.oh = i.height;
        bg.or = bg.ow / bg.oh;
        vp.r = vp.w / vp.h;
        if (bg.or > vp.r)  {
          bg.w = Math.min(bg.ow, vp.w);
          bg.h = bg.w / bg.or;
        } else {
          bg.h = Math.min(bg.oh, vp.h);
          bg.w = bg.h * bg.or;
        }
        bg.zr = bg.w / bg.ow;
        bg.x = (vp.w - bg.w) / 2;
        bg.y = (vp.h - bg.h) / 2;
      };
      i.src = this.src;

      // load box
      if (this.value) {
        var ref$1 = this.value;
        var x$1 = ref$1.x;
        var y$1 = ref$1.y;
        var w = ref$1.w;
        var h = ref$1.h;
        this.box = Object.assign({}, this.box, {x: x$1, y: y$1, w: w, h: h, actived: true});
      } else {
        this.box.actived = false;
      }
    },
    mouseWheel: function mouseWheel(e) {
      var ref = this;
      var bg = ref.bg;
      var vp = ref.vp;
      // zoom image
      var oldWidth = bg.w;
      bg.w += e.wheelDeltaY;
      bg.h = bg.w / bg.or;
      // move background with respect to cursor position
      var r = bg.w / oldWidth - 1;
      bg.x -= (e.x - vp.x - bg.x) * r;
      bg.y -= (e.y - vp.y - bg.y) * r;
      bg.zr = bg.w / bg.ow;
    },
    mouseDown: function mouseDown(e) {
      this.initials[e.button] = {e: e, bg: Object.assign({}, this.bg), box: Object.assign({}, this.box)};
    },
    mouseUp: function mouseUp(e) {
      this.initials[e.button] = null;
      this.box.mode = null;
    },
    mouseMove: function mouseMove(e) {
      var ref = this.initials;
      var l = ref[0];
      var r = ref[2];
      var ref$1 = this;
      var bg = ref$1.bg;
      var box = ref$1.box;
      var vp = ref$1.vp;
      if (r) { // moving canvas
        bg.x = r.bg.x + e.x - r.e.x;
        bg.y = r.bg.y + e.y - r.e.y;
      }
      if (l) { // creating / moving / resizing box
        if (!box.actived && Math.abs(e.x - l.e.x) > 5 && Math.abs(e.y - l.e.y) > 5) {
          var ax = (l.e.x - vp.x - bg.x) / bg.zr;
          var ay = (l.e.y - vp.y - bg.y) / bg.zr;
          if (ax > 0 && ay > 0) {
            this.box = {ax: ax, ay: ay, mode: 'resizing', actived: true};
          }
        }
        if (box.mode) {
          var ref$2 = l.box;
          var x = ref$2.x;
          var y = ref$2.y;
          var w = ref$2.w;
          var h = ref$2.h;
          if (box.mode === 'resizing') {
            var ax$1 = box.ax;
            var ay$1 = box.ay;
            var mx, my;
            if (~ax$1) {
              mx = (e.x - vp.x - bg.x) / bg.zr;
              x = Math.min(mx, ax$1);
              w = Math.abs(mx - ax$1);
            }
            if (~ay$1) {
              my = (e.y - vp.y - bg.y) / bg.zr;
              y = Math.min(my, ay$1);
              h = Math.abs(my - ay$1);
            }
            if (this.ratio) {
              if (Math.abs(e.x - l.e.x) > Math.abs(e.y - l.e.y)) {
                var nh = w / this.ratio;
                if (my < ay$1) { y += h - nh; }
                h = nh;
              } else {
                var nw = h * this.ratio;
                if (mx < ax$1) { x += w - nw; }
                w = nw;
              }
            }
            if (x < 0 || x + w > bg.ow || y < 0 || y + h > bg.oh) { return; }
          } else if (box.mode === 'moving') {
            x = l.box.x + (e.x - l.e.x) / bg.zr;
            y = l.box.y + (e.y - l.e.y) / bg.zr;
            x = Math.min(Math.max(0, x), bg.ow - box.w);
            y = Math.min(Math.max(0, y), bg.oh - box.h);
          }
          this.box = Object.assign({}, this.box, {x: x, y: y, w: w, h: h});
        }
      }
    },
    setResizing: function setResizing(direction) {
      var ref = this;
      var box = ref.box;
      box.ax = -1;
      box.ay = -1;
      if (~direction.indexOf('n')) { box.ay = box.y + box.h; }
      if (~direction.indexOf('s')) { box.ay = box.y; }
      if (~direction.indexOf('w')) { box.ax = box.x + box.w; }
      if (~direction.indexOf('e')) { box.ax = box.x; }
      box.mode = 'resizing';
    },
    setMoving: function setMoving() {
      this.box.mode = 'moving';
    },
    ok: function ok() {
      var ref = this.box;
      var x = ref.x;
      var y = ref.y;
      var w = ref.w;
      var h = ref.h;
      this.$emit('input', Object.assign({}, this.value, {x: x, y: y, w: w, h: h}));
      this.$emit('change');
    }
  }
};function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;function createInjectorSSR(context) {
  if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
    context = __VUE_SSR_CONTEXT__;
  }

  if (!context) { return function () {}; }

  if (!('styles' in context)) {
    context._styles = context._styles || {};
    Object.defineProperty(context, 'styles', {
      enumerable: true,
      get: function get() {
        return context._renderStyles(context._styles);
      }
    });
    context._renderStyles = context._renderStyles || renderStyles;
  }

  return function (id, style) {
    return addStyle(id, style, context);
  };
}

function addStyle(id, css, context) {
  var group =  css.media || 'default' ;
  var style = context._styles[group] || (context._styles[group] = {
    ids: [],
    css: ''
  });

  if (!style.ids.includes(id)) {
    style.media = css.media;
    style.ids.push(id);
    var code = css.source;

    style.css += code + '\n';
  }
}

function renderStyles(styles) {
  var css = '';

  for (var key in styles) {
    var style = styles[key];
    css += '<style data-vue-ssr-id="' + Array.from(style.ids).join(' ') + '"' + (style.media ? ' media="' + style.media + '"' : '') + '>' + style.css + '</style>';
  }

  return css;
}

var server = createInjectorSSR;/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"vp",on:{"mousewheel":_vm.mouseWheel,"mousedown":_vm.mouseDown,"mouseup":_vm.mouseUp,"mousemove":_vm.mouseMove,"contextmenu":function($event){$event.preventDefault();}}},[_vm._ssrNode("<div class=\"movable bgoverlap\""+(_vm._ssrStyle(null,_vm.bgOverlapStyle, null))+"></div> <img"+(_vm._ssrAttr("src",_vm.src))+" draggable=\"false\" class=\"movable\""+(_vm._ssrStyle(null,_vm.bgImageStyle, null))+"> "+((_vm.box.actived)?("<div class=\"movable box\""+(_vm._ssrStyle(null,_vm.boxStyle, null))+"><div class=\"vp fill\"><img"+(_vm._ssrAttr("src",_vm.src))+" draggable=\"false\" class=\"movable\""+(_vm._ssrStyle(null,_vm.boxImageStyle, null))+"></div> <div class=\"indicator top left\"></div> <div class=\"indicator top center\"></div> <div class=\"indicator top right\"></div> <div class=\"indicator middle left \"></div> <div class=\"indicator middle right \"></div> <div class=\"indicator bottom left\"></div> <div class=\"indicator bottom center\"></div> <div class=\"indicator bottom right\"></div></div>"):"<!---->"))])};
var __vue_staticRenderFns__ = [];

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-69a397aa_0", { source: ".vp[data-v-69a397aa]{position:relative;overflow:hidden;user-select:none}.vp .movable[data-v-69a397aa]{position:absolute}.vp .bgoverlap[data-v-69a397aa]{background:#000}.vp .box[data-v-69a397aa]{border:solid 1px #00f}.vp .fill[data-v-69a397aa]{width:100%;height:100%}.vp .box .indicator[data-v-69a397aa]{position:absolute;background:#00f;border:solid 1px #fff;width:8px;height:8px;margin:-4px 0 0 -4px;box-sizing:border-box}.indicator.top[data-v-69a397aa]{top:0}.indicator.middle[data-v-69a397aa]{top:50%}.indicator.bottom[data-v-69a397aa]{top:100%}.indicator.left[data-v-69a397aa]{left:0}.indicator.center[data-v-69a397aa]{left:50%}.indicator.right[data-v-69a397aa]{left:100%}.indicator.top.left[data-v-69a397aa]{cursor:nw-resize}.indicator.top.center[data-v-69a397aa]{cursor:n-resize}.indicator.top.right[data-v-69a397aa]{cursor:ne-resize}.indicator.middle.left[data-v-69a397aa]{cursor:w-resize}.indicator.middle.right[data-v-69a397aa]{cursor:e-resize}.indicator.bottom.left[data-v-69a397aa]{cursor:sw-resize}.indicator.bottom.center[data-v-69a397aa]{cursor:s-resize}.indicator.bottom.right[data-v-69a397aa]{cursor:se-resize}", map: undefined, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = "data-v-69a397aa";
  /* module identifier */
  var __vue_module_identifier__ = "data-v-69a397aa";
  /* functional template */
  var __vue_is_functional_template__ = false;

  
  var component = normalizeComponent_1(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    undefined,
    server
  );// Import vue component

// install function executed by Vue.use()
function install(Vue) {
  if (install.installed) { return; }
  install.installed = true;
  Vue.component('VueCrop', component);
}

// Create module definition for Vue.use()
var plugin = {
  install: install,
};

// To auto-install when vue is found
/* global window global */
var GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

// Inject install function into component - allows component
// to be registered via Vue.use() as well as Vue.component()
component.install = install;

// It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = component;
exports.default=component;