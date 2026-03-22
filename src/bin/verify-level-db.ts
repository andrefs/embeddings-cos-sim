import { verifyLevelDb, getEmbeddingConfig } from '../lib/utils';

function parseArgs() {
  const args = process.argv.slice(2);
  let embeddingName: string | undefined;
  let levelPath: string | undefined;
  let words: string[] = [];

  const embeddingIndex = args.findIndex(a => a === '--embedding' || a === '-e');
  if (embeddingIndex >= 0) {
    if (args.length <= embeddingIndex + 1) {
      console.error('Usage: verify-level-db --embedding <name> [word1] [word2] ...');
      process.exit(1);
    }
    embeddingName = args[embeddingIndex + 1] as string;
    words = args.slice(embeddingIndex + 2) as string[];
  } else {
    if (args.length < 1) {
      console.error('Usage: verify-level-db <levelPath> [word1] [word2] ...');
      process.exit(1);
    }
    levelPath = args[0] as string;
    words = args.slice(1) as string[];
  }

  return { embeddingName, levelPath, words };
}

const { embeddingName, levelPath, words } = parseArgs();

async function run() {
  let actualLevelPath: string;
  if (embeddingName) {
    const config = await getEmbeddingConfig(embeddingName);
    if (!config) {
      console.error(`Embedding '${embeddingName}' not found.`);
      process.exit(1);
    }
    actualLevelPath = config.levelPath;
  } else {
    actualLevelPath = levelPath!;
  }

  await verifyLevelDb(actualLevelPath, words);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
