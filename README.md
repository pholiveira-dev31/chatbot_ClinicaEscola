# 🤖 Bot de Atendimento WhatsApp - Clínica Escola CPTL/UFMS

Repositório oficial do assistente virtual de triagem e acolhimento da Clínica Escola do Câmpus de Três Lagoas (CPTL/UFMS). O sistema automatiza o primeiro atendimento via WhatsApp, orientando pacientes sobre agendamentos, retornos, exames e encaminhamentos.

---

## 📋 Sumário
1. [Sobre o Projeto](#sobre-o-projeto)
2. [Arquitetura e Tecnologias](#arquitetura-e-tecnologias)
3. [Estrutura de Ficheiros](#estrutura-de-ficheiros)
4. [Pré-requisitos](#pré-requisitos)
5. [Como Executar o Projeto](#como-executar-o-projeto)
6. [Simulador de Terminal (Testes sem Celular)](#simulador-de-terminal-testes-sem-celular)
7. [Execução Contínua 24/7 (Produção)](#execução-contínua-247-produção)

---

## 💡 1. Sobre o Projeto
O bot foi desenvolvido para otimizar o fluxo de atendimento da recepção da Clínica Escola. Ele funciona através de uma árvore de decisão conversacional baseada em estados (`session.state`), coletando dados essenciais de forma estruturada e gerando cartões de atendimento (logs formatados) para a equipe humana quando necessário.

---

## 🛠️ 2. Arquitetura e Tecnologias
* **Node.js** (v18 ou superior)
* **Baileys** (`@whiskeysockets/baileys`): Biblioteca que emula o protocolo do WhatsApp Web via WebSocket, permitindo o funcionamento **sem a necessidade da API oficial paga da Meta**.
* **Gerenciamento de Estados (FSM):** Controle de navegação conversacional individualizado por número de telefone.

---

## 📂 3. Estrutura de Ficheiros
* `bot.js` — Script principal de produção integrado ao WhatsApp via conexão QR Code.
* `teste-terminal.js` — Simulador interativo de terminal para validar os menus e regras de negócio sem precisar de um telemóvel conectado.
* `package.json` — Dependências e configurações do projeto.

---

## ⚙️ 4. Pré-requisitos
Certifica-te de ter instalado no teu computador:
* [Node.js](https://nodejs.org/) (versão 18+)
* Git

---

## 🚀 5. Como Executar o Projeto

1. Clona o repositório e entra na pasta:
   ```bash
   git clone <url-do-teu-repositorio>
   cd <nome-da-pasta>
