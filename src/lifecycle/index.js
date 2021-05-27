import { patch } from './patch';
/**
 * 混入生命周期函数。
 * @param {Vue} Vue
 */
function lifecycleMixin (Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this;
    patch(vm.$el, vnode);
  }
}

export {
  lifecycleMixin,
}
