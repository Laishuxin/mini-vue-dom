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
    // value????????????????????????
    observe(value);
    Object.defineProperty(data, key, {
      get: function get() {
        // console.log("????????????????????????", value);
        return value;
      },
      set: function set(newValue) {
        // console.log("????????????????????????", value);
        if (newValue == value) return; // newValue????????????????????????

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

  //?????????????????????????????????????????????
  var ARR_METHODS = ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"];

  /* ??????Array????????????????????????????????????????????????
  *  push???????????????????????????????????????????????????????????????????????????
  *  ??????????????????????????????????????????????????????????????????????????????
  */

  var originArrMethods = Array.prototype; // ???????????????????????????arrMthods????????????originArrMethods

  var arrMethods = Object.create(originArrMethods);
  ARR_METHODS.map(function (m) {
    arrMethods[m] = function () {
      // arguments???????????????Array.prototype.slice.call??????????????????
      var args = Array.prototype.slice.call(arguments); // ???????????????????????????????????????
      // this????????????????????????????????????????????????[1,2,3].splice(0,1,3),this?????????[1,2,3]

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
      } // newArr????????????????????????????????????observeArr????????????????????????????????????observe??????


      newArr && observeArr(newArr);
      return rt;
    };
  });

  function Observer(data) {
    if (Array.isArray(data)) {
      // ???????????????__proto__
      data.__proto__ = arrMethods; // data?????????????????????????????????????????????????????????????????????????????????????????????????????????

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
    // ????????????????????????data
    var data = vm.$options.data; // data?????????????????????????????????????????????vm._data.xxx????????????

    data = typeof data === "function" ? data.call(vm) : data || {};
    vm._data = data;

    for (var key in data) {
      // ??????????????????vm._data.xxx??????vm.xxx?????????
      proxyData(vm, '_data', key);
    } // ???????????????_data


    observe(vm._data);
  }

  /*
    <div id="app" style="color: red; font-size: 20px">
      ?????? {{name}} {{info.students[0].name}}
      <span class="text" style="color: green">{{info.job}}</span>
      <p>??????</p>
    </div>
  */
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // ????????? <my-header></my-header>

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // <my:header></my:header>

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // <div

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // > />

  var startTagClose = /^\s*(\/?)>/; // </div>

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));
  /**
   * ????????? html ????????? ast???
   * ???????????? html???????????????????????????????????????
   * @param {string} html ?????? html
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
     * ?????????????????????
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
        /** ???????????? */

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
     * ??? html ???????????? `n` ??????
     * @param {number} n ??????????????????
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
     * ?????????????????? AST ???????????????
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
    ?????? {{name}} {{info.students[0].name}}
    <span class="text" style="color: green">{{info.job}}</span>
    <p>??????</p>
  </div>

  _c(
    'div',
    {'id': 'app', 'style': { 'color': 'red', 'font-size': '20px' }},
    _v('??????' + _s(name) + _s(info.students[0].name)),
    _c('span', { class: 'text', 'style': { 'color': 'green' }}, _v(_s(info.job))),
    _c('p', undefined, _v('??????'))
    )
  */
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  function generate(el) {
    return formatElementNode(el);
  }
  /**
   * _c() => createElement();       : ???????????????
   * _v() => createTextNode();      : ???????????????
   * _s() => {{ name }} => _s(name) : ????????????????????????
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
   * ????????????????????????
   * @param { object } node Ast - ???????????????
   * @example '?????? {{name}} hello' => '_v('?????? ' + _s(name) + ' hello')';
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
   * ??????????????????
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
   * ?????????????????????
   * @param { Array } children ????????????
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
   * ??? html string ????????? render ?????????
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
   * ????????????????????????
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
   * ????????????
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
      // ????????????
      el = document.createTextNode(text);
    }

    return el;
  }
  /**
   * ??????????????? attribute.
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
   * ?????? attribute.
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
   * ???????????????????????????
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
