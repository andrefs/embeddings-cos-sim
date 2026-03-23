import path from 'node:path';
import { Level } from 'level';
import oldFs from 'node:fs';
import { PassThrough, Readable } from 'node:stream';
import { createInterface } from 'node:readline';
import { createGunzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';

const levelFolder = 'level';
const modelsFolder = 'fasttext-vecs';
export const DEFAULT_WECOSSIM_PATH = path.join(process.env.HOME!, '.we-cos-sim');
export const DEFAULT_LEVEL_PATH = path.join(DEFAULT_WECOSSIM_PATH, levelFolder);

// Embedding configuration types
export interface EmbeddingConfig {
  name: string;
  description: string;
  levelPath: string;
  modelPath?: string;
  url?: string;
  dimension?: number;
}

export const EMBEDDING_CONFIG_FILE = path.join(DEFAULT_WECOSSIM_PATH, 'embeddings.json');

// All built-in embeddings use the same structure - no special cases
const PREDEFINED_EMBEDDINGS: Record<string, EmbeddingConfig> = {
  // FastText embeddings (pre-configured with explicit names)
  'fasttext-en': {
    name: 'fasttext-en',
    description: 'FastText English word embeddings (Common Crawl 300 dimensions)',
    levelPath: 'level/cc.en.300.vec.lvl',
    modelPath: 'fasttext-vecs/cc.en.300.vec.gz',
    url: 'https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.en.300.vec.gz',
    dimension: 300
  },
  'fasttext-de': {
    name: 'fasttext-de',
    description: 'FastText German word embeddings (Common Crawl 300 dimensions)',
    levelPath: 'level/cc.de.300.vec.lvl',
    modelPath: 'fasttext-vecs/cc.de.300.vec.gz',
    url: 'https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.de.300.vec.gz',
    dimension: 300
  },
  'fasttext-fr': {
    name: 'fasttext-fr',
    description: 'FastText French word embeddings (Common Crawl 300 dimensions)',
    levelPath: 'level/cc.fr.300.vec.lvl',
    modelPath: 'fasttext-vecs/cc.fr.300.vec.gz',
    url: 'https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.fr.300.vec.gz',
    dimension: 300
  },
  'fasttext-es': {
    name: 'fasttext-es',
    description: 'FastText Spanish word embeddings (Common Crawl 300 dimensions)',
    levelPath: 'level/cc.es.300.vec.lvl',
    modelPath: 'fasttext-vecs/cc.es.300.vec.gz',
    url: 'https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.es.300.vec.gz',
    dimension: 300
  },
  // DBpedia node embeddings
  'node2vec-dbpedia': {
    name: 'node2vec-dbpedia',
    description: 'Node2Vec DBpedia embeddings from University of Mannheim',
    levelPath: 'level/node2vec-dbpedia.lvl',
    modelPath: 'vectors_dbpedia_Node2Vec.txt.gz',
    url: 'https://data.dws.informatik.uni-mannheim.de/KBE-for-Data-Mining/vectors_dbpedia_Node2Vec.txt',
    dimension: 300
  },
  'rdf2vec-dbpedia': {
    name: 'rdf2vec-dbpedia',
    description: 'RDF2Vec DBpedia embeddings from University of Mannheim',
    levelPath: 'level/rdf2vec-dbpedia.lvl',
    modelPath: 'vectors_dbpedia_rdf2vec.txt.gz',
    url: 'https://data.dws.informatik.uni-mannheim.de/KBE-for-Data-Mining/vectors_dbpedia_rdf2vec.txt',
    dimension: 300
  },
};

function makeFolders(rootFolder: string) {
  if (!oldFs.existsSync(rootFolder)) {
    oldFs.mkdirSync(rootFolder);
  }
  if (!oldFs.existsSync(path.join(rootFolder, levelFolder))) {
    oldFs.mkdirSync(path.join(rootFolder, levelFolder));
  }
  if (!oldFs.existsSync(path.join(rootFolder, modelsFolder))) {
    oldFs.mkdirSync(path.join(rootFolder, modelsFolder));
  }
}

export async function downloadModel(embeddingOrConfig: string | EmbeddingConfig, rootFolder = DEFAULT_WECOSSIM_PATH) {
  const config = typeof embeddingOrConfig === 'string'
    ? await getEmbeddingConfig(embeddingOrConfig, rootFolder)
    : embeddingOrConfig;

  if (!config) {
    throw new Error(`Embedding not found: ${embeddingOrConfig}`);
  }

  if (!config.url) {
    throw new Error(`No download URL specified for embedding '${config.name}'.`);
  }
  if (!config.modelPath) {
    throw new Error(`No model path specified for embedding '${config.name}'.`);
  }

  const url = config.url;
  const modelFile = path.isAbsolute(config.modelPath) ? config.modelPath : path.join(rootFolder, config.modelPath);
  const levelFile = path.isAbsolute(config.levelPath) ? config.levelPath : path.join(rootFolder, config.levelPath);

  makeFolders(rootFolder);
  // Ensure model directory exists
  const modelDir = path.dirname(modelFile);
  if (!oldFs.existsSync(modelDir)) {
    oldFs.mkdirSync(modelDir, { recursive: true });
  }

  console.log(`Downloading model for ${config.name} from ${url}`);
  console.log(`This might take a while...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download model: ${response.statusText}`);
  }

  const totalBytes = Number(response.headers.get("Content-Length"));
  let downloadedBytes = 0;

  const nodeStream = Readable.fromWeb(response.body as any);
  const teeStream = new PassThrough();
  const fileWriteStream = oldFs.createWriteStream(modelFile);
  console.log(`Writing model file to ${modelFile}`);
  const downloadStream = pipeline(nodeStream, teeStream, fileWriteStream).catch(console.error);

  const db = new Level<string, Buffer>(levelFile, { valueEncoding: 'buffer' });

  // Interval to print progress
  const progressInterval = setInterval(() => {
    console.log(`Download progress: ${(downloadedBytes / totalBytes * 100).toFixed(2)}%`);
  }, 5 * 1000);

  nodeStream.on('data', (chunk) => {
    downloadedBytes += chunk.length;
  });

  await parseVecFile(teeStream, db);

  clearInterval(progressInterval);
  await downloadStream;

  console.log(`Finished writing files ${modelFile} and ${levelFile}`);
}

