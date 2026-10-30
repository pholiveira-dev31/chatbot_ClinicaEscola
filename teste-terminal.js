const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const userSessions = {};
const FROM_SIMULATED = "5567999999999@s.whatsapp.net";

function getSession() {
    if (!userSessions[FROM_SIMULATED]) {
        userSessions[FROM_SIMULATED] = {
            state: 'START',
            data: {},
            lastInteraction: Date.now()
        };
    }
    return userSessions[FROM_SIMULATED];
}

function sendBotMessage(text) {
    console.log(`\n🤖 BOT:\n${text}\n`);
}

function logReceptionCard(cardText) {
    console.log(`\n📩 [TELA DA RECEPÇÃO - CARD DE NOTIFICAÇÃO]:\n${cardText}\n`);
}

function sendMainMenu() {
    const menuText = 
`🏥 *CLÍNICA ESCOLA CPTL/UFMS - ATENDIMENTO DIGITAL*

Por favor, digite o número correspondente à sua opção:

1️⃣ Agendamento Clínico/Pediatra
2️⃣ Retorno Médico
3️⃣ Exames
4️⃣ Encaminhamentos
5️⃣ Práticas Integrativas
6️⃣ Saúde Mental
7️⃣ Localização
0️⃣ Falar com Atendente

_(Digite # ou MENU a qualquer momento para voltar a este menu)_`;
    sendBotMessage(menuText);
}

