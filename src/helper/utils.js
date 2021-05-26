/**
 * 添加属性到 attrs 中。
 * @param {Object} attrs 
 * @param {string} key 
 * @param {string} value 
 */
function addAttr (attrs, key, value) {
  if (!attrs || value === undefined || value === null) return;
  
  if (key === 'style') {
    attrs[key] = value;
  } else {
    attrs[key] = value;
  }
  
}

export{
  addAttr,
}

