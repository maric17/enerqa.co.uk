export type Document = { id: string; content: string; metadata: any; embedding?: number[] };

export class VectorStore {
  documents: Document[] = [];

  constructor(initialDocs?: Document[]) {
    if (initialDocs) {
      this.documents = initialDocs;
    }
  }

  // Simplified cosine similarity
  static cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
  }

  // Fallback lexical search if embeddings aren't generated
  lexicalSearch(query: string, topK: number = 3, filter?: (m: any) => boolean) {
    const q = query.toLowerCase();
    const scored = this.documents
      .filter(d => (filter ? filter(d.metadata) : true))
      .map(d => {
        const c = d.content.toLowerCase();
        let score = 0;
        if (c.includes(q)) score += 10;
        
        // Count matching words
        const words = q.split(' ');
        words.forEach(w => {
          if (w.length > 3 && c.includes(w)) score += 1;
        });

        return { doc: d, score };
      })
      .filter(res => res.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, topK);
  }

  async search(query: string, queryEmbedding: number[] | null, topK: number = 3, filter?: (m: any) => boolean) {
    // If no embedding was passed, fallback to lexical search
    if (!queryEmbedding) {
      return this.lexicalSearch(query, topK, filter);
    }

    const scored = this.documents
      .filter(d => (filter ? filter(d.metadata) : true))
      .filter(d => d.embedding !== undefined)
      .map(d => ({
        doc: d,
        score: VectorStore.cosineSimilarity(queryEmbedding, d.embedding!)
      }))
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, topK);
  }
}
