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

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

function generate (el) {
  return formatElementNode(el);
}

/**
 * _c() => createElement();       : 解析元素。
 * _v() => createTextNode();      : 解析文本。
 * _s() => {{ name }} => _s(name) : 解析插值表达式。
 * @param {Object} el abstract syntax tree.
 * @returns { string } formatted code.
 */
function formatElementNode (el) {
  // console.log(`generate.js ast:`, el);
  const tagName = el.tag;
  const attrsStr = formatAttrs(el.attrs);
  let childrenStr = formatChildren(el.children);
  childrenStr = childrenStr ? `,${childrenStr}` : '';

  const code = `_c('${tagName}', ${attrsStr}${childrenStr})`
  // console.log(`generate.js code: `, code)
  return code;
}

/**
 * 格式化文本结点。
 * @param { object } node Ast - 文本结点。
 * @example '你好 {{name}} hello' => '_v('你好 ' + _s(name) + ' hello')';
 * @returns { string } formatted string.
 */
function formatTextNode (node) {
  // console.log(`generate.js formatTextNode: `, node);
  const tokens = [];
  let index = 0;
  let lastIndex = defaultTagRE.lastIndex = 0;   // set 0.
  let match;
  let text = node.text;

  while(match = defaultTagRE.exec(text)) {
    index = match.index;
    if (index > lastIndex) {
      tokens.push(JSON.stringify(text.slice(lastIndex, index)));
    }

    tokens.push(`_s(${match[1].trim()})`);
    lastIndex = index + match[0].length;
  }
  
  if (lastIndex < text.length) {
    tokens.push(JSON.stringify(text.slice(lastIndex)));
  }
  return `_v(${tokens.join('+')})`;
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
  const result = attrs.reduce((prev, curr) => {
    const name = curr.name.trim();
    const value = curr.value.trim();
    if (name === 'style') {
      prev += `${name}: ${JSON.stringify(_styleToObject(value))},`
    } else {
      prev += `${name}: ${JSON.stringify(value)},`;
    }
    return prev;
  }, '');

  /**
   * @param { string } styleStr Like 'color: red; font-size: 20px'
   * @returns { Object } Like: { color: 'red', 'font-size': '20px' }
   */
  function _styleToObject (styleStr) {
    const result = {};
    const styles = styleStr.split(';');
    styles.forEach(style => {
      const [ key, value ] = style.split(':');
      result[key.trim()] = value.trim();
    })
    return result;
  }
  
  // console.log(`generate.js formatAttrs`,  `{${result.slice(0, -1)}}`);
  return `{${result.slice(0, -1)}}`;
}

/**
 * 格式化子结点。
 * @param { Array } children 子结点。
 * @returns { string } formatted string.
 */
function formatChildren(children) {
  if (!children) return '';

  const tokens = children.map(child => {
    const type = child.type;
    if (type === 1) {
      return formatElementNode(child);
    } else if (type === 3) {
      return formatTextNode(child);
    }
  });
  
  return tokens.join(',');
}

export {
  generate,
}