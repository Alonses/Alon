const { EmbedBuilder } = require("discord.js")

const { listAllUserPreWarns, removeUserPreWarn, getUserPreWarn } = require("../../../database/schemas/User_pre_warns")

module.exports = async ({ client, user, interaction, dados }) => {

    const escolha = parseInt(dados.split(".")[1])

    const id_alvo = dados.split(".")[2]
    const timestamp = parseInt(dados.split(".")[3])

    let pagina_guia = parseInt(dados.split(".")[3]) || 0

    // Tratamento dos cliques
    // 0 -> Cancela
    // 3 -> Menu com escolha para exclusão ou não
    // 2 -> Acesso aos botões deste painel

    // 9 -> Sub guia com os detalhes da advertência escolhida
    // 10 -> Mudar de página na sub guia

    if (escolha === 1) {

        const row = [], user_warns = await listAllUserPreWarns(client, id_alvo, interaction.guild.id)

        // Removendo a advertência do usuário e verificando os cargos do mesmo
        await removeUserPreWarn(client, id_alvo, interaction.guild.id, timestamp)

        if (user_warns.length - 1 > 0)
            row.push({ id: "pre_warn_user_verify", name: client.tls.phrase(user, "menu.botoes.remover_outras"), type: 0, emoji: client.emoji(41), data: `11|${id_alvo}` })

        const obj = {
            content: client.tls.phrase(user, "mode.warn.advertencia_removida", 10),
            embeds: [],
            components: [],
            ephemeral: true
        }

        if (row.length > 0) // Botão para ver outras advertências
            obj.components = [client.create_buttons(row, interaction)]

        return client.reply(interaction, obj)
    } else if (escolha === 3) {

        // Criando os botões para o menu de remoção de strikes
        const row = client.create_buttons([
            { id: "pre_warn_user_verify", name: client.tls.phrase(user, "menu.botoes.confirmar"), type: 2, emoji: client.emoji(10), data: `1|${id_alvo}.${timestamp}` },
            { id: "pre_warn_user_verify", name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 3, emoji: client.emoji(0), data: `9|${id_alvo}.${timestamp}` }
        ], interaction)

        // Listando os botões para confirmar e cancelar a operação
        return interaction.update({
            components: [row]
        })
    } else if (escolha === 9) {

        const user_note = await getUserPreWarn(client, id_alvo, interaction.guild.id, timestamp)
        let motivo_remocao = ""

        if (interaction.options?.getString("reason"))
            motivo_remocao = `\`\`\`${client.tls.phrase(user, "mode.warn.motivo_remocao", client.defaultEmoji("judge"))}:\n\n${interaction.options?.getString("reason")}\`\`\``

        // Exibindo os detalhes da advertência escolhida
        const embed = new EmbedBuilder()
            .setTitle(client.tls.phrase(user, "mode.anotacoes.verificando"))
            .setColor(client.embed_color(user.misc.color))
            .setDescription(client.tls.phrase(user, "mode.warn.descricao_advertencia", null, [user_note.relatory, motivo_remocao]))
            .addFields(
                {
                    name: `${client.defaultEmoji("person")} **${client.tls.phrase(user, "util.server.membro")}**`,
                    value: `${client.emoji("icon_id")} \`${id_alvo}\`\n\`${user_note.nick || client.tls.phrase(user, "mode.warn.sem_nome")}\`\n( <@${id_alvo}> )`,
                    inline: true
                },
                {
                    name: `${client.defaultEmoji("guard")} **${client.tls.phrase(user, "mode.warn.moderador")}**`,
                    value: `${client.emoji("icon_id")} \`${user_note.assigner}\`\n\`${user_note.assigner_nick || client.tls.phrase(user, "mode.warn.sem_nome")}\`\n( <@${user_note.assigner}> )`,
                    inline: true
                },
                {
                    name: `${client.defaultEmoji("time")} **${client.tls.phrase(user, "mode.warn.aplicado")} <t:${user_note.timestamp}:R>**`,
                    value: `<t:${user_note.timestamp}:f>`,
                    inline: true
                }
            )
            .setFooter({
                text: client.tls.phrase(user, "mode.anotacoes.gerenciar_rodape"),
                iconURL: interaction.user.avatarURL({ dynamic: true })
            })

        const botoes = [
            { id: "pre_warn_user_verify", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `11|${id_alvo}.${timestamp}` },
            { id: "pre_warn_user_verify", name: client.tls.phrase(user, "menu.botoes.remover_anotacao"), type: 1, emoji: client.emoji(13), data: `3.${id_alvo}.${timestamp}` }
        ]

        return interaction.update({
            embeds: [embed],
            components: [client.create_buttons(botoes, interaction)],
            ephemeral: true
        })
    }

    if (escolha === 10) pagina_guia++
    if (escolha === 11) pagina_guia = 0

    dados = { id: id_alvo }
    await require('../../chunks/panel_guild_browse_pre_warns')({client, user, interaction, dados, pagina_guia})
}