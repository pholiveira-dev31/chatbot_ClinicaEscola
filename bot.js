const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

// Armazenamento de sessões/estados dos usuários
const userSessions = {};

// Configuração do horário de atendimento (Segunda a Sexta, 07h-11h e 13h-17h)
function isBusinessHours() {
    const now = new Date();
    const day = now.getDay(); // 0 = Domingo, 6 = Sábado
    if (day === 0 || day === 6) return false;

    const hour = now.getHours();
    return (hour >= 7 && hour < 11) || (hour >= 13 && hour < 17);
}

// Timeout de Inatividade (12 Horas)
const INACTIVITY_TIMEOUT_MS = 12 * 60 * 60 * 1000;

function checkAndResetInactivity(from) {
    const session = userSessions[from];
    if (session && session.lastInteraction) {
        const now = Date.now();
        if (now - session.lastInteraction > INACTIVITY_TIMEOUT_MS) {
            delete userSessions[from];
            console.log(`⏱️ Sessão de ${from} restaurada por inatividade (timeout de 12h).`);
        }
    }
}

let qrJaExibido = false; // Controle de QR Code único

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && !qrJaExibido) {
            qrJaExibido = true;
            console.log('\n==================================================');
            console.log('📌 QR CODE GERADO COM SUCESSO!');
            console.log('Aguardando a clínica escanear...');
            console.log('==================================================\n');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
            console.log('Conexão fechada. Reconectando...', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            qrJaExibido = false;
            console.log('✅ Bot da Clínica Escola CPTL/UFMS conectado ao WhatsApp com sucesso!');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();

        checkAndResetInactivity(from);

        if (!userSessions[from]) {
            userSessions[from] = {
                state: 'START',
                data: {},
                lastInteraction: Date.now()
            };
        }

        userSessions[from].lastInteraction = Date.now();
        const session = userSessions[from];

        const lowerText = text.toLowerCase();
        const resetKeywords = ['#', 'menu', 'voltar', 'inicio', 'início', 'oi', 'ola', 'olá', 'bot'];
        
        if (resetKeywords.includes(lowerText)) {
            session.state = 'MAIN_MENU';
            session.data = {};
            await sendMainMenu(sock, from);
            return;
        }

        if (session.state === 'START' && !isBusinessHours()) {
            await sock.sendMessage(from, {
                text: "⚠️ *Aviso de Expediente*:\n\nNosso horário de atendimento é de *segunda a sexta-feira, das 07h às 11h e das 13h às 17h*.\n\nSua mensagem foi recebida e responderemos assim que o expediente for iniciado."
            });
            session.state = 'MAIN_MENU';
            await sendMainMenu(sock, from);
            return;
        }

        if (session.state === 'HUMAN_ATTENDANCE') {
            return;
        }

        await handleState(sock, from, text, session);
    });
}

async function sendMainMenu(sock, from) {
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

    await sock.sendMessage(from, { text: menuText });
}

