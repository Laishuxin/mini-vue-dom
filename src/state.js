import proxyData from './observer/proxy'
import observe from './observer/observe'
function initState(vm) {
  var options = vm.$options;
  if (options.data) {
    initData(vm);
  }
}

function initData(vm) {
  // 不污染用户原本的data
  var data = vm.$options.data;
  // data原本是一个方法，执行后可以通过vm._data.xxx这样获取
  data = typeof data === "function" ? data.call(vm) : data || {};
  vm._data = data;
  for(var key in data){
      // 将对象访问从vm._data.xxx变成vm.xxx的形式
      proxyData(vm, '_data', key);
  }
  // 观察者模式_data
  observe(vm._data);
}

export { initState };
