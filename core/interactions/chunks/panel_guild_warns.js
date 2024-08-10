const { EmbedBuilder, PermissionsBitField } = require("discord.js")

const { listAllGuildWarns } = require("../../database/schemas/Guild_warns")

const { banMessageEraser, spamTimeoutMap } = require('../../formatters/patterns/timeout')

module.exports = async ({ client, interaction, pagina_guia }) => {
    const user = await client.getUser(interaction.user.id, { misc: true })
    const pagina = pagina_guia || 0
    const guild = await client.getGuild(interaction.guild.id, { warn: true })

    let botoes = [], texto_rodape = client.tls.phrase(user, "manu.painel.rodape")

    // Permissões do bot no servidor
    const membro_sv = await client.getMemberGuild(interaction, client.id())
    const advertencias = await listAllGuildWarns(client, interaction.guild.id)// , status = guild.warn.enabled
    const indice_matriz = client.verifyMatrixIndex(advertencias)

    // if (guild.warn.enabled !== status) await guild.save()

    const embed = new EmbedBuilder()
        .setTitle(`> ${client.tls.phrase(user, "mode.warn.advertencias")} :octagonal_sign:`)
        .setColor(client.embed_color(user.misc.color))
        .setDescription(client.tls.phrase(user, "mode.warn.descricao_advertencias"))
        .setFields(
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", guild.warn.enabled)} **${client.tls.phrase(user, "mode.report.status")}**`,
                value: `${client.execute("functions", "emoji_button.emoji_button", guild.warn.timed)} **${client.tls.phrase(user, "mode.warn.com_validade")}**\n${client.execute("functions", "emoji_button.emoji_button", guild.warn.announce_status)} **${client.tls.phrase(user, "mode.warn.anuncio_publico")}**\n${client.emoji(47)} **${client.tls.phrase(user, "mode.warn.advertencias")}: \`${advertencias.length} / 5\`**${indice_matriz ? `\n${client.emoji(54)} **${client.tls.phrase(user, "mode.warn.expulsao_na")} \`${indice_matriz}°\`**` : ""}`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("channel")} **${client.tls.phrase(user, "mode.report.canal_de_avisos")}**`,
                value: `${client.emoji(20)} ${client.execute("functions", "emoji_button.emoji_button", guild.warn.notify)} **${client.tls.phrase(user, "mode.spam.mencoes")}**\n${guild.warn.channel ? `${client.emoji("icon_id")} \`${guild.warn.channel}\`\n( <#${guild.warn.channel}> )` : `\`❌ ${client.tls.phrase(user, "mode.network.sem_canal")}\``}`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("time")} **${client.tls.phrase(user, "mode.warn.validade")}**`,
                value: `:wastebasket: **${client.tls.phrase(user, "mode.warn.expira_em")} \`${client.tls.phrase(user, `menu.times.${spamTimeoutMap[guild.warn.reset]}`)}\`**${guild.warn.timed ? "" : `\n( **⛔ ${client.tls.phrase(user, "mode.warn.no_momento")}** )`}`,
                inline: true
            },
            {
                name: `:wastebasket: **${client.tls.phrase(user, "mode.warn.excluir_banidos")}**`,
                value: `\`${client.tls.phrase(user, `menu.network.${banMessageEraser[guild.warn.erase_ban_messages]}`)}\``,
                inline: false
            },
            {
                name: `${client.defaultEmoji("channel")} **${client.tls.phrase(user, "mode.timed_roles.canal_avisos_temporario")}**`,
                value: guild.warn.timed_channel ? client.tls.phrase(user, "mode.timed_roles.enviando", null, guild.warn.timed_channel) : `\`❌ ${client.tls.phrase(user, "mode.timed_roles.sem_canal_temporario")}\``,
                inline: false
            },
            {
                name: `${client.emoji(7)} **${client.tls.phrase(user, "mode.network.permissoes_no_servidor")}**`,
                value: `${client.execute("functions", "emoji_button.emoji_button", membro_sv.permissions.has(PermissionsBitField.Flags.ModerateMembers))} **${client.tls.phrase(user, "mode.network.castigar_membros")}**\n${client.execute("functions", "emoji_button.emoji_button", membro_sv.permissions.has(PermissionsBitField.Flags.ManageRoles))} **${client.tls.phrase(user, "mode.network.gerenciar_cargos")}**`,
                inline: true
            },
            {
                name: "⠀",
                value: `${client.execute("functions", "emoji_button.emoji_button", membro_sv.permissions.has(PermissionsBitField.Flags.BanMembers))} **${client.tls.phrase(user, "mode.network.banir_membros")}**\n${client.execute("functions", "emoji_button.emoji_button", membro_sv.permissions.has(PermissionsBitField.Flags.KickMembers))} **${client.tls.phrase(user, "mode.network.expulsar_membros")}**`,
                inline: true
            }
        )
        .setFooter({
            text: texto_rodape,
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    if (pagina === 1) { // Página de configurações com notificações de advertências

        let descricao = client.tls.phrase(user, "mode.warn.descricao_notificacao_advertencia")

        if (guild.warn.announce_status) // Sobrescreve a descrição na guia para as advertências públicas
            descricao = client.tls.phrase(user, "mode.warn.descricao_adv_publica")

        embed.setDescription(descricao)
            .setFields(
                {
                    name: `${client.defaultEmoji("channel")} **${client.tls.phrase(user, "mode.report.canal_de_avisos")}**`,
                    value: `${client.emoji(20)} ${client.execute("functions", "emoji_button.emoji_button", guild.warn.notify)} **${client.tls.phrase(user, "mode.spam.mencoes")}**\n${guild.warn.channel ? `${client.emoji("icon_id")} \`${guild.warn.channel}\`\n( <#${guild.warn.channel}> )` : `\`❌ ${client.tls.phrase(user, "mode.network.sem_canal")}\``}`,
                    inline: true
                },
                {
                    name: "⠀",
                    value: `${client.emoji(20)} ${client.execute("functions", "emoji_button.emoji_button", guild.warn.notify_exclusion)} **${client.tls.phrase(user, "menu.botoes.notificar_remocao")}**`,
                    inline: true
                },
                { name: "⠀", value: "⠀", inline: false },
                {
                    name: `📢 **${client.tls.phrase(user, "mode.warn.advertencias_publicas")}**\n${client.execute("functions", "emoji_button.emoji_button", guild.warn.announce_status)} **${client.tls.phrase(user, "mode.warn.anunciar_publicamente")}**`,
                    value: "⠀",
                    inline: true
                },
                {
                    name: `${client.defaultEmoji("channel")} **${client.tls.phrase(user, "mode.warn.canal_publico")}**`,
                    value: `${guild.warn.announce_channel ? `${client.emoji("icon_id")} \`${guild.warn.announce_channel}\`\n( <#${guild.warn.announce_channel}> )` : `\`❌ ${client.tls.phrase(user, "mode.network.sem_canal")}\``}`,
                    inline: true
                }
            )
            .setFooter({
                text: client.tls.phrase(user, "mode.warn.editar_advertencia"),
                iconURL: interaction.user.avatarURL({ dynamic: true })
            })
    }

    if (pagina === 0) // Página inicial da guia de advertências
        botoes = botoes.concat([
            { id: "guild_warns_button", name: client.tls.phrase(user, "mode.warn.advertencias"), type: client.execute("functions", "emoji_button.type_button", guild.warn.enabled), emoji: client.execute("functions", "emoji_button.emoji_button", guild.warn.enabled), data: "1" },
            { id: "guild_warns_button", name: client.tls.phrase(user, "mode.warn.com_validade"), type: client.execute("functions", "emoji_button.type_button", guild.warn.timed), emoji: client.execute("functions", "emoji_button.emoji_button", guild.warn.timed), data: "6" },
            { id: "guild_warns_button", name: client.tls.phrase(user, "menu.botoes.notificacoes"), type: 1, emoji: client.emoji(41), data: "15" },
            { id: "guild_warns_button", name: client.tls.phrase(user, "menu.botoes.ajustes"), type: 1, emoji: client.emoji(41), data: "9" }
        ])
    else if (pagina === 1) // Página de notificações de advertências
        botoes = botoes.concat([
            { id: "guild_warns_button", name: client.tls.phrase(user, "mode.spam.mencoes"), type: client.execute("functions", "emoji_button.type_button", guild.warn.notify), emoji: client.execute("functions", "emoji_button.emoji_button", guild.warn.notify), data: "8", disabled: guild.warn.announce_status },
            { id: "guild_warns_button", name: client.tls.phrase(user, "menu.botoes.notificar_remocao"), type: client.execute("functions", "emoji_button.type_button", guild.warn.notify_exclusion), emoji: client.execute("functions", "emoji_button.emoji_button", guild.warn.notify_exclusion), data: "10" },
            { id: "guild_warns_button", name: client.tls.phrase(user, "mode.warn.anunciar_publicamente"), type: client.execute("functions", "emoji_button.type_button", guild.warn.announce_status), emoji: client.execute("functions", "emoji_button.emoji_button", guild.warn.announce_status), data: "11", disabled: !guild.warn.announce_channel },
            { id: "guild_warns_button", name: client.tls.phrase(user, "mode.warn.canal_publico"), type: 1, emoji: client.defaultEmoji("channel"), data: "12" },
        ])
    else // Página de configurações das advertências
        botoes = botoes.concat([
            { id: "guild_warns_button", name: client.tls.phrase(user, "mode.report.canal_de_avisos"), type: 1, emoji: client.defaultEmoji("channel"), data: "5" },
            { id: "guild_warns_button", name: client.tls.phrase(user, "menu.botoes.canal_temporario"), type: 1, emoji: client.defaultEmoji("channel"), data: "17" },
            { id: "guild_warns_button", name: client.tls.phrase(user, "menu.botoes.expiracao"), type: 1, emoji: client.defaultEmoji("time"), data: "16" },
            { id: "guild_warns_button", name: client.tls.phrase(user, "menu.botoes.exclusao"), type: 1, emoji: client.emoji(13), data: "7" }
        ])

    const row = [
        { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: pagina < 1 ? "panel_guild.0" : "panel_guild_warns.0" },
        { id: "guild_hierarchy_warns_button", name: client.tls.phrase(user, "mode.hierarquia.hierarquia"), type: 1, emoji: client.emoji(65), data: "30" },
        { id: "guild_warns_button", name: client.tls.phrase(user, "mode.warn.advertencias"), type: 1, emoji: client.defaultEmoji("guard"), data: "3" }
    ]

    client.reply(interaction, {
        content: "",
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction), client.create_buttons(row, interaction)],
        ephemeral: true
    })
}