# Unified CLI Refactoring - Task 3 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert src/bin/similarity.ts into a subcommand that registers via `registerSimilarity(program: Command)`.

**Architecture:** Refactor standalone CLI script into a Commander subcommand module that gets registered by the main entry point.

**Tech Stack:** TypeScript, Commander.js, Vitest

---

## Prerequisites

- Working directory: `/home/andrefs/Academia/PhD/MAPi/projects/embeddings-cos-sim`
- Current state:
  - `src/bin/similarity.ts` is a standalone script with top-level execution
  - `src/bin/index.ts` is the main entry point with empty Commander setup
  - No existing test files
  - Build system uses esbuild via build.mjs
- Must preserve: imports, shebang (added by build), all functionality

---

### Task 1: Write the failing test for registerSimilarity

**Files:**
- Create: `tests/similarity.test.ts`
- Test: `tests/similarity.test.ts`

**Step 1.1: Write the failing test**

Create `tests/similarity.test.ts` with:

```typescript
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
```

**Step 1.2: Run test to verify it fails**

Run: `npm test tests/similarity.test.ts`
Expected: FAIL with "Cannot find module '../src/bin/similarity'" or "registerSimilarity is not a function"

**Step 1.3: Proceed to implementation** (Task 2)

---

### Task 2: Refactor src/bin/similarity.ts to export registerSimilarity

**Files:**
- Modify: `src/bin/similarity.ts`

**Step 2.1: Write the implementation**

Transform `src/bin/similarity.ts` into:

```typescript
import { buildCosSimFn, loadVec } from "../lib/cosSim";
import { getEmbeddingConfig } from "../lib/utils";
import { Command } from 'commander';

export function registerSimilarity(program: Command) {
  program
    .command('similarity')
    .description('Compute cosine similarity between two words')
    .argument('<embeddingName>', 'name of the embedding model')
    .argument('<word1>', 'first word')
    .argument('<word2>', 'second word')
    .option('-e, --embedding <name>', 'specify embedding name (alternative syntax)')
    .action(async (embeddingName, word1, word2, options) => {
      // Handle both positional and option-based embedding name
      const finalEmbeddingName = options.embedding || embeddingName;

      const config = await getEmbeddingConfig(finalEmbeddingName);
      if (!config) {
        console.error(`Embedding '${finalEmbeddingName}' not found.`);
        process.exit(1);
      } else {
        const db = await loadVec(config.levelPath);
        const cosSim = await buildCosSimFn(db);
        const result = await cosSim(word1, word2);
        console.log(result);
      }
    });
}
```

**Step 2.2: Run test to verify it passes**

Run: `npm test tests/similarity.test.ts`
Expected: PASS

**Step 2.3: Verify other tests still pass** (if any)

Run: `npm test`
Expected: All tests pass (only the new one)

**Step 2.4: Commit** (after Task 3)

---

### Task 3: Update src/bin/index.ts to register the similarity command

**Files:**
- Modify: `src/bin/index.ts`

**Step 3.1: Add import and registration**

Update `src/bin/index.ts` to:

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { registerSimilarity } from './similarity';

const program = new Command();

program
  .name('embeddings-cos-sim')
  .description('Compute cosine similarity between word embeddings')
  .version('1.0.0');

registerSimilarity(program);

program.parse();
```

**Step 3.2: Verify manually**

Run: `npm run build && ./dist/bin/embeddings-cos-sim.js --help`
Expected: Should show 'similarity' command in the help output.

Run: `./dist/bin/embeddings-cos-sim.js similarity --help`
Expected: Should show arguments and options for similarity command.

**Step 3.3: Run tests to ensure nothing broke**

Run: `npm test`
Expected: All tests pass

**Step 3.4: Commit**

```bash
git add src/bin/index.ts src/bin/similarity.ts tests/similarity.test.ts
git commit -m "refactor: similarity as subcommand"
```

**Step 3.5: Verify commit**

Run: `git log -1 --format="%H %s"`
Expected: Shows the exact commit message and returns a hash

Report: Commit hash = `<hash>`

---

### Task 4: Final verification and build check

**Step 4.1: Run full build**

Run: `npm run build`
Expected: Build completes successfully with exit code 0

**Step 4.2: Final test run**

Run: `npm test`
Expected: All tests pass

**Step 4.3: Check for any issues**

Inspect the output of build and tests for warnings or errors.
If any issues, report them. If none, report "No issues".

---

## Implementation Notes

- The original `similarity.ts` used `process.argv` parsing. The new version uses Commander's argument/option parsing.
- The action handler receives arguments in this order: positional args, then options object as last parameter.
- Both `<embeddingName>` positional and `--embedding` option are supported to match original flexibility.
- The build process (build.mjs) will still bundle similarity.ts but it's no longer an entry point; it will be bundled as part of index.js. The bin entry for `embeddings-cos-sim` remains pointing to `./dist/bin/embeddings-cos-sim.js` which is the compiled index.ts.

---

## Verification Checklist

- [ ] Test written first and failed (Step 1.2)
- [ ] Implementation written after failing test (Task 2)
- [ ] Test passes with implementation (Step 2.2)
- [ ] registerSimilarity function exported
- [ ] index.ts imports and calls registerSimilarity
- [ ] Command name is 'similarity'
- [ ] Command description is appropriate
- [ ] Build succeeds (Step 4.1)
- [ ] All tests pass (Step 4.2)
- [ ] Commit message exactly: "refactor: similarity as subcommand" (Step 3.4)
- [ ] Commit hash reported (Step 3.5)
- [ ] Any issues reported (Step 4.3)

---

**Plan complete and saved to `docs/plans/2024-03-23-unified-cli-refactoring-task3.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
