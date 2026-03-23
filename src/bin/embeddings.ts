import { loadUserConfig, addEmbeddingToUserConfig, removeEmbeddingFromUserConfig, listEmbeddings } from '../lib/utils';
import type { EmbeddingConfig } from '../lib/utils';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: embeddings-cos-sim-embeddings <list|add|remove> [options]');
    process.exit(1);
  }

  const command = args[0];

  switch (command) {
    case 'list': {
      const embeddings = await listEmbeddings();
      if (embeddings.length === 0) {
        console.log('No custom embeddings registered.');
      } else {
        console.log('Registered embeddings:');
        for (const emb of embeddings) {
          console.log(`  - ${emb.name}: ${emb.description}`);
          console.log(`    LevelDB: ${emb.levelPath}`);
          if (emb.modelPath) console.log(`    Model: ${emb.modelPath}`);
          if (emb.url) console.log(`    URL: ${emb.url}`);
        }
      }
      break;
    }

     case 'add': {
       if (args.length < 3) {
         console.error('Usage: embeddings-cos-sim-embeddings add <name> <levelPath> [--model <modelPath>] [--url <url>] [--desc <description>]');
         process.exit(1);
       }
      const name = args[1]!;
      const levelPath = args[2]!;
      const options = parseOptions(args.slice(3));
      const modelPath = options['--model'] ?? options['-m'];
      const url = options['--url'] ?? options['-u'];
      const description = options['--desc'] ?? options['-d'] ?? `Custom embedding ${name}`;

      const config: EmbeddingConfig = {
        name,
        description,
        levelPath,
        modelPath,
        url,
        dimension: undefined
      };

      await addEmbeddingToUserConfig(config);
      console.log(`Added embedding '${name}'`);
      break;
    }

     case 'remove': {
       if (args.length < 2) {
         console.error('Usage: embeddings-cos-sim-embeddings remove <name>');
         process.exit(1);
       }
      const name = args[1]!;
      await removeEmbeddingFromUserConfig(name);
      console.log(`Removed embedding '${name}' (if it existed)`);
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

function parseOptions(argArray: string[]): Record<string, string | undefined> {
  const options: Record<string, string | undefined> = {};
  for (let i = 0; i < argArray.length; i++) {
    const arg = argArray[i]!;
    if (arg.startsWith('--') || arg.startsWith('-')) {
      if (i + 1 < argArray.length) {
        const next = argArray[i + 1]!;
        if (!next.startsWith('--') && !next.startsWith('-')) {
          options[arg] = next;
          i++; // skip the value
          continue;
        }
      }
      options[arg] = undefined;
    }
  }
  return options;
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
