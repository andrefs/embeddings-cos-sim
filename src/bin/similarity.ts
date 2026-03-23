import { buildCosSimFn, loadVec } from "../lib/cosSim";
import { getEmbeddingConfig } from "../lib/utils";
import { Command } from 'commander';

export function registerSimilarity(program: Command) {
  program
    .command('similarity')
    .description('Compute cosine similarity between two words')
    .argument('<embeddingName>', 'name of the embedding model')
    .argument('<word1>', 'first word')
    .argument('<word2>', 'second word')
    .option('-e, --embedding <name>', 'specify embedding name (alternative syntax)')
    .action(async (embeddingName: string, word1: string, word2: string, options: { embedding?: string }) => {
      // Handle both positional and option-based embedding name
      const finalEmbeddingName = options.embedding || embeddingName;

      const config = await getEmbeddingConfig(finalEmbeddingName);
      if (!config) {
        console.error(`Embedding '${finalEmbeddingName}' not found.`);
        process.exit(1);
      } else {
        const db = await loadVec(config.levelPath);
        const cosSim = await buildCosSimFn(db);
        const result = await cosSim(word1, word2);
        console.log(result);
      }
    });
}