export async function getVec(db: Level<string, Buffer>, word: string) {
  const buf = await db.get(word);
  return buf ? [...new Float32Array(buf.buffer)] : null;
}

type LineParser = (line: string) => Promise<void> | void;

export async function parseVecFile(
  input: NodeJS.ReadableStream,
  db: Level<string, Buffer>,
  verbose: boolean | 'progress' = false
) {
  const gunzip = createGunzip();
  const stream = input.pipe(gunzip);
  const rl = createInterface({ input: stream });

  let count = 0;
  let lastReport = 0;

  for await (const line of rl) {
    const parts = line.split(' ');
    if (parts.length < 2) {
      continue;
    }
    const key = parts[0];
    const vector = new Float32Array(parts.slice(1).map(Number));
    if (verbose === 'progress' && count > 0 && count % 10000 === 0) {
      console.log(`Processed ${count} words...`);
    }
    else if (verbose === true) {
      console.log(`Writing key ${key}: [${vector.slice(0, 5).join(', ')}...]`);
    }
    const buffer = Buffer.from(vector.buffer);

    await db.put(key!, buffer);
    count++;
  }

  console.log(`Finished processing ${count} words`);
}

export async function modelToLevel(modelPath: string, levelPath: string, { verbose = false }: { verbose?: boolean | 'progress' } = {}) {
  const db = new Level<string, Buffer>(levelPath, { valueEncoding: 'buffer' });
  const stream = oldFs.createReadStream(modelPath);

  await parseVecFile(stream, db, verbose);
  await db.close();

  return db;
}

export async function verifyLevelDb(levelPath: string, sampleWords?: string[]) {
  const words = sampleWords ?? ['the', 'and', 'is'];
  const db = new Level<string, Buffer>(levelPath, { valueEncoding: 'buffer' });
  try {
    await db.open();

    const keys = [];
    for await (const key of db.keys()) {
      keys.push(key);
    }

    console.log(`Database has ${keys.length} words`);

    for (const word of words) {
      const vec = await getVec(db, word);
      if (vec) {
        console.log(`✓ '${word}': vector length ${vec.length}, first 3 values: [${vec.slice(0, 3).join(', ')}]`);
      } else {
        console.log(`✗ '${word}': not found`);
      }
    }

    return keys.length;
  }
  finally {
    await db.close();
  }
}

// User configuration management
export async function loadUserConfig(): Promise<Record<string, EmbeddingConfig>> {
  try {
    if (!oldFs.existsSync(EMBEDDING_CONFIG_FILE)) {
      return {};
    }
    const data = await oldFs.promises.readFile(EMBEDDING_CONFIG_FILE, 'utf-8');
    return JSON.parse(data) as Record<string, EmbeddingConfig>;
  } catch (err) {
    console.error('Failed to load embeddings config:', err);
    return {};
  }
}

export async function saveUserConfig(config: Record<string, EmbeddingConfig>): Promise<void> {
  await oldFs.promises.mkdir(path.dirname(EMBEDDING_CONFIG_FILE), { recursive: true });
  await oldFs.promises.writeFile(EMBEDDING_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export async function addEmbeddingToUserConfig(embedding: EmbeddingConfig): Promise<void> {
  const config = await loadUserConfig();
  config[embedding.name] = embedding;
  await saveUserConfig(config);
}

export async function removeEmbeddingFromUserConfig(name: string): Promise<void> {
  const config = await loadUserConfig();
  delete config[name];
  await saveUserConfig(config);
}

export async function listEmbeddings(): Promise<EmbeddingConfig[]> {
  const config = await loadUserConfig();
  return Object.values(config);
}

export async function getEmbeddingConfig(name: string, rootFolder = DEFAULT_WECOSSIM_PATH): Promise<EmbeddingConfig | null> {
  // 1. User-defined configs (highest priority)
  const userConfig = await loadUserConfig();
  if (userConfig[name]) {
    return userConfig[name];
  }

  // 2. Predefined embeddings (includes FastText and DBpedia)
  if (PREDEFINED_EMBEDDINGS[name]) {
    // Resolve relative paths against root folder
    const config = { ...PREDEFINED_EMBEDDINGS[name] };
    if (config.modelPath && !path.isAbsolute(config.modelPath)) {
      config.modelPath = path.join(rootFolder, config.modelPath);
    }
    if (!path.isAbsolute(config.levelPath)) {
      config.levelPath = path.join(rootFolder, config.levelPath);
    }
    return config;
  }

  return null;
}

/**
 * Extract a human-readable name from an entity URI (e.g., DBpedia resources)
 * @param uri - The full URI (e.g., "http://dbpedia.org/resource/Entity_Name")
 * @returns The local name with underscores replaced by spaces
 */
export function extractEntityName(uri: string): string {
  const parts = uri.split('/');
  const lastPart = parts[parts.length - 1] || uri;
  return decodeURIComponent(lastPart.replace(/_/g, ' '));
}
