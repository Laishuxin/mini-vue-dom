/**
 * 打补丁。
 * @param { HTMLElement } oldNode 
 * @param { object  vnode 
 */
function patch (oldNode, vnode) {
  const el = createElement(vnode);

  const parent = oldNode.parentNode;
  parent.insertBefore(el, oldNode);
  parent.removeChild(oldNode);
}

function createElement (vnode) {
  const { tag, props, children, text } = vnode
  let el;
  if (typeof tag === 'string') {
    el = vnode.el = document.createElement(tag);
    updateProps(vnode.el, props);

    children.forEach(child => {
      vnode.el.appendChild(createElement(child));
    })
  } else { // 文本结点
    el = document.createTextNode(text);
  }
  
  return el;
}

/**
 * 为元素追加 attribute.
 * @param { HTMLElement } el 
 * @param { object } props 
 */
function updateProps (el, props) {
  for (const key in props) {
    if (Object.hasOwnProperty.call(props, key)) {
      const value = props[key];
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
function setAttribute (el, key, value) {
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

export {
  patch,
}