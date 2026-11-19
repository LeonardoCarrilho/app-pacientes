// Camada de dados: Firebase Realtime Database quando configurado, senão localStorage.
// As duas implementações têm a mesma interface: assinar, criar, atualizar, remover.

const env = import.meta.env;
export const usandoFirebase = Boolean(env.VITE_FIREBASE_DATABASE_URL);

// Pacientes fictícios carregados na primeira visita do modo demonstração.
const EXEMPLOS = [
  { nome: "Ana Beatriz Moura", telefone: "(11) 98734-2210", email: "ana.moura@exemplo.com", idade: 34, endereco: "Rua das Acácias, 120, São Paulo" },
  { nome: "Carlos Eduardo Lima", telefone: "(11) 97621-4408", email: "carlos.lima@exemplo.com", idade: 58, endereco: "Av. Paulista, 1500, São Paulo" },
  { nome: "Fernanda Okada", telefone: "(11) 99410-7735", email: "fernanda.okada@exemplo.com", idade: 27, endereco: "Rua Vergueiro, 845, São Paulo" },
  { nome: "João Pedro Santos", telefone: "(11) 96558-0192", email: "joao.santos@exemplo.com", idade: 9, endereco: "Rua Augusta, 300, São Paulo" },
  { nome: "Mariana Albuquerque", telefone: "(11) 98102-6644", email: "mariana.alb@exemplo.com", idade: 41, endereco: "Rua Oscar Freire, 77, São Paulo" },
  { nome: "Roberto Nascimento", telefone: "(11) 3065-2281", email: "roberto.n@exemplo.com", idade: 72, endereco: "Rua da Consolação, 2100, São Paulo" },
  { nome: "Tatiane Ribeiro", telefone: "(11) 95233-9087", email: "tati.ribeiro@exemplo.com", idade: 30, endereco: "" },
];

function repositorioLocal() {
  const CHAVE = "pacientes";
  try {
    if (localStorage.getItem(CHAVE) === null) {
      localStorage.setItem(CHAVE, JSON.stringify(Object.fromEntries(EXEMPLOS.map((p, i) => [`exemplo-${i + 1}`, p]))));
    }
  } catch { /* armazenamento indisponível */ }
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
