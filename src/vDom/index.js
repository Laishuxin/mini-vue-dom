import { createElement, createText } from './vnode';

function renderMixin (Vue) {
  Vue.prototype._c = function (/*tagName, attrs, ...children*/) {
    return createElement(...arguments);
  }
  
  Vue.prototype._v = function (text) {
    return createText(text);
  }

  Vue.prototype._s = function (value) {
    if (value === null) return;
    return typeof value === 'object' ? JSON.stringify(value) : value;
  }

  Vue.prototype._render = function () {
    const vm = this;
    const render = vm.$options.render;
    const vnode = render.call(vm);
    console.log(`index.js vnode = `, vnode);
    return vnode;
  }
}

export {
  renderMixin,
}