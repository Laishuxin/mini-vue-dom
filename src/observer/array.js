/* 重写Array原型链上所有可能改变原数组的方法
*  push新增的对象可能是对象或者数组，所以也需要进行观察，
*  原数组数据的更改，可能引起页面视图改变，所以也要观察
*/
import { ARR_METHODS } from "../config";
import observeArr from "./observeArr";
//originArrMethods获取到原型
var originArrMethods = Array.prototype;
// 创建新的对象实例，arrMthods的原型为originArrMethods
var arrMethods = Object.create(originArrMethods);

ARR_METHODS.map(function (m) {
  arrMethods[m] = function () {
    // arguments是类数组，Array.prototype.slice.call生成一个数组
    var args = Array.prototype.slice.call(arguments);
    // 原来数组的功能仍然需要保证
    // this指向调用数组方法本身的对象，例如[1,2,3].splice(0,1,3),this就指向[1,2,3]
    var rt = originArrMethods[m].apply(this, args);
    var newArr;
    switch (m) {
      case "push":
      case "unshift":
        newArr = args;
        break;
      case "splice":
        newArr = args.slice(2);
        break;
      default:
        break;
    }
    // newArr是一个数组，所以可以直接observeArr进行递归，而不需要进入到observe流程
    newArr && observeArr(newArr);
    return rt;
  };
});
export { arrMethods };
