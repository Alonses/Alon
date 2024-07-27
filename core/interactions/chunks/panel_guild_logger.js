const { EmbedBuilder, PermissionsBitField } = require("discord.js")

const { languagesMap } = require("../../formatters/patterns/user")
const {updateGuild} = require("../../database/schemas/Guild");

module.exports = async ({ client, user, interaction, pagina_guia }) => {

    const guild = await client.getGuild(interaction.guild.id), pagina = pagina_guia || 0
    const idioma = guild.lang !== "al-br" ? `:flag_${guild.lang.slice(3, 5)}:` : ":pirate_flag:"

    let botoes = [], descr_rodape

    // Permissões do bot no servidor
    const membro_sv = await client.getMemberGuild(interaction, client.id())

    // Desabilitando o log de eventos caso o bot não possa ver o registro de auditoria do servidor
    if (!membro_sv.permissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
        await updateGuild(client, guild.id, { conf_logger: false })

        descr_rodape = client.tls.phrase(user, "mode.logger.falta_registro_auditoria", 7)
    }

    const eventos = {
        total: 0,
        ativos: 0
    }

    if (pagina !== 2)
        Object.keys(guild).forEach(evento => {
            if (evento !== "logger_channel") {
                if (guild[evento])
                    eventos.ativos++ // Apenas eventos ativos

                eventos.total++
            }
        })

    const embed = new EmbedBuilder()
        .setTitle(`> ${client.tls.phrase(user, "manu.painel.log_eventos")} :scroll:`)
        .setColor(client.embed_color(user.misc.color))
        .setDescription(client.tls.phrase(user, "mode.logger.descricao"))
        .setFields(
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", guild?.conf_logger)} **${client.tls.phrase(user, "mode.report.status")}**`,
                value: `${client.execute("functions", "emoji_button.emoji_button", guild?.death_note)} **Death note**\n${idioma} **${client.tls.phrase(user, "mode.anuncio.idioma")}**`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("telephone")} **${client.tls.phrase(user, "mode.logger.eventos_ouvidos")}**`,
                value: `\`${eventos.ativos} / ${eventos.total}\``,
                inline: true
            },
            {
                name: `${client.defaultEmoji("channel")} **${client.tls.phrase(user, "mode.report.canal_de_avisos")}**`,
                value: `${client.emoji("icon_id")} \`${guild.logger_channel}\`\n( <#${guild.logger_channel}> )`,
                inline: true
            },
            {
                name: `${client.emoji(7)} **${client.tls.phrase(user, "mode.network.permissoes_no_servidor")}**`,
                value: `${client.execute("functions", "emoji_button.emoji_button", membro_sv.permissions.has(PermissionsBitField.Flags.ViewAuditLog))} **${client.tls.phrase(user, "mode.network.registro_auditoria")}**`,
                inline: false
            }
        )
        .setFooter({
            text: descr_rodape || client.tls.phrase(user, "manu.painel.rodape"),
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    if (pagina === 2) {

        const eventos_note = {
            total: 0,
            ativos: 0
        }

        Object.keys(guild).forEach(evento => {
            if (evento.startsWith("death_note_member_")) {
                if (guild[evento])
                    eventos_note.ativos++ // Apenas eventos ativos

                eventos_note.total++
            }
        })

        embed.setTitle(client.tls.phrase(user, "mode.death_note.titulo"))
            .setDescription(client.tls.phrase(user, "mode.death_note.descricao"))
            .setFields(
                {
                    name: `${client.execute("functions", "emoji_button.emoji_button", guild?.death_note)} **Death note**`,
                    value: `${client.emoji(20)} ${client.execute("functions", "emoji_button.emoji_button", guild?.death_note_notify)} **${client.tls.phrase(user, "menu.botoes.notificacoes")}**`,
                    inline: true
                },
                {
                    name: `${client.defaultEmoji("telephone")} **${client.tls.phrase(user, "mode.logger.eventos_ouvidos")}**`,
                    value: `\`${eventos_note.ativos} / ${eventos_note.total}\``,
                    inline: true
                },
                {
                    name: `${client.defaultEmoji("channel")} **${client.tls.phrase(user, "mode.report.canal_de_avisos")}**`,
                    value: guild.death_note.channel ? `${client.emoji("icon_id")} \`${guild.death_note_channel}\`\n( <#${guild.death_note_channel}> )` : `\`❌ ${client.tls.phrase(user, "mode.network.sem_canal")}\``,
                    inline: true
                }
            )
    }

    if (pagina === 0)
        botoes = botoes.concat([
            { id: "guild_logger_button", name: client.tls.phrase(user, "manu.painel.log_eventos"), type: client.execute("functions", "emoji_button.type_button", guild?.conf_logger), emoji: client.execute("functions", "emoji_button.emoji_button", guild?.conf_logger), data: "1", disabled: !membro_sv.permissions.has(PermissionsBitField.Flags.ViewAuditLog) },
            { id: "guild_logger_button", name: client.tls.phrase(user, "mode.logger.eventos_ouvidos"), type: 1, emoji: client.defaultEmoji("telephone"), data: "2" },
            { id: "guild_logger_button", name: "Death note", type: 1, emoji: client.emoji(41), data: "10" },
            { id: "guild_logger_button", name: client.tls.phrase(user, "menu.botoes.ajustes"), type: 1, emoji: client.emoji(41), data: "9" }
        ])
    else if (pagina === 1)
        botoes = botoes.concat([
            { id: "guild_logger_button", name: client.tls.phrase(user, "mode.report.canal_de_avisos"), type: 1, emoji: client.defaultEmoji("channel"), data: "3" },
            { id: "guild_logger_button", name: client.tls.phrase(user, "mode.anuncio.idioma"), type: 1, emoji: languagesMap[guild.lang.slice(0, 2)][3], data: "4" }
        ])
    else
        botoes = botoes.concat([
            { id: "guild_logger_button", name: "Death note", type: client.execute("functions", "emoji_button.type_button", guild?.death_note), emoji: client.execute("functions", "emoji_button.emoji_button", guild?.death_note), data: "5" },
            { id: "guild_logger_button", name: client.tls.phrase(user, "menu.botoes.notificacoes"), type: client.execute("functions", "emoji_button.type_button", guild?.death_note_notify), emoji: client.emoji(20), data: "7" },
            { id: "guild_logger_button", name: client.tls.phrase(user, "mode.logger.eventos_ouvidos"), type: 1, emoji: client.defaultEmoji("warn"), data: "6" },
            { id: "guild_logger_button", name: client.tls.phrase(user, "mode.report.canal_de_avisos"), type: 1, emoji: client.defaultEmoji("channel"), data: "8" },
        ])

    client.reply(interaction, {
        content: "",
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction), client.create_buttons([{ id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: pagina < 1 ? "panel_guild.0" : "panel_guild_logger.0" }], interaction)],
        ephemeral: true
    })
}