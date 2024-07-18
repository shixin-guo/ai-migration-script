import { GlobOptionsWithFileTypesFalse, globSync } from 'glob';
import { TextLoader } from 'langchain/document_loaders/fs/text';

import * as fs from 'fs';
import IOHandler from './io-handler';
import VectorStore from './vector-store';

class CodebaseService {
  private vectorStore: VectorStore;
  private ioHandler: IOHandler;
  private filePaths: string[];

  constructor(
    vectorStore: VectorStore,
    ioHandler: IOHandler,
    filePaths: string[],
  ) {
    this.vectorStore = vectorStore;
    this.ioHandler = ioHandler;
    this.filePaths = filePaths;
  }

  async init(cleanStart: boolean): Promise<void> {
    if (cleanStart) {
      await this.refreshVectorStore();
    } else {
      try {
        await this.vectorStore.load();

        this.ioHandler.printInfo(
          `Vector store successfully loaded from file with ${this.vectorStore.getVectorCount()} vectors.`,
        );
      } catch (error) {
        this.ioHandler.printWarning(
          'Failed to load vector store from file. Creating a new one...',
        );
        await this.refreshVectorStore();
      }
    }

    // Periodically update the vector store
    setInterval(() => this.refreshVectorStore(), 10 * 60 * 1000); // Update every 10 minutes
  }

  find(
    patterns: string[],
    option: GlobOptionsWithFileTypesFalse = {},
  ): string[] {
    return globSync(patterns, option);
  }

  readFileContent(filePath: string): string {
    if (fs.statSync(filePath).isFile()) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    return '';
  }

  async findRelevantFiles(query: string): Promise<string[]> {
    const response = await this.vectorStore.similaritySearch(query, 4);
    return response.map((result) => result.metadata.source).filter(Boolean);
  }

  private async refreshVectorStore(): Promise<void> {
    const filesByFolder = this.filePaths.reduce((acc, folderPath) => {
      const files = this.find([folderPath], {
        ignore: ['**/node_modules/**', '*.scss', '*.css'],
      });

      acc[folderPath] = files;
      return acc;
    }, {} as Record<string, string[]>);
    const vectorStore = await this.vectorStore.recreateVectorsFromTexts(
      [JSON.stringify(filesByFolder)],
      {},
    );
    const allFilePaths = Object.values(filesByFolder).flat();
    for (const filePath of allFilePaths) {
      const loader = new TextLoader(filePath);
      const docs = await loader.load();
      const noEmptyDocs = docs.filter((doc) => doc.pageContent);
      await vectorStore.addDocuments(noEmptyDocs).catch((error) => {
        console.error(`Failed to add documents from ${filePath}:`, error);
      });
    }

    this.ioHandler.printInfo(
      `Vector store successfully refreshed with ${this.vectorStore.getVectorCount()} vectors.`,
    );

    // Save the vector store to file. But we don't need to wait for it.
    this.vectorStore.save();
  }
}

export default CodebaseService;
