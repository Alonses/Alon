const { EmbedBuilder, PermissionsBitField } = require("discord.js")

const { getNetworkedGuilds, updateGuild} = require("../../database/schemas/Guild")

const { banMessageEraser } = require("../../formatters/patterns/timeout")

module.exports = async ({ client, user, interaction, pagina_guia }) => {

    await client.deferedResponse({ interaction })

    const pagina = pagina_guia || 0
    const emoji_pessoa = client.defaultEmoji("person")
    const guild = await client.getGuild(interaction.guild.id)
    let botoes = [], retorno_aviso = "", ant_network = guild.conf_network

    // Permissões do bot no servidor
    const servidores_link = guild.network_link ? (await getNetworkedGuilds(client, guild.network_link)).length : 0
    const membro_sv = await client.getMemberGuild(interaction, client.id())

    let update = {}

    // Verificando as permissões necessárias conforme os casos
    if (!membro_sv.permissions.has(PermissionsBitField.Flags.ViewAuditLog))
        update.conf_network = false

    if (guild.network_member_ban_add) // Banimentos automaticos
        if (!membro_sv.permissions.has(PermissionsBitField.Flags.BanMembers))
            update.conf_network = false

    if (guild.network_member_kick) // Expulsões automaticas
        if (!membro_sv.permissions.has(PermissionsBitField.Flags.KickMembers))
            update.conf_network = false

    if (guild.network_member_punishment) // Castigos automaticos
        if (!membro_sv.permissions.has(PermissionsBitField.Flags.ModerateMembers))
            update.conf_network = false

    if (servidores_link === 1) {
        update.conf_network = false
        retorno_aviso = client.tls.phrase(user, "mode.network.falta_servidores", 36)
    }

    // Salva os dados atualizados
    if (update !== {}) await updateGuild(client, guild.id, update)

    const eventos = {
        total: 0,
        ativos: 0
    }

    Object.keys(guild).forEach(evento => {
        if (evento.startsWith("network") && evento !== "link" && evento !== "channel") {
            if (guild[evento])
                eventos.ativos++ // Apenas eventos ativos

            eventos.total++
        }
    })

    const embed = new EmbedBuilder()
        .setTitle(`> Networking ${client.emoji(36)}`)
        .setColor(client.embed_color(user.misc.color))
        .setDescription(client.tls.phrase(user, "mode.network.descricao"))
        .setFields(
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", guild?.conf_network)} **${client.tls.phrase(user, "mode.report.status")}**`,
                value: `${client.emoji(32)} **${client.tls.phrase(user, "mode.network.servidores_link")}: ${servidores_link}**`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("telephone")} **${client.tls.phrase(user, "mode.network.eventos_sincronizados")}**`,
                value: `\`${eventos.ativos} / ${eventos.total}\``,
                inline: true
            },
            {
                name: `${client.defaultEmoji("channel")} **${client.tls.phrase(user, "mode.report.canal_de_avisos")}**`,
                value: `${guild.network_channel ? `${client.emoji("icon_id")} \`${guild.network_channel}\`\n( <#${guild.network_channel}> )` : `\`❌ ${client.tls.phrase(user, "mode.network.sem_canal")}\``}${guild.logger_channel ? `\n${client.emoji(49)} ( <#${guild.logger_channel}> )` : ""}`,
                inline: true
            },
            {
                name: `:wastebasket: **${client.tls.phrase(user, "mode.network.excluir_banidos")}**`,
                value: `\`${client.tls.phrase(user, `menu.network.${banMessageEraser[guild.network_erase_ban_messages]}`)}\` ( :twisted_rightwards_arrows: :globe_with_meridians: )`,
                inline: false
            },
            {
                name: `${client.defaultEmoji("guard")} **${client.tls.phrase(user, "mode.network.filtro_acoes")}**`,
                value: `\`${guild.network_scanner_type ? `${emoji_pessoa} ${client.tls.phrase(user, "mode.network.filtro_apenas_humanos")}` : `${client.emoji(5)} ${client.tls.phrase(user, "mode.network.filtro_todas_fontes")}`}\` ( :twisted_rightwards_arrows: :globe_with_meridians: )`,
                inline: false
            }
        )

    if (pagina === 2) // Página com a lista de servidores do network
        embed.setFields(
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", guild?.conf_network)} **${client.tls.phrase(user, "mode.report.status")}**`,
                value: `${client.emoji(32)} **${client.tls.phrase(user, "mode.network.servidores_link")}: ${servidores_link}**`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("telephone")} **${client.tls.phrase(user, "mode.network.eventos_sincronizados")}**`,
                value: `\`${eventos.ativos} / ${eventos.total}\``,
                inline: true
            },
            {
                name: `${client.defaultEmoji("channel")} **${client.tls.phrase(user, "mode.report.canal_de_avisos")}**`,
                value: `${guild.network_channel ? `${client.emoji("icon_id")} \`${guild.network_channel}\`\n( <#${guild.network_channel}> )` : `\`❌ ${client.tls.phrase(user, "mode.network.sem_canal")}\``}${guild.logger_channel ? `\n${client.emoji(49)} ( <#${guild.logger_channel}> )` : ""}`,
                inline: true
            },
            {
                name: `:link: **${client.tls.phrase(user, "manu.guild_data.outros_servidores")}:**`,
                value: guild.network_link ? await client.getNetWorkGuildNames(user, guild.network_link, interaction) : client.tls.phrase(user, "manu.guild_data.sem_servidores"),
                inline: false
            }
        )
    else {
        embed.addFields(
            {
                name: `${client.emoji(7)} **${client.tls.phrase(user, "mode.network.permissoes_no_servidor")}**`,
                value: `${client.execute("functions", "emoji_button.emoji_button", membro_sv.permissions.has(PermissionsBitField.Flags.ViewAuditLog))} **${client.tls.phrase(user, "mode.network.registro_auditoria")}**\n${client.execute("functions", "emoji_button.emoji_button", membro_sv.permissions.has(PermissionsBitField.Flags.ModerateMembers))} **${client.tls.phrase(user, "mode.network.castigar_membros")}**`,
                inline: true
            },
            {
                name: "⠀",
                value: `${client.execute("functions", "emoji_button.emoji_button", membro_sv.permissions.has(PermissionsBitField.Flags.BanMembers))} **${client.tls.phrase(user, "mode.network.banir_membros")}**\n${client.execute("functions", "emoji_button.emoji_button", membro_sv.permissions.has(PermissionsBitField.Flags.KickMembers))} **${client.tls.phrase(user, "mode.network.expulsar_membros")}**`,
                inline: true
            }
        )
    }

    embed.setFooter({
        text: client.tls.phrase(user, "manu.painel.rodape"),
        iconURL: interaction.user.avatarURL({ dynamic: true })
    })

    if (pagina === 0)
        botoes = botoes.concat([
            { id: "guild_network_button", name: "Network", type: client.execute("functions", "emoji_button.type_button", guild?.conf_network), emoji: client.execute("functions", "emoji_button.emoji_button", guild?.conf_network), data: "1" },
            { id: "guild_network_button", name: client.tls.phrase(user, "mode.network.eventos_sincronizados"), type: 1, emoji: client.defaultEmoji("telephone"), data: "2" },
            { id: "guild_network_button", name: client.tls.phrase(user, "mode.network.servidores"), type: 1, emoji: client.emoji(32), data: "3" },
            { id: "guild_network_button", name: client.tls.phrase(user, "menu.botoes.ajustes"), type: 1, emoji: client.emoji(41), data: "9" }
        ])
    else if (pagina === 1) {
        botoes = botoes.concat([
            { id: "guild_network_button", name: client.tls.phrase(user, "mode.report.canal_de_avisos"), type: 1, emoji: client.defaultEmoji("channel"), data: "5" },
            { id: "guild_network_button", name: client.tls.phrase(user, "menu.botoes.exclusao"), type: 1, emoji: client.emoji(13), data: "6" }
        ])

        if (servidores_link > 1) // Network com mais de um servidor
            botoes = botoes.concat([{ id: "guild_network_button", name: client.tls.phrase(user, "mode.network.quebrar_vinculo"), type: 1, emoji: client.emoji(44), data: "4" }])
    }

    // Botões de retorno e estilo de sincronização permitida
    let row = [{ id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: pagina < 1 ? "panel_guild.1" : "panel_guild_network.0" }]

    if (pagina !== 2)
        row = row.concat([
            { id: "guild_network_button", name: client.tls.phrase(user, "menu.botoes.ver_network"), type: 1, emoji: client.emoji(36), data: "12", disabled: servidores_link > 1 ? false : true },
            { id: "guild_network_button", name: client.tls.phrase(user, "menu.botoes.filtro_acoes"), type: 1, emoji: guild.network_scanner_type ? emoji_pessoa : client.emoji("icon_integration"), data: "10" }
        ])

    const componentes = []

    if (botoes.length > 0)
        componentes.push(client.create_buttons(botoes, interaction))

    if (row.length > 0)
        componentes.push(client.create_buttons(row, interaction))

    interaction.editReply({
        content: retorno_aviso,
        embeds: [embed],
        components: componentes,
        ephemeral: true
    })
}