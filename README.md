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
* [Reset de Sessão (QR Code Novo)](#-8-reset-de-sessão-qr-code-novo)

---

## 💡 1. Sobre o Projeto
O bot foi desenvolvido para otimizar o fluxo de atendimento da recepção da Clínica Escola. Ele funciona através de uma árvore de decisão conversacional baseada em máquina de estados finitos (`session.state`), coletando dados essenciais de forma estruturada e gerando cartões de atendimento (logs formatados no console) para a equipe da recepção quando necessário.

1.1 Stack e Protocolo de Comunicação
-Linguagem e Runtime: Node.js (v18+).
-Camada de Transporte: Construído utilizando a biblioteca @whiskeysockets/baileys.
-Natureza da Conexão: Ao contrário da API oficial (Meta/WhatsApp Business Cloud API), o sistema opera emulando o protocolo binário criptografado WebSocket do WhatsApp Web.
-Custo Operacional: Sem cobrança de tarifas por template ou por mensagem ativa/passiva, demandando apenas a persistência de sessão via QR Code.

1.2 Arquitetura Orientada a Estados
O bot adota uma máquina de estados finitos (FSM) em memória gerenciada por sessão individualizada via JID (remoteJid). O atributo session.state guia o fluxo de navegação do usuário de forma conversacional e determinística:
-Sessão Persistente: Mapeada por número de telefone para evitar cruzamento de dados de pacientes.
-Fallback e Reset: Estados possuem timeouts e gatilhos para retorno facilitado ao menu inicial (Opção 0 ou comandos de cancelamento).
-Isolamento Modular: O fluxo divide-se em nós de validação (ex.: conferência de vínculos institucionais) antes de avançar para coleta de dados sensíveis ou escalonamento.

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

2. Instale as dependências do projeto:
```bash
npm install @whiskeysockets/baileys qrcode-terminal
```

3. Inicie o bot principal:
```bash
node bot.js
```
📌 Nota: Na primeira execução, será gerado um QR Code no terminal. Abra o WhatsApp no celular que será usado pelo bot, acesse Aparelhos Conectados > Conectar um Aparelho e aponte a câmera para o terminal.

## 🧪 6. Simulador de Terminal (Testes sem Celular)
Se você quiser testar os menus, fluxos e regras de negócio rapidamente direto pelo teclado do seu computador sem conectar um celular real:
```bash
node teste-terminal.js
```
Digite os números correspondentes às opções no terminal para simular as conversas e respostas do robô.

## 🔄 7. Execução Contínua 24/7 (Produção)
Para garantir que o bot funcione ininterruptamente em um servidor Linux (sem cair ao fechar a sessão SSH e reiniciando automaticamente em caso de falhas), recomenda-se o uso do PM2:
Instale o PM2 globalmente no servidor:
```bash
npm install -g pm2
```

Inicie o bot pelo PM2:
```bash
pm2 start bot.js --name "bot-clinica"
```

Configure para iniciar automaticamente caso o servidor seja reiniciado:
```bash
pm2 startup
pm2 save
```
Comandos úteis do PM2:
pm2 status — Verifica se o bot está ativo.
pm2 logs bot-clinica — Acompanha os logs e cards da recepção em tempo real.
pm2 restart bot-clinica — Reinicia a aplicação.

## 🧹 8. Reset de Sessão (QR Code Novo)
Se precisar desconectar o WhatsApp atual e gerar um novo QR Code, apague a pasta de credenciais gerada pelo Baileys:
Linux / macOS:
```bash
rm -rf auth_info_baileys
```

Windows (PowerShell):
```bash
Remove-Item -Recurse -Force auth_info_baileys
```
