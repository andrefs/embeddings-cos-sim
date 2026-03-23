import { getVec, getEmbeddingConfig } from '../lib/utils';
import { loadVec } from '../lib/cosSim';
import { Command } from 'commander';

interface GetOptions {
  embedding?: string;
  path?: string;
  json?: boolean;
}

export function registerGet(program: Command) {
  program
    .command('get')
    .description('Get vector values for a key')
    .argument('<key>', 'key to look up')
    .option('-e, --embedding <name>', 'embedding name')
    .option('-p, --path <levelPath>', 'LevelDB path directly')
    .option('-j, --json', 'output as JSON')
    .action(async (key: string, options: GetOptions) => {
      let levelPath: string;
      
      if (options.embedding) {
        const config = await getEmbeddingConfig(options.embedding);
        if (!config) {
          console.error(`Embedding '${options.embedding}' not found.`);
          process.exit(1);
        }
        levelPath = config.levelPath;
      } else if (options.path) {
        levelPath = options.path;
      } else {
        console.error('Error: Must specify --embedding or --path');
        process.exit(1);
      }

      const db = await loadVec(levelPath);
      const vec = await getVec(db, key);
      
      if (!vec) {
        console.error(`Key '${key}' not found`);
        process.exit(1);
      }

      if (options.json) {
        console.log(JSON.stringify({ key, vector: vec }));
      } else {
        console.log(`${key}: [${vec.join(', ')}]`);
      }
    });
}
