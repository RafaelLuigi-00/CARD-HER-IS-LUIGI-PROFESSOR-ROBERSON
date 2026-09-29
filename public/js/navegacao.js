export function inicializarNavegacao() {
    const botaoMenu = document.querySelector(".menu-toggle");
    const linksMenu = document.querySelector(".menu-links");

    botaoMenu?.addEventListener("click", () => {
        const aberto = linksMenu?.classList.toggle("aberto") ?? false;
        botaoMenu.setAttribute("aria-expanded", String(aberto));
    });

    linksMenu?.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            linksMenu.classList.remove("aberto");
            botaoMenu?.setAttribute("aria-expanded", "false");
        });
    });
}
