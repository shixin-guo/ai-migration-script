import compiler from 'vue-template-compiler';
export function parseVueFile(fileContent: string) {

  const parsed = compiler.parseComponent(fileContent);

  if (!parsed.template || !parsed.script || !parsed.styles) {
    throw new Error(
      'The .vue file format is incorrect. It must contain template, script, and style sections.',
    );
  }

  const result = {
    template: parsed.template.content,
    script: parsed.script.content,
    styles: parsed.styles,
  };
  return result;
}

