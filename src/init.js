import { initState } from './state';
import { compileToRenderFunction } from './compiler';
import { mountComponent } from './lifecycle/mountComponent'

/**
 * 初始化混入函数。
 * @param { VueStatic } Vue
 */
function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options;
    initState(vm);
    

    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  }
  
  Vue.prototype.$mount = function (el) {
    const vm = this;
    
    const options = vm.$options;

    el = typeof el === 'string'
          ? document.querySelector(el)
          : el;
    
    vm.$el = el;
    if (!options.render) {
      let template = options.template || el.outerHTML;

      options.render = compileToRenderFunction(template);
    }
    
    mountComponent(vm);
  }
}

export {
  initMixin,
}