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

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function defineReactiveData(data, key, value) {
    // value可能也是一个对象
    observe(value);
    Object.defineProperty(data, key, {
      get: function get() {
        // console.log("响应式数据：获取", value);
        return value;
      },
      set: function set(newValue) {
        // console.log("响应式数据：设置", value);
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
          var attr = {};
          attr.name = attrs[1];
          attr.value = attrs[3] || attrs[4] || attrs[5];
          match.attrs.push(attr);
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

  /*
  id="app" style="color: red; font-size: 20px">
    你好 {{name}} {{info.students[0].name}}
    <span class="text" style="color: green">{{info.job}}</span>
    <p>学习</p>
  </div>

  _c(
    'div',
    {'id': 'app', 'style': { 'color': 'red', 'font-size': '20px' }},
    _v('你好' + _s(name) + _s(info.students[0].name)),
    _c('span', { class: 'text', 'style': { 'color': 'green' }}, _v(_s(info.job))),
    _c('p', undefined, _v('学习'))
    )
  */
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  function generate(el) {
    return formatElementNode(el);
  }
  /**
   * _c() => createElement();       : 解析元素。
   * _v() => createTextNode();      : 解析文本。
   * _s() => {{ name }} => _s(name) : 解析插值表达式。
   * @param {Object} el abstract syntax tree.
   * @returns { string } formatted code.
   */


  function formatElementNode(el) {
    // console.log(`generate.js ast:`, el);
    var tagName = el.tag;
    var attrsStr = formatAttrs(el.attrs);
    var childrenStr = formatChildren(el.children);
    childrenStr = childrenStr ? ",".concat(childrenStr) : '';
    var code = "_c('".concat(tagName, "', ").concat(attrsStr).concat(childrenStr, ")"); // console.log(`generate.js code: `, code)

    return code;
  }
  /**
   * 格式化文本结点。
   * @param { object } node Ast - 文本结点。
   * @example '你好 {{name}} hello' => '_v('你好 ' + _s(name) + ' hello')';
   * @returns { string } formatted string.
   */


  function formatTextNode(node) {
    // console.log(`generate.js formatTextNode: `, node);
    var tokens = [];
    var index = 0;
    var lastIndex = defaultTagRE.lastIndex = 0; // set 0.

    var match;
    var text = node.text;

    while (match = defaultTagRE.exec(text)) {
      index = match.index;

      if (index > lastIndex) {
        tokens.push(JSON.stringify(text.slice(lastIndex, index)));
      }

      tokens.push("_s(".concat(match[1].trim(), ")"));
      lastIndex = index + match[0].length;
    }

    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)));
    }

    return "_v(".concat(tokens.join('+'), ")");
  }
  /**
   * 格式化属性。
   * @param { Array } attrs attributes.
   * @example [{name: 'id', value: 'app'},
   *           {name: 'style', value: 'color:red; font-size: 20px'}]
   *       => { 'id': 'app', 'style': { 'color': 'red; 'font-size': '20px' }}
   * @returns { string } formatted string.
   */


  function formatAttrs(attrs) {
    var result = attrs.reduce(function (prev, curr) {
      var name = curr.name.trim();
      var value = curr.value.trim();

      if (name === 'style') {
        prev += "".concat(name, ": ").concat(JSON.stringify(_styleToObject(value)), ",");
      } else {
        prev += "".concat(name, ": ").concat(JSON.stringify(value), ",");
      }

      return prev;
    }, '');
    /**
     * @param { string } styleStr Like 'color: red; font-size: 20px'
     * @returns { Object } Like: { color: 'red', 'font-size': '20px' }
     */

    function _styleToObject(styleStr) {
      var result = {};
      var styles = styleStr.split(';');
      styles.forEach(function (style) {
        var _style$split = style.split(':'),
            _style$split2 = _slicedToArray(_style$split, 2),
            key = _style$split2[0],
            value = _style$split2[1];

        result[key.trim()] = value.trim();
      });
      return result;
    } // console.log(`generate.js formatAttrs`,  `{${result.slice(0, -1)}}`);


    return "{".concat(result.slice(0, -1), "}");
  }
  /**
   * 格式化子结点。
   * @param { Array } children 子结点。
   * @returns { string } formatted string.
   */


  function formatChildren(children) {
    if (!children) return '';
    var tokens = children.map(function (child) {
      var type = child.type;

      if (type === 1) {
        return formatElementNode(child);
      } else if (type === 3) {
        return formatTextNode(child);
      }
    });
    return tokens.join(',');
  }

  /**
   * 将 html string 转化为 render 函数。
   * @param {string} html html string with template.
   */

  function compileToRenderFunction(html) {
    var ast = parseHtmlToAst(html);
    var code = generate(ast); // console.log('compiler.index: ', ast);
    // console.log(`index.js code: `, code);

    var render = new Function("with (this) { return ".concat(code, "; }")); // console.log(`index.js render: `);
    // console.log(render);

    return render;
  }

  function mountComponent(vm) {
    vm._update(vm._render());
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

      mountComponent(vm);
    };
  }

  /**
   * 打补丁。
   * @param { HTMLElement } oldNode 
   * @param { object  vnode 
   */
  function patch(oldNode, vnode) {
    var el = createElement$1(vnode);
    var parent = oldNode.parentNode;
    parent.insertBefore(el, oldNode);
    parent.removeChild(oldNode);
  }

  function createElement$1(vnode) {
    var tag = vnode.tag,
        props = vnode.props,
        children = vnode.children,
        text = vnode.text;
    var el;

    if (typeof tag === 'string') {
      el = vnode.el = document.createElement(tag);
      updateProps(vnode.el, props);
      children.forEach(function (child) {
        vnode.el.appendChild(createElement$1(child));
      });
    } else {
      // 文本结点
      el = document.createTextNode(text);
    }

    return el;
  }
  /**
   * 为元素追加 attribute.
   * @param { HTMLElement } el 
   * @param { object } props 
   */


  function updateProps(el, props) {
    for (var key in props) {
      if (Object.hasOwnProperty.call(props, key)) {
        var value = props[key];
        setAttribute(el, key, value);
      }
    }
  }
  /**
   * 设置 attribute.
   * @param { HTMLElement } el 
   * @param { string } key 
   * @param { object | string} value 
   */


  function setAttribute(el, key, value) {
    switch (key) {
      case 'class':
        el.classList.add(value);
        break;

      case 'style':
        for (var sKey in value) {
          el.style[sKey] = value[sKey];
        }

        break;

      default:
        el.setAttribute(key, value);
    }
  }

  /**
   * 混入生命周期函数。
   * @param {Vue} Vue
   */

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this;
      patch(vm.$el, vnode);
    };
  }

  function createElement(tag) {
    var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }

    return vnode(tag, attrs, children);
  }

  function createText(text) {
    return vnode(undefined, undefined, undefined, text);
  }

  function vnode(tag, props, children, text) {
    return {
      tag: tag,
      props: props,
      children: children,
      text: text
    };
  }

  function renderMixin(Vue) {
    Vue.prototype._c = function ()
    /*tagName, attrs, ...children*/
    {
      return createElement.apply(void 0, arguments);
    };

    Vue.prototype._v = function (text) {
      return createText(text);
    };

    Vue.prototype._s = function (value) {
      if (value === null) return;
      return _typeof(value) === 'object' ? JSON.stringify(value) : value;
    };

    Vue.prototype._render = function () {
      var vm = this;
      var render = vm.$options.render;
      var vnode = render.call(vm);
      console.log("index.js vnode = ", vnode);
      return vnode;
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);
  lifecycleMixin(Vue);
  renderMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
