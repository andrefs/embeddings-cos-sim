import { downloadModel, getEmbeddingConfig } from '../lib/utils';
import { Command } from 'commander';

export function registerDownload(program: Command) {
  program
    .command('download')
    .description('Download embedding model files')
    .argument('<embeddingName>', 'name of the embedding model')
    .option('-e, --embedding <name>', 'specify embedding name (alternative syntax)')
    .action(async (embeddingName: string, options: { embedding?: string }) => {
      const finalEmbeddingName = options.embedding || embeddingName;
      
      const config = await getEmbeddingConfig(finalEmbeddingName);
      if (!config) {
        console.error(`Embedding '${finalEmbeddingName}' not found.`);
        process.exit(1);
      }
      if (!config.url) {
        console.error(`Embedding '${finalEmbeddingName}' does not have a download URL.`);
        process.exit(1);
      }
      await downloadModel(config);
      console.log('Done');
    });
}
