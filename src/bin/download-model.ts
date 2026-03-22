import { downloadModel, getEmbeddingConfig } from '../lib/utils';

function parseArgs(): { embeddingName: string; hasFlag: boolean } {
  const args = process.argv.slice(2);
  let embeddingName: string;
  let hasFlag = false;

  const flagIndex = args.findIndex(a => a === '--embedding' || a === '-e');
  if (flagIndex >= 0) {
    hasFlag = true;
    if (args.length <= flagIndex + 1) {
      console.error('Usage: download-model --embedding <name>');
      process.exit(1);
    }
    embeddingName = args[flagIndex + 1] as string;
  } else {
    if (args.length < 1) {
      console.error('Usage: download-model [--embedding <name>] OR download-model <lang>');
      process.exit(1);
    }
    embeddingName = args[0] as string;
  }

  return { embeddingName, hasFlag };
}

const { embeddingName, hasFlag } = parseArgs();

async function run() {
  const config = await getEmbeddingConfig(embeddingName);
  if (!config) {
    console.error(`Embedding '${embeddingName}' not found.`);
    process.exit(1);
  }
  if (!config.url) {
    console.error(`Embedding '${embeddingName}' does not have a download URL.`);
    process.exit(1);
  }
  await downloadModel(config);
  console.log('Done');
}

run().catch(err => console.error(err));
