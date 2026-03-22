import { modelToLevel, getEmbeddingConfig } from '../lib/utils';

function parseArgs() {
  const args = process.argv.slice(2);
  let verbose: boolean | 'progress' = false;
  let embeddingName: string | undefined;
  let modelPath: string | undefined;
  let levelPath: string | undefined;

  // Find and remove verbose flags
  const verboseIndex = args.findIndex(a => a === '-v' || a === '--verbose' || a === '-p' || a === '--progress');
  if (verboseIndex >= 0) {
    verbose = args[verboseIndex] === '-p' || args[verboseIndex] === '--progress' ? 'progress' : true;
    args.splice(verboseIndex, 1);
  }

  // Check for embedding flag
  const embeddingIndex = args.findIndex(a => a === '--embedding' || a === '-e');
  if (embeddingIndex >= 0) {
    if (args.length <= embeddingIndex + 1) {
      console.error('Usage: model-to-level --embedding <name> [-v|--verbose|-p|--progress]');
      process.exit(1);
    }
    embeddingName = args[embeddingIndex + 1] as string;
  } else {
    if (args.length < 2) {
      console.error('Usage: model-to-level <modelPath> <levelPath> [-v|--verbose|-p|--progress]');
      process.exit(1);
    }
    modelPath = args[0] as string;
    levelPath = args[1] as string;
  }

  return { embeddingName, modelPath, levelPath, verbose };
}

const { embeddingName, modelPath, levelPath, verbose } = parseArgs();

async function run() {
  if (embeddingName) {
    const config = await getEmbeddingConfig(embeddingName);
    if (!config) {
      console.error(`Embedding '${embeddingName}' not found.`);
      process.exit(1);
    }
    if (!config.modelPath || !config.levelPath) {
      console.error(`Embedding '${embeddingName}' does not have modelPath or levelPath defined.`);
      process.exit(1);
    }
    await modelToLevel(config.modelPath, config.levelPath, { verbose });
  } else {
    await modelToLevel(modelPath!, levelPath!, { verbose });
  }
  console.log('Done');
}

run().catch(err => console.error(err));