async function handleState(sock, from, text, session) {
    const input = text.trim();

    switch (session.state) {
        case 'START':
            session.state = 'MAIN_MENU';
            await sendMainMenu(sock, from);
            break;

        case 'MAIN_MENU':
            switch (input) {
                case '1':
                    session.state = 'AGENDAMENTO_TIPO_USER';
                    await sock.sendMessage(from, {
                        text: `🗓️ *Agendamento Clínico / Pediatra*\n\nPor favor, informe a qual grupo o paciente pertence:\n\n1️⃣ Aluno UFMS/CPTL\n2️⃣ Servidor ou familiar UFMS/CPTL\n3️⃣ Terceirizado UFMS/CPTL\n4️⃣ Nenhum (Comunidade externa)`
                    });
                    break;

                case '2':
                    session.state = 'RETORNO_TIPO';
                    await sock.sendMessage(from, {
                        text: `🔄 *Retorno Médico*\n\nSelecione o tipo de solicitação:\n\n1️⃣ Informação de data e horário do retorno\n2️⃣ Não compareci ao retorno e gostaria de reagendar`
                    });
                    break;

                case '3':
                    session.state = 'EXAMES_OPCAO';
                    await sock.sendMessage(from, {
                        text: `🔬 *Exames*\n\nSelecione uma opção:\n\n1️⃣ Autorização de exames médicos\n2️⃣ Resultado de Biópsia`
                    });
                    break;

                case '4':
                    await sock.sendMessage(from, {
                        text: `🔗 *Encaminhamentos*\n\nPara consultar o status do seu encaminhamento na regulação, confira em:\nhttps://sisreg-transparencia.treslagoas.ms.gov.br/\n\n_(Digite # a qualquer momento para voltar ao menu automático)_`
                    });
                    break;

                case '5':
                    await sock.sendMessage(from, {
                        text: `🌿 *Práticas Integrativas*\n\nOs interessados no atendimento em Práticas Integrativas (como ventosaterapia, moxaterapia, auriculoterapia, imposição de mãos, entre outros) devem preencher o formulário de inscrição presencialmente na recepção da clínica-escola.\n\nOu preencher o formulário via Google Forms:\nhttps://forms.gle/exemplo\n\n_(Digite # para voltar ao menu principal)_`
                    });
                    break;

                case '6':
                    await sock.sendMessage(from, {
                        text: `🧠 *Saúde Mental*\n\nAtendimento em grupo comunitário de saúde mental, um espaço coletivo de acolhimento, escuta, diálogo e troca de experiências, voltado à prevenção de agravos, autocuidado, fortalecimento de vínculos e identificação de necessidades de acompanhamento ou encaminhamento especializado.\n\nPara participar do Grupo Comunitário de Saúde Mental, por favor, preencha o formulário presencialmente na recepção da clínica-escola.\n\nOu preencher o formulário via Google Forms:\nhttps://forms.gle/exemplo\n\n_(Digite # para voltar ao menu principal)_`
                    });
                    break;

                case '7':
                    await sock.sendMessage(from, {
                        text: `📍 *Localização da Clínica Escola CPTL/UFMS*\n\nEndereço: Av. Cap. Olinto Mancini, 1662 - Jardim Primaveril, Três Lagoas - MS, 79600-080 (CPTL 1).\n\n_(Digite # para voltar ao menu principal)_`
                    });
                    break;

                case '0':
                    session.state = 'HUMAN_ATTENDANCE';
                    await sock.sendMessage(from, {
                        text: `👨‍⚕️ *Atendimento com a Recepção*\n\nSua conversa foi direcionada para a recepção da Clínica Escola. Um de nossos atendentes responderá em breve por aqui.\n\n_(Digite # para reativar o menu automático)_`
                    });
                    console.log(`CARD RECEPÇÃO: Atendimento Humano Solicitado por ${from}`);
                    break;

                default:
                    await sock.sendMessage(from, { text: "⚠️ Opção inválida! Digite um número de 0 a 7 ou # para voltar." });
                    break;
            }
            break;

        /* --- FLUXO 1: AGENDAMENTO --- */
        case 'AGENDAMENTO_TIPO_USER':
            if (['1', '2', '3'].includes(input)) {
                session.data.tipoUsuario = input === '1' ? 'Aluno UFMS/CPTL' : input === '2' ? 'Servidor/Familiar UFMS' : 'Terceirizado UFMS';
                session.state = 'AGENDAMENTO_ESPECIALIDADE';
                await sock.sendMessage(from, {
                    text: `Gostaria de agendar com:\n\n1️⃣ Clínico Geral\n2️⃣ Pediatra`
                });
            } else if (input === '4') {
                await sock.sendMessage(from, {
                    text: `ℹ️ Para a comunidade externa, os agendamentos médicos são realizados exclusivamente via Regulação Municipal de Saúde, mediante encaminhamento.\n\n_(Digite # para voltar ao menu principal)_`
                });
                session.state = 'MAIN_MENU';
            } else {
                await sock.sendMessage(from, { text: "⚠️ Por favor, digite uma opção de 1 a 4." });
            }
            break;

        case 'AGENDAMENTO_ESPECIALIDADE':
            if (input === '1') {
                session.data.especialidade = 'Clínico Geral';
                session.state = 'AGENDAMENTO_NOME';
                await sock.sendMessage(from, {
                    text: `🗓️ *Atendimento de segundas e terças, das 7h às 17h*\n\nInforme o NOME COMPLETO do paciente:`
                });
            } else if (input === '2') {
                session.data.especialidade = 'Pediatra';
                session.state = 'AGENDAMENTO_NOME';
                await sock.sendMessage(from, {
                    text: `🗓️ *Atendimento às quintas-feiras, das 13:30 às 15:30*\n\nInforme o NOME COMPLETO do paciente:`
                });
            } else {
                await sock.sendMessage(from, { text: "⚠️ Digite 1 para Clínico Geral ou 2 para Pediatra." });
            }
            break;

        case 'AGENDAMENTO_NOME':
            session.data.nome = input.toUpperCase();
            session.state = 'AGENDAMENTO_CPF';
            await sock.sendMessage(from, { text: `Digite o CPF do Paciente (apenas números):` });
            break;

        case 'AGENDAMENTO_CPF':
            session.data.cpf = input;
            await sock.sendMessage(from, {
                text: `✅ *Solicitação de Agendamento registrada!*\n\nVerificaremos a disponibilidade de horário e em breve entraremos em contato.\n\n_(Digite # a qualquer momento para voltar ao menu)_`
            });

            console.log(`
📩 [CARD RECEPÇÃO - NOVO AGENDAMENTO]
📌 SOLICITAÇÃO: Agendamento (${session.data.especialidade})
👤 GRUPO: ${session.data.tipoUsuario}
👤 PACIENTE: ${session.data.nome}
📄 CPF: ${session.data.cpf}
📱 TELEFONE: ${from}
------------------------------------------------`);
            session.state = 'HUMAN_ATTENDANCE';
            break;

        /* --- FLUXO 2: RETORNO MÉDICO --- */
        case 'RETORNO_TIPO':
            if (['1', '2'].includes(input)) {
                session.data.tipoRetorno = input; // '1' para Informação, '2' para Reagendamento
                session.state = 'RETORNO_ESPECIALIDADE';
                await sock.sendMessage(from, {
                    text: `Por favor, escolha a especialidade médica:\n\n1️⃣ Dermatologia\n2️⃣ Endocrinologia\n3️⃣ Ortopedia\n4️⃣ Pediatria\n5️⃣ Pneumologia`
                });
            } else {
                await sock.sendMessage(from, { text: "⚠️ Digite 1 ou 2." });
            }
            break;

        case 'RETORNO_ESPECIALIDADE':
            const espMap = { '1': 'Dermatologia', '2': 'Endocrinologia', '3': 'Ortopedia', '4': 'Pediatria', '5': 'Pneumologia' };
            
            if (!espMap[input]) {
                await sock.sendMessage(from, { text: "⚠️ Opção inválida. Digite de 1 a 5." });
                return;
            }

            session.data.especialidadeRetorno = espMap[input];

            if (session.data.tipoRetorno === '2' && input !== '1') {
                await sock.sendMessage(from, {
                    text: `ℹ️ Favor, reagendar a consulta em sua unidade de saúde.\n\n_(Digite # para voltar ao menu principal)_`
                });
                session.state = 'MAIN_MENU';
            } else {
                session.state = 'RETORNO_NOME';
                await sock.sendMessage(from, { text: `Informe o NOME COMPLETO do paciente:` });
            }
            break;

        case 'RETORNO_NOME':
            session.data.nome = input.toUpperCase();
            session.state = 'RETORNO_CPF';
            await sock.sendMessage(from, { text: `Digite o CPF do Paciente (apenas números):` });
            break;

        case 'RETORNO_CPF':
            session.data.cpf = input;
            await sock.sendMessage(from, {
                text: `✅ *Solicitação de Retorno registrada!*\n\nVerificaremos a disponibilidade de horário e em breve entraremos em contato.\n\n_(Digite # a qualquer momento para voltar ao menu)_`
            });

            const descTipo = session.data.tipoRetorno === '1' ? 'Informação de data/horário de retorno' : 'Reagendamento por não comparecimento';

            console.log(`
📩 [CARD RECEPÇÃO - SOLICITAÇÃO DE RETORNO]
📌 TIPO: ${descTipo}
👨‍⚕️ ESPECIALIDADE: ${session.data.especialidadeRetorno}
👤 PACIENTE: ${session.data.nome}
📄 CPF: ${session.data.cpf}
📱 TELEFONE: ${from}
------------------------------------------------`);
            session.state = 'HUMAN_ATTENDANCE';
            break;

        /* --- FLUXO 3: EXAMES --- */
        case 'EXAMES_OPCAO':
            if (input === '1') {
                await sock.sendMessage(from, {
                    text: `Para consultar o status da solicitação ou posição na fila da regulação, confira em:\nhttps://sisreg-transparencia.treslagoas.ms.gov.br/\n\n_(Digite # a qualquer momento para voltar ao menu automático)_`
                });
                session.state = 'MAIN_MENU';
            } else if (input === '2') {
                session.state = 'EXAMES_NOME';
                await sock.sendMessage(from, { text: `Informe o NOME COMPLETO do paciente:` });
            } else {
                await sock.sendMessage(from, { text: "⚠️ Digite 1 para Autorização ou 2 para Biópsia." });
            }
            break;

        case 'EXAMES_NOME':
            session.data.nome = input.toUpperCase();
            session.state = 'EXAMES_CPF';
            await sock.sendMessage(from, { text: `Digite o CPF do Paciente (apenas números):` });
            break;

        case 'EXAMES_CPF':
            session.data.cpf = input;
            await sock.sendMessage(from, {
                text: `✅ *Solicitação de resultado registrada!*\n\nVerificaremos sua solicitação e em breve entraremos em contato.\n\n_(Digite # para voltar ao menu)_`
            });

            console.log(`
📩 [CARD RECEPÇÃO - RESULTADO DE BIÓPSIA]
📌 SOLICITAÇÃO: Resultado de Biópsia
👤 PACIENTE: ${session.data.nome}
📄 CPF: ${session.data.cpf}
📱 TELEFONE: ${from}
------------------------------------------------`);
            session.state = 'HUMAN_ATTENDANCE';
            break;

        default:
            session.state = 'MAIN_MENU';
            await sendMainMenu(sock, from);
            break;
    }
}

connectToWhatsApp();
