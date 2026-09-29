function escaparHtml(texto) {
    const elemento = document.createElement("div");
    elemento.textContent = texto;
    return elemento.innerHTML;
}

function adicionarMensagem(areaChat, texto, tipo) {
    const mensagem = document.createElement("div");
    mensagem.classList.add("chat-msg", tipo);
    mensagem.innerHTML = escaparHtml(texto)
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br>");
    areaChat.appendChild(mensagem);
    areaChat.scrollTop = areaChat.scrollHeight;
}

export function inicializarChatbot() {
    const botaoAbrir = document.getElementById("chatbotToggle");
    const janelaChat = document.getElementById("chatbotJanela");
    const botaoFechar = document.getElementById("chatbotFechar");
    const areaChat = document.getElementById("chatbotCorpo");
    const formularioChat = document.getElementById("chatbotForm");
    const campoMensagem = document.getElementById("chatInput");
    const botaoLimpar = document.getElementById("chatbotLimpar");
    const botaoEnviar = document.getElementById("chatEnviar");
    const historico = [];

    if (!areaChat || !formularioChat || !campoMensagem || !botaoEnviar) return;

    async function enviarMensagem(texto) {
        adicionarMensagem(areaChat, texto, "user");
        campoMensagem.value = "";
        campoMensagem.disabled = true;
        botaoEnviar.disabled = true;

        const indicador = document.createElement("div");
        indicador.classList.add("chat-msg", "digitando");
        indicador.textContent = "HeroBot está pensando...";
        areaChat.appendChild(indicador);
        areaChat.scrollTop = areaChat.scrollHeight;
        historico.push({ role: "user", content: texto });

        try {
            const resposta = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ historico: historico.slice(-12) })
            });
            const dados = await resposta.json();
            if (!resposta.ok || !dados.resposta) {
                throw new Error(dados.erro || "Não foi possível obter uma resposta.");
            }

            historico.push({ role: "assistant", content: dados.resposta });
            adicionarMensagem(areaChat, dados.resposta, "bot");
        } catch (erro) {
            historico.pop();
            const mensagemErro = erro instanceof Error ? erro.message : "Não foi possível conectar à IA.";
            adicionarMensagem(areaChat, mensagemErro, "bot");
        } finally {
            indicador.remove();
            campoMensagem.disabled = false;
            botaoEnviar.disabled = false;
            campoMensagem.focus();
        }
    }

    botaoAbrir?.addEventListener("click", () => {
        janelaChat?.classList.toggle("ativo");
        campoMensagem.focus();
    });

    botaoFechar?.addEventListener("click", () => janelaChat?.classList.remove("ativo"));

    formularioChat.addEventListener("submit", (event) => {
        event.preventDefault();
        const texto = campoMensagem.value.trim();
        if (texto) enviarMensagem(texto);
    });

    document.querySelectorAll("[data-pergunta]").forEach((botao) => {
        botao.addEventListener("click", () => {
            const pergunta = botao.dataset.pergunta;
            if (pergunta) enviarMensagem(pergunta);
        });
    });

    botaoLimpar?.addEventListener("click", () => {
        historico.length = 0;
        areaChat.innerHTML = '<div class="chat-msg bot">Conversa limpa! O que você quer descobrir?</div>';
        campoMensagem.focus();
    });
}
