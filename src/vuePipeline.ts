import compiler from 'vue-template-compiler';
export function parseVueFile(fileContent: string) {
  const parsed = compiler.parseComponent(fileContent);
  const result = {
    template: parsed.template?.content,
    script: parsed.script?.content,
    styles: parsed.styles,
  };
  return result;
}