function processInput(inputText) {
    const text = inputText.trim();
    const session = getSession();
    const lowerText = text.toLowerCase();

    const resetKeywords = ['#', 'menu', 'voltar', 'inicio', 'início', 'oi', 'ola', 'olá', 'bot'];
    if (resetKeywords.includes(lowerText)) {
        session.state = 'MAIN_MENU';
        session.data = {};
        sendMainMenu();
        return;
    }

    if (session.state === 'HUMAN_ATTENDANCE') {
        sendBotMessage("⚠️ O atendimento está em modo HUMANO. Para reativar o robô automático, digite # ou MENU.");
        return;
    }

    switch (session.state) {
        case 'START':
            session.state = 'MAIN_MENU';
            sendMainMenu();
            break;

        case 'MAIN_MENU':
            switch (text) {
                case '1':
                    session.state = 'AGENDAMENTO_TIPO_USER';
                    sendBotMessage(`🗓️ *Agendamento Clínico / Pediatra*\n\nPor favor, informe a qual grupo o paciente pertence:\n\n1️⃣ Aluno UFMS/CPTL\n2️⃣ Servidor ou familiar UFMS/CPTL\n3️⃣ Terceirizado UFMS/CPTL\n4️⃣ Nenhum (Comunidade externa)`);
                    break;

                case '2':
                    session.state = 'RETORNO_TIPO';
                    sendBotMessage(`🔄 *Retorno Médico*\n\nSelecione o tipo de solicitação:\n\n1️⃣ Informação de data e horário do retorno\n2️⃣ Não compareci ao retorno e gostaria de reagendar`);
                    break;

                case '3':
                    session.state = 'EXAMES_OPCAO';
                    sendBotMessage(`🔬 *Exames*\n\nSelecione uma opção:\n\n1️⃣ Autorização de exames médicos\n2️⃣ Resultado de Biópsia`);
                    break;

                case '4':
                    sendBotMessage(`🔗 *Encaminhamentos*\n\nPara consultar o status do seu encaminhamento na regulação, confira em:\nhttps://sisreg-transparencia.treslagoas.ms.gov.br/\n\n_(Digite # a qualquer momento para voltar ao menu automático)_`);
                    break;

                case '5':
                    sendBotMessage(`🌿 *Práticas Integrativas*\n\nOs interessados no atendimento em Práticas Integrativas (como ventosaterapia, moxaterapia, auriculoterapia, imposição de mãos, entre outros) devem preencher o formulário de inscrição presencialmente na recepção da clínica-escola.\n\nOu preencher o formulário via Google Forms:\nhttps://forms.gle/exemplo\n\n_(Digite # para voltar ao menu principal)_`);
                    break;

                case '6':
                    sendBotMessage(`🧠 *Saúde Mental*\n\nAtendimento em grupo comunitário de saúde mental, um espaço coletivo de acolhimento, escuta, diálogo e troca de experiências, voltado à prevenção de agravos, autocuidado, fortalecimento de vínculos e identificação de necessidades de acompanhamento ou encaminhamento especializado.\n\nPara participar do Grupo Comunitário de Saúde Mental, por favor, preencha o formulário presencialmente na recepção da clínica-escola.\n\nOu preencher o formulário via Google Forms:\nhttps://forms.gle/exemplo\n\n_(Digite # para voltar ao menu principal)_`);
                    break;

                case '7':
                    sendBotMessage(`📍 *Localização da Clínica Escola CPTL/UFMS*\n\nEndereço: Av. Cap. Olinto Mancini, 1662 - Jardim Primaveril, Três Lagoas - MS, 79600-080 (CPTL 1).\n\n_(Digite # para voltar ao menu principal)_`);
                    break;

                case '0':
                    session.state = 'HUMAN_ATTENDANCE';
                    sendBotMessage(`👨‍⚕️ *Atendimento com a Recepção*\n\nSua conversa foi direcionada para a recepção da Clínica Escola. Um de nossos atendentes responderá em breve por aqui.\n\n_(Digite # para reativar o menu automático)_`);
                    logReceptionCard(`📌 SOLICITAÇÃO: Atendimento Geral / Recepção\n📱 TELEFONE: ${FROM_SIMULATED}`);
                    break;

                default:
                    sendBotMessage("⚠️ Opção inválida! Digite um número de 0 a 7 ou # para voltar.");
                    break;
            }
            break;

        /* --- AGENDAMENTO --- */
        case 'AGENDAMENTO_TIPO_USER':
            if (['1', '2', '3'].includes(text)) {
                session.data.tipoUsuario = text === '1' ? 'Aluno UFMS/CPTL' : text === '2' ? 'Servidor/Familiar UFMS' : 'Terceirizado UFMS';
                session.state = 'AGENDAMENTO_ESPECIALIDADE';
                sendBotMessage(`Gostaria de agendar com:\n\n1️⃣ Clínico Geral\n2️⃣ Pediatra`);
            } else if (text === '4') {
                sendBotMessage(`ℹ️ Para a comunidade externa, os agendamentos médicos são realizados exclusivamente via Regulação Municipal de Saúde, mediante encaminhamento.\n\n_(Digite # para voltar ao menu principal)_`);
                session.state = 'MAIN_MENU';
            } else {
                sendBotMessage("⚠️ Por favor, digite uma opção de 1 a 4.");
            }
            break;

        case 'AGENDAMENTO_ESPECIALIDADE':
            if (text === '1') {
                session.data.especialidade = 'Clínico Geral';
                session.state = 'AGENDAMENTO_NOME';
                sendBotMessage(`🗓️ *Atendimento de segundas e terças, das 7h às 17h*\n\nInforme o NOME COMPLETO do paciente:`);
            } else if (text === '2') {
                session.data.especialidade = 'Pediatra';
                session.state = 'AGENDAMENTO_NOME';
                sendBotMessage(`🗓️ *Atendimento às quintas-feiras, das 13:30 às 15:30*\n\nInforme o NOME COMPLETO do paciente:`);
            } else {
                sendBotMessage("⚠️ Digite 1 para Clínico Geral ou 2 para Pediatra.");
            }
            break;

        case 'AGENDAMENTO_NOME':
            session.data.nome = text.toUpperCase();
            session.state = 'AGENDAMENTO_CPF';
            sendBotMessage(`Digite o CPF do Paciente (apenas números):`);
            break;

        case 'AGENDAMENTO_CPF':
            session.data.cpf = text;
            sendBotMessage(`✅ *Solicitação de Agendamento registrada!*\n\nVerificaremos a disponibilidade de horário e em breve entraremos em contato.\n\n_(Digite # a qualquer momento para voltar ao menu)_`);
            logReceptionCard(`📌 SOLICITAÇÃO: Agendamento (${session.data.especialidade})\n👤 GRUPO: ${session.data.tipoUsuario}\n👤 PACIENTE: ${session.data.nome}\n📄 CPF: ${session.data.cpf}\n📱 TELEFONE: ${FROM_SIMULATED}`);
            session.state = 'HUMAN_ATTENDANCE';
            break;

        /* --- RETORNO MÉDICO --- */
        case 'RETORNO_TIPO':
            if (['1', '2'].includes(text)) {
                session.data.tipoRetorno = text;
                session.state = 'RETORNO_ESPECIALIDADE';
                sendBotMessage(`Por favor, escolha a especialidade médica:\n\n1️⃣ Dermatologia\n2️⃣ Endocrinologia\n3️⃣ Ortopedia\n4️⃣ Pediatria\n5️⃣ Pneumologia`);
            } else {
                sendBotMessage("⚠️ Digite 1 ou 2.");
            }
            break;

        case 'RETORNO_ESPECIALIDADE':
            const espMap = { '1': 'Dermatologia', '2': 'Endocrinologia', '3': 'Ortopedia', '4': 'Pediatria', '5': 'Pneumologia' };
            if (!espMap[text]) {
                sendBotMessage("⚠️ Opção inválida. Digite de 1 a 5.");
                return;
            }

            session.data.especialidadeRetorno = espMap[text];

            if (session.data.tipoRetorno === '2' && text !== '1') {
                sendBotMessage(`ℹ️ Favor, reagendar a consulta em sua unidade de saúde.\n\n_(Digite # para voltar ao menu principal)_`);
                session.state = 'MAIN_MENU';
            } else {
                session.state = 'RETORNO_NOME';
                sendBotMessage(`Informe o NOME COMPLETO do paciente:`);
            }
            break;

        case 'RETORNO_NOME':
            session.data.nome = text.toUpperCase();
            session.state = 'RETORNO_CPF';
            sendBotMessage(`Digite o CPF do Paciente (apenas números):`);
            break;

        case 'RETORNO_CPF':
            session.data.cpf = text;
            sendBotMessage(`✅ *Solicitação de Retorno registrada!*\n\nVerificaremos a disponibilidade de horário e em breve entraremos em contato.\n\n_(Digite # a qualquer momento para voltar ao menu)_`);
            const descTipo = session.data.tipoRetorno === '1' ? 'Informação de data/horário de retorno' : 'Reagendamento por não comparecimento';
            logReceptionCard(`📌 TIPO: ${descTipo}\n👨‍⚕️ ESPECIALIDADE: ${session.data.especialidadeRetorno}\n👤 PACIENTE: ${session.data.nome}\n📄 CPF: ${session.data.cpf}\n📱 TELEFONE: ${FROM_SIMULATED}`);
            session.state = 'HUMAN_ATTENDANCE';
            break;

        /* --- EXAMES --- */
        case 'EXAMES_OPCAO':
            if (text === '1') {
                sendBotMessage(`Para consultar o status da solicitação ou posição na fila da regulação, confira em:\nhttps://sisreg-transparencia.treslagoas.ms.gov.br/\n\n_(Digite # a qualquer momento para voltar ao menu automático)_`);
                session.state = 'MAIN_MENU';
            } else if (text === '2') {
                session.state = 'EXAMES_NOME';
                sendBotMessage(`Informe o NOME COMPLETO do paciente:`);
            } else {
                sendBotMessage("⚠️ Digite 1 para Autorização ou 2 para Biópsia.");
            }
            break;

        case 'EXAMES_NOME':
            session.data.nome = text.toUpperCase();
            session.state = 'EXAMES_CPF';
            sendBotMessage(`Digite o CPF do Paciente (apenas números):`);
            break;

        case 'EXAMES_CPF':
            session.data.cpf = text;
            sendBotMessage(`✅ *Solicitação de resultado registrada!*\n\nVerificaremos sua solicitação e em breve entraremos em contato.\n\n_(Digite # para voltar ao menu)_`);
            logReceptionCard(`📌 SOLICITAÇÃO: Resultado de Biópsia\n👤 PACIENTE: ${session.data.nome}\n📄 CPF: ${session.data.cpf}\n📱 TELEFONE: ${FROM_SIMULATED}`);
            session.state = 'HUMAN_ATTENDANCE';
            break;

        default:
            session.state = 'MAIN_MENU';
            sendMainMenu();
            break;
    }
}

console.log("=== SIMULADOR DE TESTE DO BOT DA CLÍNICA ESCOLA ===");
console.log("Digite qualquer mensagem para iniciar ou interagir. Digite 'sair' para encerrar.\n");

processInput("oi");

rl.on('line', (line) => {
    if (line.trim().toLowerCase() === 'sair') {
        rl.close();
        return;
    }
    processInput(line);
});
