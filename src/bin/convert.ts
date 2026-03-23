import { modelToLevel, getEmbeddingConfig } from '../lib/utils';
import { Command } from 'commander';

export function registerConvert(program: Command) {
  program
    .command('convert')
    .description('Convert vector file to LevelDB')
    .argument('<modelPath>', 'path to vector model file')
    .argument('<levelPath>', 'path to output LevelDB')
    .option('-e, --embedding <name>', 'use embedding config instead of paths')
    .option('-v, --verbose', 'verbose output')
    .option('-p, --progress', 'show progress')
    .action(async (modelPath: string, levelPath: string, options: { embedding?: string; verbose?: boolean; progress?: boolean }) => {
      let actualModelPath = modelPath;
      let actualLevelPath = levelPath;

      if (options.embedding) {
        const config = await getEmbeddingConfig(options.embedding);
        if (!config) {
          console.error(`Embedding '${options.embedding}' not found.`);
          process.exit(1);
        }
        if (!config.modelPath || !config.levelPath) {
          console.error(`Embedding '${options.embedding}' does not have modelPath or levelPath defined.`);
          process.exit(1);
        }
        actualModelPath = config.modelPath;
        actualLevelPath = config.levelPath;
      }

      const verbose = options.verbose || options.progress ? (options.progress ? 'progress' : true) : false;
      await modelToLevel(actualModelPath, actualLevelPath, { verbose });
      console.log('Done');
    });
}
