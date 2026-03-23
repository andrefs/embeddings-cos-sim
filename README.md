# embeddings-cos-sim

> **Note:** This project is the continuation of the now-defunct [we-cos-sim](https://github.com/andrefs/we-cos-sim) project, which was limited to word embeddings. This version supports any embedding type including graph-based node embeddings.

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
embeddings-cos-sim <embeddingName> <key1> <key2>
```

Or with an explicit flag:

```bash
embeddings-cos-sim --embedding <name> <key1> <key2>
```

**Examples:**

```bash
# FastText word similarity
embeddings-cos-sim fasttext-en king queen

# Node similarity (full URIs as keys)
embeddings-cos-sim node2vec-dbpedia "http://dbpedia.org/resource/Paris" "http://dbpedia.org/resource/France"
```

### Download a Model

```bash
embeddings-cos-sim-download <embeddingName>
```

This downloads the source file and converts it to LevelDB in one step.

**Example:**

```bash
embeddings-cos-sim-download fasttext-en
```

### Convert Model to LevelDB

```bash
embeddings-cos-sim-level <sourceFilePath> <targetLevelDbPath> [-v|--verbose|-p|--progress]
```

Or using a pre-configured embedding:

```bash
embeddings-cos-sim-level --embedding <name> [-v|--verbose|-p|--progress]
```

Or use a pre-configured embedding:

```bash
embeddings-cos-sim-level --embedding <name> [-v|--verbose|-p|--progress]
```

**Examples:**

```bash
# With explicit paths
embeddings-cos-sim-level vectors_dbpedia_Node2Vec.txt.gz ~/.embeddings-cos-sim/level/node2vec.lvl -p

# With a predefined embedding
embeddings-cos-sim-level --embedding node2vec-dbpedia -p
```

### Verify a LevelDB

```bash
embeddings-cos-sim-verify <levelPath> [key1] [key2] ...
```

Or using a registered embedding:

```bash
embeddings-cos-sim-verify --embedding <name> [key1] [key2] ...
```

### Manage Custom Embeddings

List all registered embeddings:

```bash
embeddings-cos-sim-embeddings list
```

Add a custom embedding:

```bash
embeddings-cos-sim-embeddings add <name> <levelPath> [--model <modelPath>] [--url <url>] [--desc <description>]
```

Remove a custom embedding:

```bash
embeddings-cos-sim-embeddings remove <name>
```

**Example:**

```bash
embeddings-cos-sim-embeddings add my-custom-emb ~/.embeddings-cos-sim/level/myemb.lvl --model ~/downloads/myvectors.vec.gz --url "https://example.com/myvectors.vec.gz"
```

## Usage as a Library

```typescript
import { loadVec, buildCosSimFn } from "embeddings-cos-sim/lib/cosSim";
import { getEmbeddingConfig } from "embeddings-cos-sim/lib/utils";
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

By default, configs and data are stored under `~/.embeddings-cos-sim/`:

- `vectors/` - vector files (`.vec.gz` or `.txt.gz`)
- `level/` - LevelDB databases
- `embeddings.json` - custom embedding configurations

Paths in embedding configs can be absolute or relative to `~/.embeddings-cos-sim/`.

## Testing

```bash
npm test
```

## License

ISC

## Author

André Santos
