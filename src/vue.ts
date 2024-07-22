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
        NOTE: only return the template part ,and NOT wrap by <template> tag. you are only given a chunk of VUE2 JS code, NOT complete code, and you will ONLY output the corresponding VUE3 code chunk, NOT complete code.
        Now, the translated VUE3 code is
      `)]);
    const scriptRes = parsedContent.script && await chat.invoke([new HumanMessage(
      `You are a code translator who will translate a chunk of VUE2 javascript code to a corresponding VUE3 typescript code. You will just translate and output the VUE3 JS code directly without a preamble.
        The VUE2 code is
        <START VUE2>
        ${parsedContent.script}
        </END VUE2>
        NOTE: you are only given a chunk of VUE2 JS code, NOT complete code, and you will ONLY output the corresponding VUE3 code chunk, NOT complete code.
        Now, Do not use the <script setup> language feature , we need use composition api  the translated VUE3 code is
      `)])
    const styleRes = parsedContent.styles
    // const tempRes = parsedContent.template
    // const scriptRes = parsedContent.script

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
        NOTE: you are only given a chunk of JS code, NOT complete code, and you will ONLY output the corresponding typescript code chunk, NOT complete code.
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
