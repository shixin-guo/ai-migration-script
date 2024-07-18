import { AIMessage, HumanMessage } from '@langchain/core/messages';

import { GPT } from './llm';
import CodebaseService from './codebase-service';
import { ChatHistory } from './chat-history';
import IOHandler from './io-handler';

const TOKEN_LIMIT_FOR_CHAT_HISTORY = 1000;
const TOEKN_LIMIT_FOR_FILE_CONTENTS = 25000;

class AIInputGenerator {
  private codebaseService: CodebaseService;
  private chatHistory: ChatHistory;
  private ioHandler: IOHandler;

  constructor(
    codebaseService: CodebaseService,
    chatHistory: ChatHistory,
    ioHandler: IOHandler,
  ) {
    this.codebaseService = codebaseService;
    this.chatHistory = chatHistory;
    this.ioHandler = ioHandler;
  }

  async generateForChatModel(
    chatModel: GPT,
    userInput: string,
    systemPrompt: string,
    embeddingsPrompt: string,
  ) {
    // Find relevant files and read their contents
    const relevantFilePaths = await this.codebaseService.findRelevantFiles(
      embeddingsPrompt,
    );
    const fileContentMessages = await this.getMessagesForTokenLimit(
      chatModel,
      relevantFilePaths,
      TOEKN_LIMIT_FOR_FILE_CONTENTS,
    );

    // Send the last 1000 tokens of chat history to the AI
    const chatMessages = await this.chatHistory.getMessagesForTokenLimit(
      chatModel,
      TOKEN_LIMIT_FOR_CHAT_HISTORY,
    );
    const messages = [
      new AIMessage(systemPrompt),
      new HumanMessage(userInput),
      // new HumanMessage(
      //   `original vue2 code:
      //    code start >>>>>>>>>>>>>>>>
      //     ${code}
      //     <<<<<<<<<<<<<<<<< code end,
      //   `,
      // ),
      ...fileContentMessages,
      ...chatMessages,
    ];

    return messages;
  }

  private async getMessagesForTokenLimit(
    chatModel: GPT,
    filePaths: string[],
    tokenLimit: number,
  ): Promise<AIMessage[]> {
    let tokens = 0;
    const messages: AIMessage[] = [];
    for (const filePath of filePaths) {
      const content = this.codebaseService.readFileContent(filePath);
      const tokensUsed = await chatModel.getNumTokens(content);

      if (tokens + tokensUsed <= tokenLimit) {
        tokens += tokensUsed;
        messages.push(
          new AIMessage(`\nHere is the content of ${filePath}:\n\n${content}`),
        );
      } else {
        break;
      }
    }

    return messages;
  }
}

export default AIInputGenerator;
