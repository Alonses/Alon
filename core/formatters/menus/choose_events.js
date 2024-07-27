const { loggerMap } = require("../patterns/guild")

module.exports = ({ client, user, alvo, valor, data }) => {
    const nome_label = `${loggerMap[valor.type]} ${client.tls.phrase(user, `menu.events.${valor.type}`)}`
    const emoji_label = valor.status ? client.emoji("mc_approve") : client.emoji("mc_oppose")
    const descricao_label = valor.status ? client.tls.phrase(user, "menu.status.ativado") : client.tls.phrase(user, "menu.status.desativado")
    let valor_label = `${alvo.replace("#", "_")}|${valor.type}`

    // Função com um submenu inclusa
    if (data.submenu) valor_label = `${alvo.replace("#", "_")}|${valor.type}.${data.submenu}`

    return { nome_label, emoji_label, descricao_label, valor_label }
}