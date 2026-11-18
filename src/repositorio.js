// Camada de dados: Firebase Realtime Database quando configurado, senão localStorage.
// As duas implementações têm a mesma interface: assinar, criar, atualizar, remover.

const env = import.meta.env;
export const usandoFirebase = Boolean(env.VITE_FIREBASE_DATABASE_URL);

function repositorioLocal() {
  const CHAVE = "pacientes";
  const ouvintes = new Set();
  const ler = () => {
    try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch { return {}; }
  };
  const gravar = (dados) => {
    try { localStorage.setItem(CHAVE, JSON.stringify(dados)); } catch { /* armazenamento indisponível */ }
    ouvintes.forEach((fn) => fn(dados));
  };
  return {
    assinar(fn) {
      ouvintes.add(fn);
      fn(ler());
      return () => ouvintes.delete(fn);
    },
    async criar(p) { gravar({ ...ler(), [crypto.randomUUID()]: p }); },
    async atualizar(id, p) { gravar({ ...ler(), [id]: p }); },
    async remover(id) { const d = ler(); delete d[id]; gravar(d); },
  };
}

async function repositorioFirebase() {
  const { initializeApp } = await import("firebase/app");
  const { getDatabase, ref, onValue, push, set, remove } = await import("firebase/database");
  const app = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: env.VITE_FIREBASE_DATABASE_URL,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  });
  const db = getDatabase(app);
  const raiz = ref(db, "pacientes");
  return {
    assinar: (fn) => onValue(raiz, (snap) => fn(snap.val() || {})),
    criar: (p) => push(raiz, p),
    atualizar: (id, p) => set(ref(db, `pacientes/${id}`), p),
    remover: (id) => remove(ref(db, `pacientes/${id}`)),
  };
}

export const criarRepositorio = () => (usandoFirebase ? repositorioFirebase() : Promise.resolve(repositorioLocal()));
