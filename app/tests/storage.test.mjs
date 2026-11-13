import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

async function loadUtility(name) {
  const source = await readFile(new URL(`../src/utils/${name}.ts`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

test('sample initialization preserves existing records and fills only missing stores', async () => {
  globalThis.localStorage = storage({ fixedAssetsStore: '{"assets":[{"id":"real-asset"}]}' });
  const { initializeSampleData } = await loadUtility('initializeSampleData');
  initializeSampleData();
  assert.equal(localStorage.getItem('fixedAssetsStore'), '{"assets":[{"id":"real-asset"}]}');
  assert.ok(JSON.parse(localStorage.getItem('inventoryStore')).items.length > 0);
  const original = localStorage.getItem('inventoryStore');
  initializeSampleData();
  assert.equal(localStorage.getItem('inventoryStore'), original);
  assert.equal(localStorage.getItem('sampleDataInitialized'), 'true');
});

test('shared storage rejects invalid records and timestamps', async () => {
  const { getSharedData, getLastUpdate, setSharedData } = await loadUtility('sharedStorage');
  for (const record of ['null', '{}', '{"requests":{},"lastUpdate":1}', '{"requests":[],"lastUpdate":-1}']) {
    globalThis.localStorage = storage({ pettyCashStore_shared: record });
    assert.equal(getSharedData(), null);
  }
  for (const value of ['NaN', 'Infinity', '-1', '12junk']) {
    globalThis.localStorage = storage({ pettyCashStore_lastUpdate: value });
    assert.equal(getLastUpdate(), 0);
  }
  globalThis.localStorage = storage();
  setSharedData([{ id: 'request-1' }]);
  assert.deepEqual(getSharedData().requests, [{ id: 'request-1' }]);
  assert.equal(getSharedData().lastUpdate, getLastUpdate());
});

test('storage listeners handle clears and ignore other storage areas', async () => {
  const { onStorageChange } = await loadUtility('sharedStorage');
  let handler;
  let removed;
  globalThis.window = {
    localStorage: storage(),
    addEventListener: (_, callback) => { handler = callback; },
    removeEventListener: (_, callback) => { removed = callback; },
  };
  let calls = 0;
  const cleanup = onStorageChange(() => { calls++; });
  handler({ key: null, storageArea: window.localStorage });
  handler({ key: 'pettyCashStore_shared', storageArea: {} });
  handler({ key: 'unrelated', storageArea: window.localStorage });
  assert.equal(calls, 1);
  cleanup();
  assert.equal(removed, handler);
});
