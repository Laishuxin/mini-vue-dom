(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function proxyData(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function defineReactiveData(data, key, value) {
    // value可能也是一个对象
    observe(value);
    Object.defineProperty(data, key, {
      get: function get() {
        console.log("响应式数据：获取", value);
        return value;
      },
      set: function set(newValue) {
        console.log("响应式数据：设置", value);
        if (newValue == value) return; // newValue可能也是一个对象

        observe(newValue);
        value = newValue;
      }
    });
  }

  function observeArr(arr) {
    for (var i = 0; i < arr.length; i++) {
      observe(arr[i]);
    }
  }

  //所有会改变原数组内容的原生方法
  var ARR_METHODS = ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"];

  /* 重写Array原型链上所有可能改变原数组的方法
  *  push新增的对象可能是对象或者数组，所以也需要进行观察，
  *  原数组数据的更改，可能引起页面视图改变，所以也要观察
  */

  var originArrMethods = Array.prototype; // 创建新的对象实例，arrMthods的原型为originArrMethods

  var arrMethods = Object.create(originArrMethods);
  ARR_METHODS.map(function (m) {
    arrMethods[m] = function () {
      // arguments是类数组，Array.prototype.slice.call生成一个数组
      var args = Array.prototype.slice.call(arguments); // 原来数组的功能仍然需要保证
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
      } // newArr是一个数组，所以可以直接observeArr进行递归，而不需要进入到observe流程


      newArr && observeArr(newArr);
      return rt;
    };
  });

  function Observer(data) {
    if (Array.isArray(data)) {
      // 覆盖原本的__proto__
      data.__proto__ = arrMethods; // data是数组，数组内部可能出现对象或者数组，所以需要对数组内部每一项进行观察

      observeArr(data);
    } else {
      this.walk(data);
    }
  }

  Observer.prototype.walk = function (data) {
    var keys = Object.keys(data);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var value = data[key];
      defineReactiveData(data, key, value);
    }
  };

  function observe(data) {
    if (_typeof(data) !== 'object' || data === null) return;
    new Observer(data);
  }

  function initState(vm) {
    var options = vm.$options;

    if (options.data) {
      initData(vm);
    }
  }

  function initData(vm) {
    // 不污染用户原本的data
    var data = vm.$options.data; // data原本是一个方法，执行后可以通过vm._data.xxx这样获取

    data = typeof data === "function" ? data.call(vm) : data || {};
    vm._data = data;

    for (var key in data) {
      // 将对象访问从vm._data.xxx变成vm.xxx的形式
      proxyData(vm, '_data', key);
    } // 观察者模式_data


    observe(vm._data);
  }

  /**
   * 添加属性到 attrs 中。
   * @param {Object} attrs 
   * @param {string} key 
   * @param {string} value 
   */
  function addAttr(attrs, key, value) {
    if (!attrs || value === undefined || value === null) return;

    if (key === 'style') {
      attrs[key] = value;
    } else {
      attrs[key] = value;
    }
  }

  /*
    <div id="app" style="color: red; font-size: 20px">
      你好 {{name}} {{info.students[0].name}}
      <span class="text" style="color: green">{{info.job}}</span>
      <p>学习</p>
    </div>
  */

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 标签名 <my-header></my-header>

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // <my:header></my:header>

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // <div

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // > />

  var startTagClose = /^\s*(\/?)>/; // </div>

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));
  /**
   * 将模板 html 转换为 ast。
   * 不断截取 html，并进行解析成抽象语法树。
   * @param {string} html 模板 html
   */

  function parseHtmlToAst(html) {
    var root = null;
    var currentParent = null;
    var stack = [];

    while (html) {
      var textEnd = html.indexOf('<');
      var text = null;

      if (textEnd === 0) {
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      } else if (textEnd > 0) {
        text = html.substring(0, textEnd);

        if (text) {
          advance(text.length);
          chars(text);
          text = null;
        }
      }
    }
    /**
     * 解析开始标签。
     * @example <div> -> { tagName: 'div', attrs: []};
     * @example <div id="foo"> -> { tagName: 'div', attrs: {id: 'foo'} };
     */


    function parseStartTag() {
      var start = html.match(startTagOpen);
      /** @type {Array | null} @example [] */

      var end = null;
      /** @type {Array | null}; @example [' id="app"', 'id', '=', 'app'] */

      var attrs = null;

      if (start) {
        /** @example ['<div', 'div', ...] */
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length);
        /** 匹配属性 */

        while (!(end = html.match(startTagClose)) && (attrs = html.match(attribute))) {
          addAttr(match.attrs, attrs[1], attrs[3] || attrs[4] || attrs[5]);
          advance(attrs[0].length);
        }

        if (end) {
          advance(end[0].length);
          return match;
        }
      }
    }
    /**
     * 将 html 往前推进 `n` 步。
     * @param {number} n 前进的步数。
     */


    function advance(n) {
      html = html.substring(n);
    }

    function start(tagName, attrs) {
      var element = createASTElement(tagName, attrs);

      if (!root) {
        root = element;
      }

      currentParent = element;
      stack.push(element);
    }

    function end(tagName) {
      var element = stack.pop();
      currentParent = stack[stack.length - 1];

      if (currentParent) {
        element.parent = currentParent;
        currentParent.children.push(element);
      }
    }
    /**
     * 根据输入生成 AST 文本结点。
     * @param {string} text 
     */


    function chars(text) {
      text = text.trim();

      if (text.length > 0) {
        currentParent.children.push({
          text: text,
          type: 3
        });
      }
    }

    function createASTElement(tagName, attrs) {
      var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
      return {
        tag: tagName,
        type: 1,
        children: [],
        attrs: attrs,
        parent: parent
      };
    }

    return root;
  }

  /**
   * 将 html string 转化为 render 函数。
   * @param {string} html html string with template.
   */

  function compileToRenderFunction(html) {
    // console.log(html);
    var ast = parseHtmlToAst(html);
    console.log(`vue.js ast`, ast);
  }

  /**
   * 初始化混入函数。
   * @param { VueStatic } Vue
   */

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options;
      initState(vm);

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      var options = vm.$options;
      el = typeof el === 'string' ? document.querySelector(el) : el;
      vm.$el = el;

      if (!options.render) {
        var template = options.template || el.outerHTML;
        options.render = compileToRenderFunction(template);
      }
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
