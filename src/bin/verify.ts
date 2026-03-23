import { verifyLevelDb, getEmbeddingConfig } from '../lib/utils';
import { Command } from 'commander';

interface VerifyOptions {
  embedding?: string;
  path?: string;
}

export function registerVerify(program: Command) {
  program
    .command('verify')
    .description('Verify LevelDB contents and optionally check specific keys')
    .argument('[words...]', 'optional words to verify')
    .option('-e, --embedding <name>', 'specify embedding name')
    .option('-p, --path <levelPath>', 'specify level path directly')
    .action(async (words: string[], options: VerifyOptions) => {
      let actualLevelPath: string;
      if (options.embedding) {
        const config = await getEmbeddingConfig(options.embedding);
        if (!config) {
          console.error(`Embedding '${options.embedding}' not found.`);
          process.exit(1);
        }
        actualLevelPath = config.levelPath;
      } else if (options.path) {
        actualLevelPath = options.path;
      } else {
        console.error('Error: Must specify --embedding or --path');
        process.exit(1);
      }

      await verifyLevelDb(actualLevelPath, words);
      process.exit(0);
    });
}
