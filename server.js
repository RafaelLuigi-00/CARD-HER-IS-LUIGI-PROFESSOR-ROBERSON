
import express from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
process.env.NODE_TLS_REJECT_UNAUTHORIZED= '0'

const diretorioProjeto = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(diretorioProjeto, '(1).env') });

const app = express();
const porta = Number(process.env.PORT) || 3000;
const urlApiGroq = 'https://api.groq.com/openai/v1/chat/completions';
const modeloGroq = process.env.GROQ_MODEL?.trim() || 'openai/gpt-oss-120b';

app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(diretorioProjeto, 'public')));

function obterMensagemDeErroGroq(status) {
    if ([401, 403].includes(status)) {
        return 'A chave Groq foi recusada. Atualize GROQ_API_KEY no arquivo (1).env.';
    }
    if (status === 404) {
        return 'Modelo Groq não encontrado. Confira GROQ_MODEL no arquivo (1).env.';
    }
    if (status === 429) {
        return 'Limite da API Groq atingido. Tente novamente em instantes.';
    }
    return 'Erro na comunicação com a Groq.';
}

app.post('/chat', async (req, res) => {
    try {
        const chaveGroq = process.env.GROQ_API_KEY?.trim().replace(/^GROQ-/i, '');
        const historico = Array.isArray(req.body?.historico) ? req.body.historico : [];

        if (!chaveGroq) {
            return res.status(503).json({ erro: 'Configure GROQ_API_KEY no arquivo (1).env.' });
        }

        const mensagensValidas = historico
            .filter((mensagem) => mensagem
                && ['user', 'assistant'].includes(mensagem.role)
                && typeof mensagem.content === 'string'
                && mensagem.content.trim())
            .map((mensagem) => ({ role: mensagem.role, content: mensagem.content.slice(0, 4000) }))
            .slice(-10);

        const mensagens = [
            {
                role: 'system',
                content: 'Você é o HeroBot do Card Hero. Responda em português brasileiro, de forma curta, clara e bem-humorada. Ajude o usuário com informações sobre Batman, Goku, Spider-Man e Venom. Não invente poderes ou fatos quando não souber.'
            },
            ...mensagensValidas
        ];

        const respostaGroq = await fetch(urlApiGroq, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${chaveGroq}`
            },
            body: JSON.stringify({
                model: modeloGroq,
                messages: mensagens
            }),
            signal: AbortSignal.timeout(30000)
        });

        const resultado = await respostaGroq.json().catch(() => ({}));

        if (!respostaGroq.ok) {
            console.error('Groq respondeu com status', respostaGroq.status, resultado.error?.message || 'sem detalhes');
            return res.status(502).json({ erro: obterMensagemDeErroGroq(respostaGroq.status) });
        }

        const resposta = resultado.choices?.[0]?.message?.content;
        if (!resposta) return res.status(502).json({ erro: 'A IA não retornou uma resposta.' });
        return res.json({ resposta });
    } catch (erro) {
        const codigoErro = erro?.cause?.code || (erro instanceof Error ? erro.message : String(erro));
        console.error('Falha ao consultar a Groq:', codigoErro);
        return res.status(502).json({ erro: 'Não foi possível conectar com segurança à Groq. Confira a rede e o certificado TLS do servidor.' });
    }
});

app.listen(porta, () => {
    console.log(`Servidor rodando na porta ${porta}.`);
});
