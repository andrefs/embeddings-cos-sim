import { buildCosSimFn, loadVec } from "../lib/cosSim";
import { getEmbeddingConfig } from "../lib/utils";

function parseArgs(): { embeddingName: string; word1: string; word2: string } {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: we-cos-sim <embedding> <word1> <word2> OR we-cos-sim --embedding <name> <word1> <word2>');
    process.exit(1);
  }

  let embeddingName: string;
  let word1: string;
  let word2: string;

  if (args[0] === '--embedding' || args[0] === '-e') {
    if (args.length < 4) {
      console.error('Usage: we-cos-sim --embedding <name> <word1> <word2>');
      process.exit(1);
    }
    embeddingName = args[1]!;
    word1 = args[2]!;
    word2 = args[3]!;
  } else {
    embeddingName = args[0]!;
    word1 = args[1]!;
    word2 = args[2]!;
  }

  return { embeddingName, word1, word2 };
}

const { embeddingName, word1, word2 } = parseArgs();

async function run() {
  const config = await getEmbeddingConfig(embeddingName);
  if (!config) {
    console.error(`Embedding '${embeddingName}' not found.`);
    process.exit(1);
  } else {
    const db = await loadVec(config.levelPath);
    const cosSim = await buildCosSimFn(db);
    const result = await cosSim(word1, word2);
    console.log(result);
  }
}

run().catch(err => console.error(err));
