/** Serializes appearance updates and keeps delayed refreshes from reviving stale state. */
export function createStateSync({ request, read, accept }) {
  let generation = 0;
  let readSerial = 0;
  let pending = 0;
  let queue = Promise.resolve();
  return {
    async get() {
      // A mount can still read the current snapshot while polling is paused.
      if (pending) return read();
      const version = generation, serial = ++readSerial;
      const current = () => version === generation && serial === readSerial && pending === 0;
      try {
        const value = await request('get', null);
        return current() ? accept(value) : read();
      } catch (error) {
        // A superseded read must not replace an already successful operation
        // with either its old state or its old error in the settings view.
        if (!current()) return read();
        throw error;
      }
    },
    mutate(endpoint, payload) {
      // Invalidate existing GETs as soon as the user queues a write.
      generation++;
      pending++;
      const task = queue.then(() => request(endpoint, payload)).then(accept);
      // Only the private queue absorbs a rejection. The caller's task keeps it.
      queue = task.then(() => undefined, () => undefined);
      return task.finally(() => { pending--; });
    },
  };
}
