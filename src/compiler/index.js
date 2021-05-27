import { parseHtmlToAst} from './astParser';
import { generate } from './generate'

/**
 * 将 html string 转化为 render 函数。
 * @param {string} html html string with template.
 */
function compileToRenderFunction (html) {
  const ast = parseHtmlToAst(html);
  const code = generate(ast);
  // console.log('compiler.index: ', ast);
  // console.log(`index.js code: `, code);
  const render = new Function (`with (this) { return ${code}; }`);
  // console.log(`index.js render: `);
  // console.log(render);
  return render;
}

export {
  compileToRenderFunction,
}