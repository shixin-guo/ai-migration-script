#!/usr/bin/env node
import { program } from 'commander';
import * as fs from 'fs';
import { GPT } from './llm';
import config from './config';
import IOHandler from './io-handler';
import path from 'path';
import { parseVueFile } from './vuePipeline';

function removeJsonTags(input: string): string {
  return input.replace(/^```(json|css|html)|```$/gm, '');
}


async function main() {
  const chat = new GPT({
    apiKey: config.GATEWAY_TOKEN,
    temperature: 0.1,
    maxTokens: 20000,
    model: 'claude-3-5-sonnet-20240620',
  });

  const ioHandler = new IOHandler();
  ioHandler.printWelcomeMessage('vue2 ==> vue3');

  const translate = async(content: any) => {
    const parsedContent = parseVueFile(content);

    // const tempRes = await chat.invoke([new HumanMessage(
    //   `You are a code translator who will translate a chunk of VUE2 JS code to a corresponding VUE3 JS code. You will just translate and output the VUE3 JS code directly without a preamble.
    //     The VUE2 code is
    //     <START VUE2>
    //     ${parsedContent.template}
    //     </END VUE2>
    //     NOTE: you are only given a chunk of VUE2 JS code, NOT complete code, and you will ONLY output the corresponding VUE3 code chunk, NOT complete code.
    //     Now, the translated VUE3 code is
    //   `)]);
    // const scriptRes = await chat.invoke([new HumanMessage(
    //   `You are a code translator who will translate a chunk of VUE2 JS code to a corresponding VUE3 JS code. You will just translate and output the VUE3 JS code directly without a preamble.
    //     The VUE2 code is
    //     <START VUE2>
    //     ${parsedContent.script}
    //     </END VUE2>
    //     NOTE: you are only given a chunk of VUE2 JS code, NOT complete code, and you will ONLY output the corresponding VUE3 code chunk, NOT complete code.
    //     Now, the translated VUE3 code is
    //   `)])
    const styleRes = parsedContent.styles
    const tempRes = parsedContent.template
    const scriptRes = parsedContent.script

    const stylesList = styleRes.map(r => 
      `<style lang="${r.lang}" ${r.scoped? 'scoped' : ''}>
        ${r.content}
      </style>`)
    return `<template>${removeJsonTags(tempRes)}</template>
    <script lang="ts">${removeJsonTags(scriptRes)}</script>
    ${stylesList.map(s => s)}`
  }

  async function translateFile(filePath: string, targetPath: string): Promise<void> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const translated = await translate(content);
    
    await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.promises.writeFile(targetPath, translated);
    console.log(`Translated: ${filePath} -> ${targetPath}`);
  }
  
  async function translateFolder(source: string, target: string): Promise<void> {
    
    const items = await fs.promises.readdir(source, { withFileTypes: true });
    for (const item of items) {
      const sourcePath = path.join(source, item.name);
      const targetPath = path.join(target, item.name);
      if (item.isDirectory()) {
        await translateFolder(sourcePath, targetPath);
      } else if (item.isFile() && path.extname(sourcePath) === '.vue') {
        await translateFile(sourcePath, targetPath);
      }
    }
  }
  
  const sourceDir = 'demo'; // 原始文件夹
  const resultDir = 'result/zra'; // 结果文件夹
  await translateFolder(sourceDir, resultDir)
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
