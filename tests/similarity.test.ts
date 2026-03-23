import { describe, it, expect } from 'vitest';
import { Command } from 'commander';
import { registerSimilarity } from '../src/bin/similarity';

describe('similarity subcommand registration', () => {
  it('registers a command named "similarity"', () => {
    const program = new Command();
    registerSimilarity(program);
    const command = program.commands.find(cmd => cmd.name() === 'similarity');
    expect(command).toBeDefined();
  });

  it('has correct description', () => {
    const program = new Command();
    registerSimilarity(program);
    const command = program.commands.find(cmd => cmd.name() === 'similarity');
    expect(command?.description()).toBe('Compute cosine similarity between two words');
  });
});
