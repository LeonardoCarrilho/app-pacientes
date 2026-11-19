import { useEffect, useState } from "react";

const VAZIO = { nome: "", telefone: "", email: "", idade: "", endereco: "" };

const mascaraTelefone = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
};

export default function Formulario({ editando, aoSalvar, aoCancelar }) {
  const [valores, setValores] = useState(VAZIO);
  const [validado, setValidado] = useState(false);

  useEffect(() => {
    setValores(editando ? { ...VAZIO, ...editando.dados } : VAZIO);
    setValidado(false);
  }, [editando]);

  const mudar = (e) => {
    const { name, value } = e.target;
    setValores((v) => ({ ...v, [name]: name === "telefone" ? mascaraTelefone(value) : value }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      setValidado(true);
      return;
    }
    await aoSalvar({ ...valores, nome: valores.nome.trim(), idade: Number(valores.idade) });
    setValores(VAZIO);
    setValidado(false);
  };

  return (
    <form noValidate className={`card card-body ${validado ? "was-validated" : ""}`} onSubmit={enviar}>
      <h2 className="h5 mb-3">{editando ? "Editar paciente" : "Novo paciente"}</h2>
      <div className="mb-3">
        <label className="form-label" htmlFor="nome">Nome completo</label>
        <input id="nome" name="nome" className="form-control" required minLength={3} value={valores.nome} onChange={mudar} />
        <div className="invalid-feedback">Informe o nome (mínimo de 3 letras).</div>
      </div>
      <div className="row g-3 mb-3">
        <div className="col-sm-7">
          <label className="form-label" htmlFor="telefone">Telefone</label>
          <input id="telefone" name="telefone" className="form-control" required pattern="\(\d{2}\) \d{4,5}-\d{4}"
            placeholder="(11) 91234-5678" value={valores.telefone} onChange={mudar} inputMode="tel" />
          <div className="invalid-feedback">Telefone com DDD.</div>
        </div>
        <div className="col-sm-5">
          <label className="form-label" htmlFor="idade">Idade</label>
          <input id="idade" name="idade" type="number" min={0} max={130} className="form-control" required
            value={valores.idade} onChange={mudar} />
          <div className="invalid-feedback">Entre 0 e 130.</div>
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" className="form-control" required value={valores.email} onChange={mudar} />
        <div className="invalid-feedback">E-mail inválido.</div>
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor="endereco">Endereço</label>
        <input id="endereco" name="endereco" className="form-control" value={valores.endereco} onChange={mudar} />
      </div>
      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary">{editando ? "Atualizar" : "Salvar"}</button>
        {editando && <button type="button" className="btn btn-outline-secondary" onClick={aoCancelar}>Cancelar</button>}
      </div>
    </form>
  );
}
