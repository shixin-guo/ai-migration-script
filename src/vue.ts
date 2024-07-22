#!/usr/bin/env node
import { program } from 'commander';
import * as fs from 'fs';
import { GPT } from './llm';
import config from './config';
import IOHandler from './io-handler';
import path from 'path';
import { parseVueFile } from './vuePipeline';
import { HumanMessage } from '@langchain/core/messages';


const sourceDir = 'source-code/js'; // 原始文件夹
const resultDir = 'source-code/js'; // 结果文件夹


function removeJsonTags(input: string): string {
  return input.replace(/^```(json|css|html|vue|javascript|typescript|scss)|```$/gm, '');
}

async function countFilesInFolder(source: string): Promise<number> {
  let count = 0;
  const items = await fs.promises.readdir(source, { withFileTypes: true });
  for (const item of items) {
    const sourcePath = path.join(source, item.name);
    if (item.isDirectory()) {
      count += await countFilesInFolder(sourcePath);
    } else if (item.isFile() && supportLangs.includes(path.extname(sourcePath) as SupportLangs)) {
      count++;
    }
  }
  return count;
}

const supportLangs = ['.vue', '.js'] as const;
type SupportLangs = typeof supportLangs[number];
async function main() {
  const chat = new GPT({
    apiKey: config.GATEWAY_TOKEN,
    temperature: 0.1,
    maxTokens: 20000,
    model: 'claude-3-5-sonnet-20240620',
  });

  const ioHandler = new IOHandler();
  ioHandler.printWelcomeMessage('vue2 ==> vue3');

  const translateVue = async(content: any) => {
    const parsedContent = parseVueFile(content);
    console.log(parsedContent.template);
    console.log('-------------------');
    const tempRes = parsedContent.template && await chat.invoke([new HumanMessage(
      `You are a code translator who will translate a chunk of VUE2 javascript code to a corresponding VUE3 typescript code. You will just translate and output the VUE3 JS code directly without a preamble.
        The VUE2 code is
        <START VUE2>
        ${parsedContent.template}
        </END VUE2>
        ========================================
        NOTE: 
          1. only return the template part,and NOT wrap by <template> tag. 
          2. you are only given a chunk of VUE2 JS code, NOT complete code, and you will ONLY output the corresponding VUE3 code chunk, 
          3. $t and $tc should NOT be replaced, they are i18n functions
          4. $router $route they are router functions , replace them with vue-router functions
          5. <zm-{component}>  "zm-" is a prefix of component name , they have been imported in the script part global, NOT import them again
          NOT complete code.
        ========================================
        Now, the translated VUE3 code is
      `)]);
    const scriptRes = parsedContent.script && await chat.invoke([new HumanMessage(
      `You are a code translator who will translate a chunk of VUE2 javascript code to a corresponding VUE3 typescript code. You will just translate and output the VUE3 JS code directly without a preamble.
        The VUE2 code is
        <START VUE2>
        ${parsedContent.script}
        </END VUE2>
        ========================================
        NOTE: 
          1. you are only given a chunk of VUE2 JS code, NOT complete code, and you will ONLY output the corresponding VUE3 code chunk, NOT complete code.
          2. EventBus().$on() EventBus().$off() EventBus().$emit() has been refactored, now it use the mitt library, so should be replaced by EventBus().on() EventBus().off() EventBus().emit() and so on
          3. when using $t and $tc should NOT be replaced, they are i18n functions, use them after import them in the script part like this 
            <DEMO-CODE>
            import { useI18n } from "vue-i18n";
            const { t: $t } = useI18n();
            </DEMO-CODE>
          4. NOT delete the comments in the code.
          5. $message $notify have been move into ZmToast , so you need import ZmToast and use it instead of them, and keep the same config
             for example:
              <DEMO-CODE>
                import ZmToast from 'zm-toast';
                const { appContext } = getCurrentInstance(); // get appContext, already imported globally
                ZmToast(
                  {
                    type: "success", // success / info / warning / error
                    message: successMessage,
                    ...moreConfig,
                  },
                  appContext,
                );
              </DEMO-CODE>
            6. $alert、$confirm  $prompt move into ZmMessageBox, so you need import ZmMessageBox and use it instead of them, and keep the same config
                <DEMO-CODE>  
                  import { ZmMessageBox, ZmToast } from "@zoom/zoom-ui-vue3";
                    const {appContext} = getCurrentInstance()!
                      function open() {
                        ZmMessageBox.alert(
                          Message,
                          Title,
                          {
                            confirmButtonText: 'OK'
                          },
                          appContext // for i18n
                        )
                          .then((resolvedReason: Action) => {
                            console.log(resolvedReason)
                          })
                          .catch((rejectReason: Action) => {
                            console.log(rejectReason)
                          })
                      }
                  </DEMO-CODE>
          7. $router $route they are router functions ,import vue router and replace them with vue-router functions such as useRoute() useRouter() and so on
          8. .$set() .$delete() .$watch() should be replaced by the corresponding methods in the composition api
          9. Do not use the <script setup> language feature , we need use composition api  
        ========================================
        Now, the translated VUE3 code is
      `)])
    const styleRes = parsedContent.styles
    // const tempRes = parsedContent.template
    // const scriptRes = parsedContent.script

    // style no need to translate, need change by hand
    const stylesList = styleRes.map(r => 
      `<style lang="${r.lang}" ${r.scoped? 'scoped' : ''}>
        ${r.content}
      </style>`)
    const a = tempRes ? `<template>${removeJsonTags(tempRes)}</template>` : ''
    const b = scriptRes ? `<script lang="ts">${removeJsonTags(scriptRes)}</script>` : ''
    return `${a}
    ${b}
    ${stylesList.map(s => s).join('\n')}`
  }
  const translateJS = async(content: any) => {
    const tempRes = content && await chat.invoke([new HumanMessage(
      `You are a code translator who will translate a chunk of javascript code to a corresponding typescript code. You will just translate and output the typescript code directly without a preamble.
        The Javascript code is
        <START CODE>
        ${content}
        </END CODE>
        ========================================
        NOTE: 
          1. you are only given a chunk of JS code, NOT complete code, and you will ONLY output the corresponding typescript code chunk, NOT complete code. 
          2. NOT delete the comments in the code.
        ========================================
        Now, the translated code is
      `)]);
    return `${removeJsonTags(tempRes)}`
  }
  const translate = async (content: string, fileType: SupportLangs) => {
    if (fileType === '.vue') {
      return await translateVue(content);
    } else if (fileType === '.js') {
      return await translateJS(content);
    }
    return content;
  }

  async function translateFile(filePath: string, targetPath: string, fileType: SupportLangs): Promise<void> {
  
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const translated = await translate(content, fileType);
    
    await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.promises.writeFile(targetPath, translated);
    console.log(`Translated: ${filePath} -> ${targetPath}`);
  }
  
  async function translateFolder(source: string, target: string): Promise<void> {
    const totalFiles = await countFilesInFolder(source);
    let translatedFiles = 0;
    const items = await fs.promises.readdir(source, { withFileTypes: true });
    for (const item of items) {
      const sourcePath = path.join(source, item.name);
      const targetPath = path.join(target, item.name);
      if (item.isDirectory()) {
        await translateFolder(sourcePath, targetPath);
      } else if (item.isFile() && supportLangs.includes(path.extname(sourcePath) as SupportLangs)) {
        await translateFile(sourcePath, targetPath, path.extname(sourcePath) as SupportLangs);
        translatedFiles++;
        console.log(`Progress: ${translatedFiles}/${totalFiles} files translated.`);
      }
    }
  }
  
  console.time('Translation Time');
  await translateFolder(sourceDir, resultDir)
  console.timeEnd('Translation Time');
  console.log('Done！！！！！！');
  process.exit(0);
}

program.option(
  '-c, --clean-vector-store',
  'Start with a new clean vector store',
);

program.parse();

main().catch((error) => {
  console.error(error);
});
