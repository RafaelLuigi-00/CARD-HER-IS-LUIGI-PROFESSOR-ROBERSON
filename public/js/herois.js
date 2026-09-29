const poderesPorHeroi = {
    batman: [
        "Intelecto nível gênio",
        "Mestre em artes marciais",
        "Exímio detetive e estrategista",
        "Arsenal tecnológico de alta tecnologia",
        "Condicionamento físico humano máximo"
    ],
    goku: [
        "Transformações Super Saiyajin (até Instinto Superior)",
        "Disparos de energia (Kamehameha)",
        "Teletransporte (Shunkan Ido)",
        "Genki Dama (Esfera de Energia Vital)",
        "Força, velocidade e durabilidade divinas"
    ],
    spiderman: [
        "Sentido Aranha (precognição de perigo)",
        "Habilidade de escalar paredes e superfícies",
        "Força, agilidade e reflexos proporcionais",
        "Lançadores de teia mecânicos resistentes",
        "Intelecto brilhante em ciências"
    ],
    venom: [
        "Mudança de forma física e camuflagem",
        "Força bruta superior à do Homem-Aranha",
        "Fator de cura regenerativo acelerado",
        "Imunidade ao Sentido Aranha",
        "Mandíbulas destrutivas e garras afiadas"
    ]
};

export function inicializarModalDePoderes() {
    const modal = document.getElementById("modalPoderes");
    const tituloModal = document.getElementById("modalTitulo");
    const listaModal = document.getElementById("modalListaPoderes");
    const botaoFechar = document.querySelector(".fechar-modal");

    if (!modal || !tituloModal || !listaModal) return;

    function definirModalAberto(aberto) {
        modal.classList.toggle("ativo", aberto);
        modal.setAttribute("aria-hidden", String(!aberto));
    }

    document.querySelectorAll(".btn-poderes").forEach((botao) => {
        botao.addEventListener("click", () => {
            const cartao = botao.closest(".heroi");
            const idHeroi = cartao?.dataset.heroi;
            const nomeHeroi = cartao?.querySelector("h2")?.textContent;
            const poderes = poderesPorHeroi[idHeroi];

            if (!nomeHeroi || !poderes) return;

            tituloModal.textContent = `Poderes: ${nomeHeroi}`;
            listaModal.replaceChildren(...poderes.map((poder) => {
                const item = document.createElement("li");
                item.textContent = poder;
                return item;
            }));
            definirModalAberto(true);
        });
    });

    botaoFechar?.addEventListener("click", () => definirModalAberto(false));
    modal.addEventListener("click", (event) => {
        if (event.target === modal) definirModalAberto(false);
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") definirModalAberto(false);
    });
}
