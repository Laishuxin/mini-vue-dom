import observe from "./observe";

function defineReactiveData(data, key, value) {
  // value可能也是一个对象
  observe(value)
  Object.defineProperty(data, key, {
    get() {
      console.log("响应式数据：获取", value);
      return value;
    },
    set(newValue) {
      console.log("响应式数据：设置", value);
      if(newValue==value) return;
      // newValue可能也是一个对象
      observe(newValue)
      value = newValue;
    },
  });
}
export default defineReactiveData;
