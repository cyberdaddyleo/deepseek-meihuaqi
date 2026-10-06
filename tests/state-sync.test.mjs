import test from 'node:test';
import assert from 'node:assert/strict';
import { createStateSync } from '../src/state-sync.mjs';

const turn = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => Promise.withResolvers();
function fixture(initial, request) {
  let state = initial;
  const accepted = [];
  const sync = createStateSync({request, read: () => state, accept: value => {
    state = value;
    accepted.push(value);
    return value;
  }});
  return {sync, read: () => state, accepted};
}

for (const operation of ['update', 'remove-preset']) test(`a delayed GET cannot undo successful ${operation}`, async () => {
  const old = {theme: 'custom-old', custom: {theme: [{id: 'custom-old'}]}};
  const next = operation === 'update'
    ? {...old, theme: 'forest'}
    : {theme: 'ice', custom: {theme: []}};
  const delayed = deferred();
  const {sync, read, accepted} = fixture(old, endpoint => endpoint === 'get' ? delayed.promise : Promise.resolve(next));
  const refresh = sync.get();
  await sync.mutate(operation, operation === 'update' ? {theme: 'forest'} : {kind: 'theme', id: 'custom-old'});
  delayed.resolve(old);
  assert.deepEqual(await refresh, next, 'stale get callers must also receive the current state');
  assert.deepEqual(read(), next, 'the applied theme and deleted catalog must remain current');
  assert.deepEqual(accepted, [next], 'a stale GET must never re-register a removed theme');
});

test('polling is skipped while mutations are queued and mutations preserve user order', async () => {
  const initial = {theme: 'ice'}, first = deferred(), second = deferred();
  const calls = [];
  const {sync, read} = fixture(initial, (endpoint, payload) => {
    calls.push([endpoint, payload]);
    if (endpoint === 'get') return Promise.resolve({theme: 'forest'});
    return payload.theme === 'night' ? first.promise : second.promise;
  });
  const a = sync.mutate('update', {theme: 'night'});
  const b = sync.mutate('update', {theme: 'forest'});
  await turn();
  assert.deepEqual(calls, [['update', {theme: 'night'}]], 'the second mutation must wait');
  assert.deepEqual(await sync.get(), initial);
  assert.equal(calls.length, 1, 'polling must not start a request while writes are pending');
  first.resolve({theme: 'night'});
  await a;
  await turn();
  assert.deepEqual(calls[1], ['update', {theme: 'forest'}]);
  assert.deepEqual(await sync.get(), {theme: 'night'});
  assert.equal(calls.length, 2);
  second.resolve({theme: 'forest'});
  await b;
  assert.deepEqual(read(), {theme: 'forest'});
  await sync.get();
  assert.equal(calls[2][0], 'get', 'polling resumes when the write queue empties');
});

test('mutation rejection reaches the caller and does not block the next mutation', async () => {
  const initial = {theme: 'ice'}, rejected = deferred(), next = deferred();
  const {sync, read} = fixture(initial, (_endpoint, payload) => payload.theme === 'bad' ? rejected.promise : next.promise);
  const failure = assert.rejects(sync.mutate('update', {theme: 'bad'}), /invalid theme/);
  const success = sync.mutate('update', {theme: 'forest'});
  rejected.reject(new Error('invalid theme'));
  await failure;
  assert.deepEqual(read(), initial);
  next.resolve({theme: 'forest'});
  await success;
  assert.deepEqual(read(), {theme: 'forest'});
});

test('failed reads preserve current state and later reads still work', async () => {
  const initial = {theme: 'forest'};
  let fail = true;
  const {sync, read} = fixture(initial, async () => {
    if (fail) throw new Error('temporary offline');
    return {theme: 'night'};
  });
  await assert.rejects(sync.get(), /temporary offline/);
  assert.deepEqual(read(), initial);
  fail = false;
  assert.deepEqual(await sync.get(), {theme: 'night'});
});

test('a superseded read error cannot replace a successful mutation in the settings view', async () => {
  const old = {theme: 'ice'}, next = {theme: 'forest'}, delayed = deferred();
  const {sync, read} = fixture(old, endpoint => endpoint === 'get' ? delayed.promise : Promise.resolve(next));
  const refresh = sync.get();
  await sync.mutate('update', {theme: 'forest'});
  delayed.reject(new Error('stale request disconnected'));
  assert.deepEqual(await refresh, next);
  assert.deepEqual(read(), next);
});

test('an older overlapping refresh cannot replace a newer refresh', async () => {
  const first = deferred(), second = deferred();
  let requests = 0;
  const {sync, read} = fixture({theme: 'ice'}, () => ++requests === 1 ? first.promise : second.promise);
  const a = sync.get(), b = sync.get();
  second.resolve({theme: 'forest'});
  await b;
  first.resolve({theme: 'night'});
  assert.deepEqual(await a, {theme: 'forest'});
  assert.deepEqual(read(), {theme: 'forest'});
});
