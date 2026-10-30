# 🤖 Bot de Atendimento WhatsApp - Clínica Escola CPTL/UFMS

Repositório oficial do assistente virtual de triagem e acolhimento da Clínica Escola do Câmpus de Três Lagoas (CPTL/UFMS). O sistema automatiza o primeiro atendimento via WhatsApp, orientando pacientes sobre agendamentos, retornos, exames, encaminhamentos e atendimento humano.

---

## 📋 Sumário
* [Sobre o Projeto](#-1-sobre-o-projeto)
* [Arquitetura e Tecnologias](#%EF%B8%8F-2-arquitetura-e-tecnologias)
* [Estrutura de Arquivos](#-3-estrutura-de-arquivos)
* [Pré-requisitos](#%EF%B8%8F-4-pré-requisitos)
* [Como Executar o Projeto](#-5-como-executar-o-projeto)
* [Simulador de Terminal (Testes sem Celular)](#-6-simulador-de-terminal-testes-sem-celular)
* [Execução Contínua 24/7 (Produção)](#-7-execução-contínua-247-produção)

---

## 💡 1. Sobre o Projeto
O bot foi desenvolvido para otimizar o fluxo de atendimento da recepção da Clínica Escola. Ele funciona através de uma árvore de decisão conversacional baseada em máquina de estados finitos (`session.state`), coletando dados essenciais de forma estruturada e gerando cartões de atendimento (logs formatados no console) para a equipe da recepção quando necessário.

---

## 🛠️ 2. Arquitetura e Tecnologias
* **Node.js** (v18 ou superior)
* **Baileys** (`@whiskeysockets/baileys`): Biblioteca que emula o protocolo do WhatsApp Web via WebSocket, permitindo o funcionamento **sem a necessidade da API oficial paga da Meta**.
* **Gerenciamento de Estados (FSM):** Controle de navegação conversacional individualizado por número de telefone.

---

## 📂 3. Estrutura de Arquivos
* `bot.js` — Script principal de produção integrado ao WhatsApp via conexão QR Code.
* `teste-terminal.js` — Simulador interativo de terminal para validar os menus e regras de negócio sem precisar de um celular conectado.
* `package.json` — Dependências e configurações do projeto.

---

## ⚙️ 4. Pré-requisitos
Certifique-se de ter instalado no seu computador:
* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* Git

---

## 🚀 5. Como Executar o Projeto

1. Clone o repositório e acesse a pasta do projeto:
   ```bash
   git clone <URL_DO_SEU_REPOSITORIO>
   cd <NOME_DA_PASTA>
