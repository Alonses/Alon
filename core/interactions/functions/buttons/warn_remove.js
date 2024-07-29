const { listAllGuildWarns, dropGuildWarn } = require("../../../database/schemas/Guild_warns")
const {updateGuild} = require("../../../database/schemas/Guild");

module.exports = async ({ client, user, interaction, dados }) => {

    const escolha = parseInt(dados.split(".")[1])
    const id_alvo = parseInt(dados.split(".")[2])

    const warns_guild = await listAllGuildWarns(client, interaction.guild.id)

    // Tratamento dos cliques
    // 0 -> Cancela
    // 1 -> Confirma
    // 2 -> Acesso aos botões deste painel

    if (escolha === 1) {

        // Removendo a advertência
        await dropGuildWarn(client, interaction.guild.id, id_alvo)

        // Menos que o limite necessário para o recurso ser ativo
        if ((warns_guild.length - 1) < 2)
            await updateGuild(client, interaction.guild.id, { conf_warn: false })

        dados = "0.3"
        return require('./guild_warns_button')({ client, user, interaction, dados })
    }

    if (escolha === 2) {

        if (warns_guild[warns_guild.length - 1].rank !== id_alvo)
            return interaction.update({
                content: client.tls.phrase(user, "mode.warn.trava_advertencia_2", client.defaultEmoji("paper"))
            })

        if (id_alvo === 0)
            return interaction.update({
                content: client.tls.phrase(user, "mode.warn.trava_advertencia", client.defaultEmoji("paper"))
            })

        // Criando os botões para o menu de remoção de strikes
        const row = client.create_buttons([
            { id: "warn_remove", name: client.tls.phrase(user, "menu.botoes.confirmar"), type: 2, emoji: client.emoji(10), data: `1|${id_alvo}` },
            { id: "warn_remove", name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 3, emoji: client.emoji(0), data: `0|${id_alvo}` }
        ], interaction)

        // Listando os botões para confirmar e cancelar a operação
        return interaction.update({
            components: [row]
        })
    }

    dados = `0.0.${id_alvo}`
    require('../../chunks/warn_configure')({ client, user, interaction, dados })
}