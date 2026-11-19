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
        <h1 className="mb-1">Pacientes</h1>
        <p className="text-secondary mb-0">
          {usandoFirebase ? "Dados sincronizados em tempo real com o Firebase." : "Modo demonstração: os dados ficam salvos só neste navegador."}
        </p>
      </header>

      {aviso && <div className={`alert alert-${aviso.tipo} py-2`} role="status">{aviso.texto}</div>}

      <div className="row g-4">
        <div className="col-lg-4">
          <Formulario editando={editando} aoSalvar={salvar} aoCancelar={() => setEditando(null)} />
        </div>
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
                <h2 className="h5 m-0">Pacientes ({lista.length})</h2>
                <input type="search" className="form-control w-auto" placeholder="Buscar por nome ou e-mail"
                  value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar" />
              </div>
              {lista.length === 0 && <p className="text-center text-secondary py-4 mb-0">Nenhum paciente encontrado.</p>}
              <ul className="fichas">
                {lista.map(([id, p]) => (
                  <li key={id} className={`ficha ${editando?.id === id ? "editando" : ""}`}>
                    <span className="iniciais" aria-hidden="true">{p.nome.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("")}</span>
                    <div className="dados">
                      <strong>{p.nome}</strong>
                      <span>{p.idade} anos · {p.telefone}</span>
                      <span className="email">{p.email}</span>
                    </div>
                    <div className="acoes">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setEditando({ id, dados: p })}>Editar</button>
                      <button className="btn btn-sm btn-link text-danger" onClick={() => remover(id, p.nome)}>Excluir</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <footer className="text-center text-secondary small mt-4">Feito por Leonardo Carrilho com React, Bootstrap e Firebase.</footer>
    </div>
  );
}
