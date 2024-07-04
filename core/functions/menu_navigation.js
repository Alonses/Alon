module.exports = (client, user, dados, pagina) => {

    let row = [], b_disabled = [false, false]
    let paginas = Math.ceil(dados.values.length / 25)

    // Verificando se não há mais dados para uma próxima página
    if (paginas == (pagina + 1)) b_disabled[1] = true

    if (pagina === 0) // Desativa apenas se tiver na 1° página
        b_disabled[0] = true

    // Verificando se a quantidade de elementos supera o permitido nos menus, gerando um navegador
    if (Math.ceil(dados.values.length / 25) > 1)
        row = [
            { id: dados.reback?.split(".")[0] || dados.alvo, name: '◀️', type: 1, data: `0|${pagina}.${dados.operation}.${dados.reback?.split(".")[1] || dados.alvo}${dados.submenu ? `.${dados.submenu}` : ""}`, disabled: b_disabled[0] },
            { id: dados.reback?.split(".")[0] || dados.alvo, name: '▶️', type: 1, data: `1|${pagina}.${dados.operation}.${dados.reback?.split(".")[1] || dados.alvo}${dados.submenu ? `.${dados.submenu}` : ""}`, disabled: b_disabled[1] },
            { id: "indica_pag", name: `${client.tls.phrase(user, "menu.botoes.pagina")} ${pagina + 1} / ${paginas}`, type: 2, disabled: true }
        ]

    return row
}