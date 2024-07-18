#!/usr/bin/env node
import { program } from 'commander';
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/hf_transformers';

import * as fs from 'fs';
import { GPT } from './llm';
import config from './config';
import CodebaseService from './codebase-service';
import { ChatHistory } from './chat-history';
import IOHandler from './io-handler';
import AIInputGenerator from './ai-input-generator';
import VectorStore from './vector-store';
import {
  HumanPrompt,
  SystemPrompt,
  embeddingsPrompt,
} from './prompt/diffProps';
import { ZoomUiDiff2 } from '../result/zoom-ui-diff/diff-result';
function removeJsonTags(input: string): string {
  return input.replace(/^```json|```$/gm, '');
}

async function main(cleanVectorStore: boolean) {
  const chatHistory = new ChatHistory(200);
  const chat = new GPT({
    apiKey: config.GATEWAY_TOKEN,
    temperature: 0.1,
    maxTokens: 20000,
    model: 'gpt-4',
  });
  const embeddings = new HuggingFaceTransformersEmbeddings({
    modelName: 'Xenova/all-MiniLM-L6-v2',
  });
  const ioHandler = new IOHandler();
  const codebase = new CodebaseService(
    new VectorStore(embeddings, config.vector_store_local_path),
    ioHandler,
    ['ai-dataset/vue2/**/*.md', 'ai-dataset/vue3/**/*.md'],
  );
  await codebase.init(cleanVectorStore);

  const aiInputGenerator = new AIInputGenerator(
    codebase,
    chatHistory,
    ioHandler,
  );

  ioHandler.printWelcomeMessage('running and comparing the Zoom UI Diff');

  // eslint-disable-next-line no-constant-condition
  // while (true) {
  //   const userInput = await ioHandler.getUserInput(
  //     '\nAsk your question (Enter a blank line to finish input): ',
  //   );
  //   if (userInput.toLowerCase() === 'quit') {
  //     break;
  //   }

  //   chatHistory.addMessage(new HumanMessage(userInput));

  //   try {
  //     ioHandler.showSpinner(true);
  //     const aiResponse = await chat.invoke(messages);
  //     ioHandler.showSpinner(false);

  //     const response = aiResponse;
  //     ioHandler.printAIResponse(response);
  //     chatHistory.addMessage(new AIMessage(response));

  //     // report token usage
  //     // const tokensUsed = await chat.getNumTokensFromMessages(messages);
  //     // totalTokensUsed += tokensUsed.totalCount;

  //     // const gpt35TurboPrice = 0.002;
  //     // const cost = (totalTokensUsed / 1000.0) * gpt35TurboPrice;

  //     // ioHandler.printTokenUsage(tokensUsed.totalCount, totalTokensUsed, cost);
  //   } catch (error: any) {
  //     ioHandler.showSpinner(false);
  //     ioHandler.printError(error);
  //   }
  // }
  // const userInput = await fs.readFileSync(
  //    path.resolve('src/prompt/findUnSupportComps.md'),
  //   'utf-8',
  // );

  //   const userQuestion = `
  //     You are provided source code of input-number components that use Vue2.
  //     Your task is to examine the <zm-input-number> input-number components.
  //     identify and compile a list of the properties, methods, and events.
  // `;
  // ZoomUiDiff2.Both_libraries
  // ZoomUiDiff2.Both_libraries.slice(0, 10)
  for (const name of ZoomUiDiff2.Both_libraries) {
    const messages = await aiInputGenerator.generateForChatModel(
      chat,
      HumanPrompt(name),
      SystemPrompt,
      embeddingsPrompt(name),
    );
    const aiResponse = await chat.invoke(messages);
    if (!fs.existsSync('result/zoom-ui-diff/ai-response')) {
      fs.mkdirSync('result/zoom-ui-diff/ai-response', { recursive: true });
    }
    // string convert from "Hight Text". to "hight-text"
    fs.writeFileSync(
      `result/zoom-ui-diff/ai-response/${name
        .toLowerCase()
        .replace(/\s+/g, '-')}.json`,
      removeJsonTags(aiResponse),
    );
  }
  process.exit(0);
}

program.option(
  '-c, --clean-vector-store',
  'Start with a new clean vector store',
);

program.parse();

main(program.opts().cleanVectorStore || false).catch((error) => {
  console.error(error);
});
