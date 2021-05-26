import defineReactiveData from './reactive'
import observeArr from './observeArr'
import {arrMethods} from './array'
function Observer(data){
    if(Array.isArray(data)){
        // 覆盖原本的__proto__
        data.__proto__=arrMethods
        // data是数组，数组内部可能出现对象或者数组，所以需要对数组内部每一项进行观察
        observeArr(data)
    }else{
        this.walk(data);
    }
}
Observer.prototype.walk=function(data){
    var keys=Object.keys(data);
    for(var i=0;i<keys.length;i++){
        var key=keys[i];
        var value=data[key];
        defineReactiveData(data,key,value);
    }
}

export default Observer;