import { useEffect, useMemo, useState } from "react";
import Formulario from "./Formulario.jsx";
import { criarRepositorio, usandoFirebase } from "./repositorio.js";

export default function App() {
  const [repo, setRepo] = useState(null);
  const [pacientes, setPacientes] = useState({});
  const [editando, setEditando] = useState(null);
  const [busca, setBusca] = useState("");
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    let cancelar = () => {};
    criarRepositorio()
      .then((r) => {
        setRepo(r);
        cancelar = r.assinar(setPacientes);
      })
      .catch(() => setAviso({ tipo: "danger", texto: "Não foi possível conectar ao banco de dados." }));
    return () => cancelar();
  }, []);

  const avisar = (texto, tipo = "success") => {
    setAviso({ texto, tipo });
    setTimeout(() => setAviso(null), 2500);
  };

  const salvar = async (dados) => {
    try {
      if (editando) {
        await repo.atualizar(editando.id, dados);
        avisar("Paciente atualizado.");
      } else {
        await repo.criar(dados);
        avisar("Paciente cadastrado.");
      }
      setEditando(null);
    } catch {
      avisar("Erro ao salvar.", "danger");
    }
  };

  const remover = async (id, nome) => {
    if (!window.confirm(`Excluir ${nome}?`)) return;
    try {
      await repo.remover(id);
      if (editando?.id === id) setEditando(null);
      avisar("Paciente excluído.");
    } catch {
      avisar("Erro ao excluir.", "danger");
    }
  };

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return Object.entries(pacientes)
      .filter(([, p]) => !termo || p.nome.toLowerCase().includes(termo) || p.email.toLowerCase().includes(termo))
      .sort(([, a], [, b]) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [pacientes, busca]);

  return (
    <div className="container py-4">
      <header className="mb-4">
        <h1 className="h3 mb-1">🩺 Cadastro de Pacientes</h1>
        <p className="text-secondary mb-0">
          CRUD com React e Bootstrap · dados em {usandoFirebase ? "Firebase Realtime Database" : "armazenamento local (modo demonstração)"}
        </p>
      </header>

      {aviso && <div className={`alert alert-${aviso.tipo} py-2`} role="status">{aviso.texto}</div>}

      <div className="row g-4">
        <div className="col-lg-4">
          <Formulario editando={editando} aoSalvar={salvar} aoCancelar={() => setEditando(null)} />
        </div>
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
                <h2 className="h5 m-0">Pacientes ({lista.length})</h2>
                <input type="search" className="form-control w-auto" placeholder="Buscar por nome ou e-mail"
                  value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar" />
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr><th>Nome</th><th>Telefone</th><th>E-mail</th><th>Idade</th><th className="text-end">Ações</th></tr>
                  </thead>
                  <tbody>
                    {lista.length === 0 && (
                      <tr><td colSpan={5} className="text-center text-secondary py-4">Nenhum paciente encontrado.</td></tr>
                    )}
                    {lista.map(([id, p]) => (
                      <tr key={id} className={editando?.id === id ? "table-primary" : ""}>
                        <td>{p.nome}</td>
                        <td className="text-nowrap">{p.telefone}</td>
                        <td>{p.email}</td>
                        <td>{p.idade}</td>
                        <td className="text-end text-nowrap">
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setEditando({ id, dados: p })}>Editar</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => remover(id, p.nome)}>Excluir</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="text-center text-secondary small mt-4">Feito por Leonardo Carrilho</footer>
    </div>
  );
}
