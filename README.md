# we-cos-sim

A versatile tool for calculating cosine similarity using embeddings. Supports word embeddings (FastText) and graph-based node embeddings (Node2Vec, RDF2Vec), or any custom embeddings in the standard text vector format.

## Features

- Pre-configured embeddings: FastText word vectors, DBpedia Node2Vec, DBpedia RDF2Vec
- Support for custom embeddings via simple configuration
- Convert embedding files to LevelDB for fast lookups
- Calculate cosine similarity between any two keys (words or nodes)
- Unified interface for all embedding types

## Installation

```bash
npm install
npm run build
```

For global CLI access:

```bash
npm install -g .
```

## Built-in Embeddings

The following embeddings are pre-configured out of the box:

| Name | Type | Description |
|------|------|-------------|
| `fasttext-en`, `fasttext-de`, `fasttext-fr`, `fasttext-es` | Word | FastText Common Crawl vectors (300d) |
| `node2vec-dbpedia` | Node | DBpedia embeddings via Node2Vec (300d) |
| `rdf2vec-dbpedia` | Node | DBpedia embeddings via RDF2Vec (300d) |

## CLI Usage

### Calculate Similarity

```bash
we-cos-sim <embeddingName> <key1> <key2>
```

Or with an explicit flag:

```bash
we-cos-sim --embedding <name> <key1> <key2>
```

**Examples:**

```bash
# FastText word similarity
we-cos-sim fasttext-en king queen

# Node similarity (full URIs as keys)
we-cos-sim node2vec-dbpedia "http://dbpedia.org/resource/Paris" "http://dbpedia.org/resource/France"
```

### Download a Model

```bash
we-cos-sim-download <embeddingName>
```

This downloads the source file and converts it to LevelDB in one step.

**Example:**

```bash
we-cos-sim-download fasttext-en
```

### Convert Model to LevelDB

```bash
we-cos-sim-level <sourceFilePath> <targetLevelDbPath> [-v|--verbose|-p|--progress]
```

Or use a pre-configured embedding:

```bash
we-cos-sim-level --embedding <name> [-v|--verbose|-p|--progress]
```

**Examples:**

```bash
# With explicit paths
we-cos-sim-level vectors_dbpedia_Node2Vec.txt.gz ~/.we-cos-sim/level/node2vec.lvl -p

# With a predefined embedding
we-cos-sim-level --embedding node2vec-dbpedia -p
```

### Verify a LevelDB

```bash
we-cos-sim-verify <levelPath> [key1] [key2] ...
```

Or using a registered embedding:

```bash
we-cos-sim-verify --embedding <name> [key1] [key2] ...
```

### Manage Custom Embeddings

List all registered embeddings:

```bash
we-cos-sim-embeddings list
```

Add a custom embedding:

```bash
we-cos-sim-embeddings add <name> <levelPath> [--model <modelPath>] [--url <url>] [--desc <description>]
```

Remove a custom embedding:

```bash
we-cos-sim-embeddings remove <name>
```

**Example:**

```bash
we-cos-sim-embeddings add my-custom-emb ~/.we-cos-sim/level/myemb.lvl --model ~/downloads/myvectors.vec.gz --url "https://example.com/myvectors.vec.gz"
```

## Usage as a Library

```typescript
import { loadVec, buildCosSimFn } from "we-cos-sim/lib/cosSim";
import { getEmbeddingConfig } from "we-cos-sim/lib/utils";

async function example() {
  // Get config for a pre-defined embedding
  const config = await getEmbeddingConfig("fasttext-en");
  
  // Load the LevelDB
  const db = await loadVec(config.levelPath);
  
  // Build a similarity function
  const cosSim = await buildCosSimFn(db);
  
  // Compute similarity
  const score = await cosSim("king", "queen");
  console.log(`Similarity: ${score}`);
}

example();
```

## File Format

Embedding files should be in FastText `.vec` format:
- Plain text (gzip-compressed or not)
- Space-separated values
- First token is the key (word or URI)
- Remaining tokens are floating-point vector components

Example:
```
king 0.345 0.123 -0.456 ...(300 dimensions total)
queen 0.312 0.156 -0.389 ...
http://dbpedia.org/resource/Paris 0.234 -0.567 ...
```

## Paths

By default, configs and data are stored under `~/.we-cos-sim/`:

- `level/` - LevelDB databases
- `fasttext-vecs/` - downloaded FastText models
- `embeddings.json` - custom embedding configurations

Paths in embedding configs can be absolute or relative to `~/.we-cos-sim/`.

## Testing

```bash
npm test
```

## License

ISC

## Author

André Santos
