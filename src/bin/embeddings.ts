import { loadUserConfig, addEmbeddingToUserConfig, removeEmbeddingFromUserConfig, listEmbeddings } from '../lib/utils';
import type { EmbeddingConfig } from '../lib/utils';
import { Command } from 'commander';

export function registerEmbeddings(program: Command) {
  const embeddings = program
    .command('embeddings')
    .description('Manage custom embeddings');

  embeddings
    .command('list')
    .description('List all custom embeddings')
    .action(async () => {
      const list = await listEmbeddings();
      if (list.length === 0) {
        console.log('No custom embeddings registered.');
      } else {
        console.log('Registered embeddings:');
        for (const emb of list) {
          console.log(`  - ${emb.name}: ${emb.description}`);
          console.log(`    LevelDB: ${emb.levelPath}`);
          if (emb.modelPath) console.log(`    Model: ${emb.modelPath}`);
          if (emb.url) console.log(`    URL: ${emb.url}`);
        }
      }
    });

  embeddings
    .command('add')
    .description('Add a custom embedding')
    .argument('<name>', 'embedding name')
    .argument('<levelPath>', 'path to LevelDB')
    .option('-m, --model <path>', 'path to model file')
    .option('-u, --url <url>', 'download URL')
    .option('-d, --desc <description>', 'description')
    .action(async (name: string, levelPath: string, options: { model?: string; url?: string; desc?: string }) => {
      const config: EmbeddingConfig = {
        name,
        description: options.desc ?? `Custom embedding ${name}`,
        levelPath,
        modelPath: options.model,
        url: options.url,
        dimension: undefined
      };
      await addEmbeddingToUserConfig(config);
      console.log(`Added embedding '${name}'`);
    });

  embeddings
    .command('remove')
    .description('Remove a custom embedding')
    .argument('<name>', 'embedding name')
    .action(async (name: string) => {
      await removeEmbeddingFromUserConfig(name);
      console.log(`Removed embedding '${name}' (if it existed)`);
    });
}
