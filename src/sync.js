// Delivers gifts to subscribers. With no room set it stays on this machine;
// with a room code it goes through Firebase so every Mac in the room sees it.
const { sanitize } = require('./sceneSpec');
const firebaseSync = require('./firebaseSync');

function createSync(onStatus = () => {}) {
  const subs = new Set();
  let room = null;
  let stop = () => {};
  const emit = (gift) => subs.forEach((cb) => cb(sanitize(gift)));
  const fail = (e) => onStatus(`Sync problem: ${e.code || e.message}`);

  return {
    subscribe(cb) { subs.add(cb); return () => subs.delete(cb); },
    getRoom: () => room,
    setRoom(code) {
      stop();
      room = code || null;
      stop = room ? firebaseSync.listen(room, emit, fail) : () => {};
      onStatus(room ? 'Connected to room' : 'Local only (no room)');
    },
    async publish(gift) {
      if (!room) return emit(gift);
      try { await firebaseSync.publish(room, sanitize(gift)); } catch (e) { fail(e); throw e; }
    },
  };
}

module.exports = { createSync };
