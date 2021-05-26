import { parseHtmlToAst} from './astParser';

/**
 * 将 html string 转化为 render 函数。
 * @param {string} html html string with template.
 */
function compileToRenderFunction (html) {
  // console.log(html);
  
  const ast = parseHtmlToAst(html);
  console.log('compiler.index: ', ast);
}

export {
  compileToRenderFunction,
}
