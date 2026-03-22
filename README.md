# we-cos-sim

we-cos-sim is a tool for calculating the cosine similarity between words (or nodes) using embeddings. It supports FastText word vectors as well as custom embeddings like Node2Vec and RDF2Vec.

## Features

- Download pre-trained FastText word vectors for different languages.
- Convert embedding models to LevelDB format for efficient querying.
- Calculate cosine similarity between words/nodes.
- Manage multiple embedding types with named configurations.

## Installation

To install the necessary dependencies, run:

```bash
npm install
```

To build the project and generate the `dist` directory:

```bash
npm run build
```

To install the global binaries (after building), you can run:

```bash
npm install -g .
```

## Managing Embeddings

### Listing Registered Embeddings

```bash
we-cos-sim-embeddings list
```

### Adding a Custom Embedding

Register a new embedding by providing a name and the path to its LevelDB:

```bash
we-cos-sim-embeddings add <name> <levelPath> [--model <modelPath>] [--url <url>] [--desc <description>]
```

- `<name>`: A unique identifier for the embedding (e.g., `node2vec-dbpedia`).
- `<levelPath>`: Path to the LevelDB directory containing the vectors.
- `--model`: (optional) Path to the source vector file (for re-conversion).
- `--url`: (optional) URL to download the source file.
- `--desc`: (optional) Human-readable description.

Example:

```bash
we-cos-sim-embeddings add node2vec-dbpedia ~/.we-cos-sim/level/node2vec.lvl --model ~/.we-cos-sim/vectors_dbpedia_Node2Vec.txt.gz
```

### Removing an Embedding

```bash
we-cos-sim-embeddings remove <name>
```

## CLI Usage

### Downloading a Model

Download a FastText model for a specific language:

```bash
we-cos-sim-download <lang>
```

Or using an embedding name:

```bash
we-cos-sim-download --embedding <name>
```

Replace `<lang>` with the desired language code (e.g., `en` for English).

### Converting Model to LevelDB

Convert a downloaded model to LevelDB format:

```bash
we-cos-sim-level <modelPath> <levelPath> [-v|--verbose|-p|--progress]
```

Or using an embedding configuration:

```bash
we-cos-sim-level --embedding <name> [-v|--verbose|-p|--progress]
```

- `<modelPath>`: Path to the `.vec.gz` or `.vec` file.
- `<levelPath>`: Path where the LevelDB should be stored.
- `--embedding <name>`: Use a registered embedding config instead of specifying paths.

### Calculating Cosine Similarity

To calculate the cosine similarity between two words/nodes:

```bash
we-cos-sim <embedding> <word1> <word2>
```

Or with an explicit flag:

```bash
we-cos-sim --embedding <name> <word1> <word2>
```

- `<embedding>`: Language code (for FastText) or a registered embedding name.
- `<word1>` and `<word2>`: The words (or node identifiers) to compare.

For node embeddings like DBpedia resources, include the full URI:

```bash
we-cos-sim --embedding node2vec-dbpedia "http://dbpedia.org/resource/Damir_Šovšić__4" "http://dbpedia.org/resource/Émile_Amélineau"
```

### Verifying a LevelDB

Check the contents of a LevelDB:

```bash
we-cos-sim-verify <levelPath> [word1] [word2] ...
```

Or using an embedding:

```bash
we-cos-sim-verify --embedding <name> [word1] [word2] ...
```

## Usage as a Library

First, load a vector model into a LevelDB instance:

```typescript
import { loadVec } from "we-cos-sim/lib/cosSim";
import { getEmbeddingConfig } from "we-cos-sim/lib/utils";

async function loadModel(embeddingName: string) {
  const config = await getEmbeddingConfig(embeddingName);
  if (!config) {
    throw new Error(`Embedding not found: ${embeddingName}`);
  }
  const db = await loadVec(config.levelPath);
  return db;
}
```

Then calculate cosine similarity:

```typescript
import { buildCosSimFn } from "we-cos-sim/lib/cosSim";

async function calculateSimilarity(db, word1: string, word2: string) {
  const cosSim = await buildCosSimFn(db);
  const similarity = await cosSim(word1, word2);
  console.log(`Cosine similarity between "${word1}" and "${word2}":`, similarity);
}

// Example
loadModel('en').then(db => calculateSimilarity(db, "hello", "world"));
```

You can also create an embedding configuration programmatically:

```typescript
import { getEmbeddingConfig } from 'we-cos-sim/lib/utils';

const config = await getEmbeddingConfig('node2vec-dbpedia');
// config.levelPath gives the LevelDB location, etc.
```

## Testing

To run the tests:

```bash
npm test
```

The test suite includes unit tests for the cosine similarity function and a sample LevelDB.

## License

This project is licensed under the ISC License.

## Author

André Santos
