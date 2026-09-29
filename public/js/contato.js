export function inicializarFormularioDeContato() {
    const formulario = document.getElementById("formContato");
    if (!formulario) return;

    formulario.addEventListener("submit", (event) => {
        event.preventDefault();
        const dados = new FormData(formulario);
        const assunto = String(dados.get("assunto"));
        const corpo = [
            `Nome: ${dados.get("nome")}`,
            `E-mail: ${dados.get("email")}`,
            `Assunto: ${assunto}`,
            "",
            `Mensagem: ${dados.get("mensagem")}`
        ].join("\n");
        const parametros = new URLSearchParams({ subject: `Card Hero: ${assunto}`, body: corpo });
        window.location.href = `mailto:cardhero.contato@herois.com?${parametros}`;
    });
}
