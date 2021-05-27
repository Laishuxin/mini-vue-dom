/*
  <div id="app" style="color: red; font-size: 20px">
    你好 {{name}} {{info.students[0].name}}
    <span class="text" style="color: green">{{info.job}}</span>
    <p>学习</p>
  </div>
*/

const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// 标签名 <my-header></my-header>
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
// <my:header></my:header>
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
// <div
const startTagOpen = new RegExp(`^<${qnameCapture}`)
// > />
const startTagClose = /^\s*(\/?)>/
// </div>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

/**
 * 将模板 html 转换为 ast。
 * 不断截取 html，并进行解析成抽象语法树。
 * @param {string} html 模板 html
 */
function parseHtmlToAst (html) {
  let root = null;
  let  currentParent = null;
  const stack = [];  

  while (html) {
    let textEnd = html.indexOf('<');
    let text = null;

    if (textEnd === 0) {
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      
      const endTagMatch = html.match(endTag);
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
  function parseStartTag () {
    const start = html.match(startTagOpen);

    /** @type {Array | null} @example [] */
    let end = null;
    /** @type {Array | null}; @example [' id="app"', 'id', '=', 'app'] */
    let attrs = null;

    if (start) {
      /** @example ['<div', 'div', ...] */
      const match = {
        tagName: start[1],
        attrs: [],
      }
      advance(start[0].length);
      
      /** 匹配属性 */
      
      while (!(end = html.match(startTagClose)) && 
        (attrs = html.match(attribute))) {
        
        const attr = {}
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
  function advance (n) {
    html = html.substring(n);
  }
  
  function start (tagName, attrs) {
    const element = createASTElement(tagName, attrs);
    if (!root) {
      root = element;
    }
    
    currentParent = element;
    stack.push(element);
  }

  function end (tagName) {
    const element = stack.pop();
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
  function chars (text) {
    text = text.trim();
    if (text.length > 0) {
      currentParent.children.push({
        text,
        type: 3,
      })
    }
  }

  function createASTElement (tagName, attrs, parent = undefined) {
    return {
      tag: tagName,
      type: 1,
      children: [],
      attrs,
      parent
    }
  }
  
  return root;
}

export { 
  parseHtmlToAst,
}