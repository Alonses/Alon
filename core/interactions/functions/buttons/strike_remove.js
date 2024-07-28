const { listAllGuildStrikes, dropGuildStrike } = require("../../../database/schemas/Guild_strikes")

module.exports = async ({ client, user, interaction, dados }) => {

    const escolha = parseInt(dados.split(".")[1])
    const id_alvo = parseInt(dados.split(".")[2])

    const strikes_guild = await listAllGuildStrikes(client, interaction.guild.id)

    // Tratamento dos cliques
    // 0 -> Cancela
    // 1 -> Confirma
    // 2 -> Acesso aos botões deste painel

    if (escolha === 1) {

        // Removendo o strike
        await dropGuildStrike(client, interaction.guild.id, id_alvo)

        dados = "0.4"
        return require('./guild_anti_spam_button')({ client, user, interaction, dados })
    }

    if (escolha === 2) {

        if (strikes_guild[strikes_guild.length - 1].rank !== id_alvo)
            return interaction.update({
                content: client.tls.phrase(user, "mode.warn.trava_advertencia_2", client.defaultEmoji("paper"))
            })

        if (id_alvo === 0)
            return interaction.update({
                content: client.tls.phrase(user, "mode.warn.trava_advertencia", client.defaultEmoji("paper"))
            })

        // Criando os botões para o menu de remoção de strikes
        const row = client.create_buttons([
            { id: "strike_remove", name: client.tls.phrase(user, "menu.botoes.confirmar"), type: 2, emoji: client.emoji(10), data: `1|${id_alvo}` },
            { id: "strike_remove", name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 3, emoji: client.emoji(0), data: `0|${id_alvo}` }
        ], interaction)

        // Listando os botões para confirmar e cancelar a operação
        return interaction.update({
            components: [row]
        })
    }

    dados = `0.0.${id_alvo}`
    require('../../chunks/strike_configure')({ client, user, interaction, dados })
}