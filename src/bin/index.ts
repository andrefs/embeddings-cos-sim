import { Command } from 'commander';
import { registerSimilarity } from './similarity';
import { registerVerify } from './verify';
import { registerDownload } from './download';
import { registerEmbeddings } from './embeddings';
import { registerConvert } from './convert';
import { registerGet } from './get';

const program = new Command();

program
  .name('embeddings-cos-sim')
  .description('Compute cosine similarity between word embeddings')
  .version('1.0.0');

registerSimilarity(program);
registerVerify(program);
registerDownload(program);
registerEmbeddings(program);
registerConvert(program);
registerGet(program);

program.parse();
