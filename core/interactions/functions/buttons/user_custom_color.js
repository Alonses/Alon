const { colorsMap, colorsPriceMap } = require("../../../formatters/patterns/user")

module.exports = async ({ client, interaction, dados }) => {
    const user = await client.getUser(interaction.user.id, { misc: true })
    const operacao = parseInt(dados.split(".")[1])

    // Códigos de operação
    // 0 -> Cancela
    // 1 -> Confirmar
    // 2 -> Escolher outra cor

    if (!operacao) return client.tls.report(interaction, user, "menu.botoes.operacao_cancelada", true, 11, interaction.customId)

    if (operacao === 1) {

        // Atribuindo a cor customizada ao usuário
        let cor = dados.split(".")[2]
        const preco = dados.includes("-") ? colorsPriceMap[4] : colorsPriceMap[colorsMap[cor][1]]

        // Cor customizada
        if (dados.includes("-"))
            cor = dados.split("-")[1]

        // Validando se o usuário tem dinheiro suficiente
        if (user.misc.money < preco)
            return interaction.update({
                content: client.tls.phrase(user, "misc.color.sem_money", client.emoji("emojis_negativos"), client.locale(preco)),
                ephemeral: true
            })

        // Salvando a cor de embed customizada
        await client.prisma.userOptionsMisc.update({
            where: { id: user.misc_id },
            data: {
                color: !dados.includes("-") ? colorsMap[cor][0] : dados.split("-")[1],
                money: { increment: -preco }
            }
        })

        // Registrando as movimentações de bufunfas para o usuário
        client.registryStatement(user.id, "misc.b_historico.cor_perfil", false, preco)
        client.journal("reback", preco)

        interaction.update({
            content: client.tls.phrase(user, "misc.color.cor_att", client.emoji("emojis_dancantes")),
            embeds: [],
            components: [],
            ephemeral: true
        })

    } else if (operacao === 2) {

        // Escolhendo uma outra cor padrão
        const cores = [], cor_cache = dados.split(".")[2]

        Object.keys(colorsMap).forEach(cor => {
            if (user.misc.color !== colorsMap[cor][0] && cor_cache !== cor)
                cores.push(cor)
        })

        const data = {
            title: { tls: "menu.menus.escolher_cor" },
            pattern: "static_color",
            alvo: "static_color",
            values: cores
        }

        const row = client.create_buttons([
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `static_color.${cor_cache}` }
        ], interaction)

        interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), row],
            ephemeral: true
        })
    }
}