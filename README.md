# 🩺 Cadastro de Pacientes

CRUD completo de pacientes com **React, Bootstrap 5 e Firebase Realtime Database**.

🔗 **Ao vivo:** https://leonardocarrilho.github.io/app-pacientes/

## Funcionalidades
- Cadastrar, listar, editar e excluir pacientes (nome, telefone, e-mail, idade, endereço)
- Atualização em tempo real da lista (`onValue` do Firebase)
- Validação de formulário e máscara de telefone
- Busca por nome ou e-mail e ordenação alfabética
- Mensagens de retorno e confirmação antes de excluir

## Banco de dados
A camada `src/repositorio.js` tem duas implementações com a mesma interface:
- **Firebase**, quando as variáveis do `.env` estão preenchidas (veja `.env.example`);
- **localStorage**, para rodar sem configuração (modo demonstração).

## Como rodar
```bash
npm install
cp .env.example .env   # opcional: preencha com o seu projeto Firebase
npm run dev
```

Projeto do módulo 27 do curso Full Stack Turbo (TipsCode).
