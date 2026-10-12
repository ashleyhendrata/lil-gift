// Sync adapter. "local" delivers gifts to this machine's own widget so the app
// works end-to-end before a shared backend exists. Swap in a Firebase adapter
// with the same publish/subscribe shape for two-Mac delivery.
function createLocalSync() {
  const subs = new Set();
  return {
    publish(gift) { subs.forEach((cb) => cb(gift)); },
    subscribe(cb) { subs.add(cb); return () => subs.delete(cb); },
  };
}

module.exports = { createLocalSync };
