const { EmbedBuilder, PermissionsBitField } = require('discord.js')

const { operation_codes } = require('../../formatters/patterns/guild')

// Funções sem guias de configuração
const direct_functions = [10]

module.exports = async ({ client, user, interaction, operador, pagina_guia }) => {

    const pagina = pagina_guia || 0

    // Códigos de funções
    // 2 -> Free games

    // 3 -> Tickets de denúncia
    // 4 -> Reportes externos
    // 5 -> Log de Eventos

    // 6 -> Anti-spam
    // 7 -> Visibilidade global
    // 8 -> Network

    // 12 -> Cargos temporários

    const c_buttons = [false, false, false, false, false, false, false, false, false, false, false, false, false, false]
    const c_menu = [false, false]

    if (pagina == 0) // Botão de voltar
        c_menu[0] = true
    if (pagina == 2) // Botão para avançar
        c_menu[1] = true

    let botoes = [{ id: "navigation_button_panel", name: '◀️', type: 0, data: `${pagina}.0.panel_guild`, disabled: c_menu[0] }]

    if (c_menu[0])
        botoes = [{ id: "data_guild_button", name: client.defaultEmoji("paper"), type: 2, data: "0" }]

    // Falta de permissões para gerenciar o sistema de denúncias
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels) && !interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles))
        c_buttons[3] = true

    // Falta de permissões para gerenciar o sistema de reportes o Log de eventos e o módulo anti-spam
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        c_buttons[0] = true
        c_buttons[1] = true
        c_buttons[4] = true
        c_buttons[5] = true
        c_buttons[6] = true
    }

    // Falta de permissões para gerenciar o servidor no ranking global e o anúncios de games
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        c_buttons[2] = true
        c_buttons[7] = true
        c_buttons[10] = true
    }

    // Falta de permissões para banir membros
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers || PermissionsBitField.Flags.KickMembers)) {
        c_buttons[8] = true
        c_buttons[9] = true
    }

    // Falta de permissões para gerenciar advertências hierarquicas
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
        c_buttons[11] = true

    // Falta de permissões para gerenciar os cargos temporários
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers || PermissionsBitField.Flags.ManageRoles))
        c_buttons[12] = true

    /* Atalhos para as funções do painel */

    if (operador) // Verificando se o usuário possui permissão e ativando a função escolhida
        if (c_buttons[operation_codes[operador]])
            return client.tls.reply(interaction, user, "manu.painel.user_sem_permissao", true, 7)
        else {

            // Permissão válida
            if (direct_functions.includes(operation_codes[operador])) { // Funções sem guia de configuração
                const dados = `${interaction.user.id}.${operation_codes[operador]}`
                return require('../functions/buttons/guild_panel_button')({ client, user, interaction, dados })
            } else {

                // Acessando diretamente uma guia de função
                let pagina_guia = 0

                if (operador.includes(".")) { // Função com sub-guias
                    pagina_guia = parseInt(operador.split(".")[1])
                    operador = operador.split(".")[0]
                }

                if (c_buttons[operation_codes[operador]])
                    return client.tls.reply(interaction, user, "manu.painel.user_sem_permissao", true, 7)

                return require(`./panel_guild_${operador}`)({ client, user, interaction, pagina_guia })
            }
        }

    const guild = await client.getGuild(interaction.guild.id)

    const embed = new EmbedBuilder()
        .setTitle(`${client.tls.phrase(user, "manu.painel.cabecalho_menu_servidor")} :globe_with_meridians:`)
        .setColor(client.embed_color(user.misc.color))
        .setDescription(client.tls.phrase(user, "manu.painel.descricao"))
        .setFooter({
            text: client.tls.phrase(user, "manu.painel.rodape"),
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    if (pagina === 0)
        embed.addFields(
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", guild?.conf.logger)} **${client.tls.phrase(user, "manu.painel.log_eventos")}**`,
                value: `\`\`\`${client.tls.phrase(user, "manu.painel.desc_logger")}\`\`\``,
                inline: true
            },
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", guild?.conf.warn)} **${client.tls.phrase(user, "mode.warn.advertencias")}**`,
                value: `\`\`\`${client.tls.phrase(user, "mode.warn.desc_advertencias")}\`\`\``,
                inline: true
            },
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", guild?.conf.spam)} **${client.tls.phrase(user, "manu.painel.anti_spam")}**`,
                value: `\`\`\`${client.tls.phrase(user, "manu.painel.desc_spam")}\`\`\``,
                inline: true
            }
        )

    if (pagina == 1)
        embed.addFields(
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", guild?.conf.network)} **Network**`,
                value: `\`\`\`${client.tls.phrase(user, "manu.painel.desc_network")}\`\`\``,
                inline: true
            },
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", guild?.conf.reports)} **${client.tls.phrase(user, "manu.painel.reports_externos")}**`,
                value: `\`\`\`${client.tls.phrase(user, "manu.painel.desc_reports")}\`\`\``,
                inline: true
            },
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", guild?.conf.games)} **${client.tls.phrase(user, "manu.painel.anuncio_games")}**`,
                value: `\`\`\`${client.tls.phrase(user, "manu.painel.desc_games")}\`\`\``,
                inline: true
            }
        )

    if (pagina == 2)
        embed.addFields(
            {
                name: `${client.defaultEmoji("time")} **${client.tls.phrase(user, "manu.painel.cargos_temporarios")}**`,
                value: `\`\`\`${client.tls.phrase(user, "manu.painel.desc_cargos_temporarios")}\`\`\``,
                inline: true
            },
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", guild?.conf.tickets)} **${client.tls.phrase(user, "manu.painel.denuncias_server")}**`,
                value: `\`\`\`${client.tls.phrase(user, "manu.painel.desc_denuncias")}\`\`\``,
                inline: true
            },
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", guild?.conf.nuke_invites)} **${client.tls.phrase(user, "manu.painel.convites_rastreados")}**`,
                value: `\`\`\`${client.tls.phrase(user, "manu.painel.desc_convites_rastreados")}\`\`\``,
                inline: true
            }
        )

    // Primeira página de botões de configuração do Alonsal
    // Log de eventos, Advertências e Anti-spam
    if (pagina === 0)
        botoes = botoes.concat([
            { id: "guild_logger_button", name: client.tls.phrase(user, "manu.painel.log_eventos"), type: 1, emoji: client.emoji(41), data: '0', disabled: c_buttons[5] },
            { id: "guild_warns_button", name: client.tls.phrase(user, "mode.warn.advertencias"), type: 1, emoji: client.emoji(41), data: '0', disabled: c_buttons[9] },
            { id: "guild_anti_spam_button", name: client.tls.phrase(user, "manu.painel.anti_spam"), type: 1, emoji: client.emoji(41), data: '0', disabled: c_buttons[6] }
        ])

    // Segunda página de botões de configuração do Alonsal
    // Network, Reportes externos e Anúncio de games
    if (pagina === 1)
        botoes = botoes.concat([
            { id: "guild_network_button", name: "Network", type: 1, emoji: client.emoji(41), data: '0', disabled: c_buttons[8] },
            { id: "guild_reports_button", name: client.tls.phrase(user, "manu.painel.reports_externos"), type: 1, emoji: client.emoji(41), data: '0', disabled: c_buttons[4] },
            { id: "guild_free_games_button", name: client.tls.phrase(user, "manu.painel.anuncio_games"), type: 1, emoji: client.emoji(41), data: '0', disabled: c_buttons[2] }
        ])

    // Terceira página de botões de configuração do Alonsal
    // Cargos temporários, Denúncias in-server e Convites rastreados
    if (pagina === 2)
        botoes = botoes.concat([
            { id: "guild_timed_roles_button", name: client.tls.phrase(user, "manu.painel.cargos_temporarios"), type: 1, emoji: client.emoji(41), data: '0', disabled: c_buttons[12] },
            { id: "guild_tickets_button", name: client.tls.phrase(user, "manu.painel.denuncias_server"), type: 1, emoji: client.emoji(41), data: '0', disabled: c_buttons[3] },
            { id: "guild_panel_button", name: client.tls.phrase(user, "manu.painel.convites_rastreados"), type: client.execute("functions", "emoji_button.type_button", guild?.conf.nuke_invites), emoji: client.execute("functions", "emoji_button.emoji_button", guild?.conf.nuke_invites), data: '9', disabled: c_buttons[10] },
        ])

    botoes.push({ id: "navigation_button_panel", name: '▶️', type: 0, data: `${pagina}.1.panel_guild`, disabled: c_menu[1] })

    client.reply(interaction, {
        content: "",
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction)],
        ephemeral: true
    })
}