import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { Embeddings } from '@langchain/core/embeddings';
import type { Document as LC_Document } from '@langchain/core/documents';
class VectorStore {
  private vectorStore: HNSWLib | undefined;
  private embeddings: Embeddings;
  private localStoragePath: string;

  constructor(embeddings: Embeddings, localStoragePath: string) {
    this.embeddings = embeddings;
    this.localStoragePath = localStoragePath;
  }
  async similaritySearch(query: string, k: number): Promise<LC_Document[]> {
    if (!this.vectorStore) {
      throw new Error('Vector store is undefined');
    }

    // Results are sorted by similarity
    return await this.vectorStore.similaritySearch(query, k);
  }

  async load(): Promise<void> {
    this.vectorStore = await HNSWLib.load(
      this.localStoragePath,
      this.embeddings,
    );
  }

  async save(): Promise<void> {
    if (!this.vectorStore) {
      throw new Error('Vector store is undefined');
    }

    await this.vectorStore.save(this.localStoragePath);
  }

  getVectorCount(): number {
    if (!this.vectorStore) {
      throw new Error('Vector store is undefined');
    }
    return this.vectorStore.index.getCurrentCount();
  }

  async recreateVectorsFromTexts(
    texts: string[],
    metadatas: object[] | object,
  ): Promise<HNSWLib> {
    this.vectorStore = await HNSWLib.fromTexts(
      texts,
      metadatas,
      this.embeddings,
    );
    return this.vectorStore;
  }
}

export default VectorStore;
