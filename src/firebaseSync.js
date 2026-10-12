const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } = require('firebase/firestore');
const config = require('./firebaseConfig');

let ready;
function init() {
  if (!ready) {
    const app = initializeApp(config);
    const auth = getAuth(app);
    const db = getFirestore(app);
    ready = signInAnonymously(auth).then(() => db);
    ready.catch(() => { ready = null; }); // allow retry after a failure
  }
  return ready;
}

async function publish(room, gift) {
  const db = await init();
  await addDoc(collection(db, 'rooms', room, 'gifts'), {
    scene: JSON.stringify(gift),
    createdAt: serverTimestamp(),
  });
}

// Calls cb with the newest gift in the room (including on startup) and each new one after.
function listen(room, cb, onError) {
  let unsub = () => {};
  let cancelled = false;
  init().then((db) => {
    if (cancelled) return;
    const q = query(collection(db, 'rooms', room, 'gifts'), orderBy('createdAt', 'desc'), limit(1));
    let last;
    unsub = onSnapshot(q, (snap) => {
      const d = snap.docs[0];
      if (!d || d.id === last) return;
      last = d.id;
      try { cb(JSON.parse(d.data().scene)); } catch { /* ignore malformed gift */ }
    }, onError);
  }).catch(onError);
  return () => { cancelled = true; unsub(); };
}

module.exports = { publish, listen };
