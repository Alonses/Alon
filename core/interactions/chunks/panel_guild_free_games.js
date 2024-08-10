const { EmbedBuilder, PermissionsBitField } = require("discord.js")

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, { misc: true })
    const guild = await client.getGuild(interaction.guild.id)
    let botoes = []

    // Permissões do bot no servidor
    const membro_sv = await client.getMemberGuild(interaction, client.id())
    let b_cargos = false

    const embed = new EmbedBuilder()
        .setTitle(`> ${client.tls.phrase(user, "manu.painel.anuncio_games")} :video_game:`)
        .setColor(client.embed_color(user.misc.color))
        .setDescription(client.tls.phrase(user, "mode.anuncio.descricao"))
        .setFields(
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", guild?.games_enabled)} **${client.tls.phrase(user, "mode.report.status")}**`,
                value: "⠀",
                inline: true
            },
            {
                name: `:label: **${client.tls.phrase(user, "mode.anuncio.cargo")}**`,
                value: `${client.emoji("icon_id")} \`${guild.games_role}\`\n( <@&${guild.games_role}> )`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("channel")} **${client.tls.phrase(user, "mode.report.canal_de_avisos")}**`,
                value: `${client.emoji("icon_id")} \`${guild.games_channel}\`\n( <#${guild.games_channel}> )`,
                inline: true
            },
            {
                name: `${client.emoji(7)} **${client.tls.phrase(user, "mode.network.permissoes_no_servidor")}**`,
                value: `${client.execute("functions", "emoji_button.emoji_button", membro_sv.permissions.has(PermissionsBitField.Flags.ManageRoles))} **${client.tls.phrase(user, "mode.network.gerenciar_cargos")}**`,
                inline: false
            }
        )
        .setFooter({
            text: client.tls.phrase(user, "manu.painel.rodape"),
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    // Desabilitando o botão de escolher cargos
    if (!membro_sv.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        b_cargos = true

        embed.setFooter({
            text: client.tls.phrase(user, "mode.network.falta_permissao"),
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })
    }

    botoes = botoes.concat([
        { id: "guild_free_games_button", name: client.tls.phrase(user, "manu.painel.anuncio_games"), type: client.execute("functions", "emoji_button.type_button", guild?.conf_games), emoji: client.execute("functions", "emoji_button.emoji_button", guild?.conf_games), data: "1" },
        { id: "guild_free_games_button", name: client.tls.phrase(user, "mode.anuncio.cargo"), type: 1, emoji: client.defaultEmoji("role"), data: "3", disabled: b_cargos },
        { id: "guild_free_games_button", name: client.tls.phrase(user, "mode.report.canal_de_avisos"), type: 1, emoji: client.defaultEmoji("channel"), data: "4" }
    ])

    if (guild.games_channel && guild.games_role) // Mostrado apenas quando um canal e um cargo está definido para o anúncio de games no servidor
        botoes = botoes.concat([{ id: "guild_free_games_button", name: client.tls.phrase(user, "menu.botoes.anunciar_agora"), type: 1, emoji: client.emoji(6), data: "2" }])

    client.reply(interaction, {
        content: "",
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction), client.create_buttons([{ id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "panel_guild.1" }], interaction)],
        ephemeral: true
    })
}