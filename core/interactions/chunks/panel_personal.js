const { EmbedBuilder } = require('discord.js')

module.exports = async ({ client, interaction, operador, pagina_guia }) => {
    const user = await client.getUser(interaction.user.id, {
        conf: true,
        misc: true
    })
    const pagina = pagina_guia || 0

    if (operador) { // Função usada com um atalho

        if (operador === "data") // Atalho para a guia de configurações de exclusão de dados
            return require('./panel_personal_data')({ client, interaction })

        const dados = `${interaction.user.id}.${operador}`
        return require('../functions/buttons/user_panel_button')({ client, interaction, dados })
    }

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "manu.painel.cabecalho_menu_pessoal"))
        .setColor(client.embed_color(user.misc.color))
        .setDescription(client.tls.phrase(user, "manu.painel.descricao"))
        .setFooter({
            text: client.tls.phrase(user, "manu.painel.rodape"),
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    if (pagina === 0)
        embed.addFields(
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", user?.conf.ghost_mode)} **${client.tls.phrase(user, "manu.data.ghostmode")}**`,
                value: `\`\`\`${client.tls.phrase(user, "manu.painel.desc_ghostmode")}\`\`\``,
                inline: true
            },
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", user?.conf.notify)} **${client.tls.phrase(user, "manu.data.notificacoes")}**`,
                value: `\`\`\`${client.tls.phrase(user, "manu.painel.desc_notificacoes")}\`\`\``,
                inline: true
            },
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", user?.conf.ranking)} **${client.tls.phrase(user, "manu.data.ranking")}**`,
                value: `\`\`\`${client.tls.phrase(user, "manu.painel.desc_ranking")}\`\`\``,
                inline: true
            }
        )

    if (pagina === 1)
        embed.addFields(
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", user?.conf.public_badges)} **${client.tls.phrase(user, "manu.data.badges_publicas")}**`,
                value: `\`\`\`${client.tls.phrase(user, "manu.painel.desc_badges_publicas")}\`\`\``,
                inline: true
            },
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", !user?.misc.weather)} **${client.tls.phrase(user, "manu.data.clima_resumido")}**`,
                value: `\`\`\`${client.tls.phrase(user, "manu.painel.desc_clima_resumido")}\`\`\``,
                inline: true
            },
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", user?.conf.global_tasks)} **${client.tls.phrase(user, "manu.data.tarefas_globais")}**`,
                value: `\`\`\`${client.tls.phrase(user, "manu.painel.desc_tarefas_globais")}\`\`\``,
                inline: true
            }
        )

    if (pagina === 2)
        embed.addFields(
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", user?.conf.resumed)} **${client.tls.phrase(user, "manu.painel.modo_compacto")}**`,
                value: `\`\`\`${client.tls.phrase(user, "manu.painel.desc_modo_compacto")}\`\`\``,
                inline: true
            },
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", user?.conf.cached_guilds)} **${client.tls.phrase(user, "manu.painel.servidores_conhecidos")}**`,
                value: `\`\`\`${client.tls.phrase(user, "manu.painel.desc_servidores_conhecidos")}\`\`\``,
                inline: true
            },
            {
                name: `${client.execute("functions", "emoji_button.emoji_button", 0)} **${client.tls.phrase(user, "manu.painel.misterioso")}**`,
                value: `\`\`\`${client.tls.phrase(user, "manu.painel.desc_misterioso")}\`\`\``,
                inline: true
            }
        )

    const c_menu = [false, false]
    // Botão de voltar
    if (pagina === 0) c_menu[0] = true

    // Botão para avançar
    if (pagina === 2) c_menu[1] = true

    let botoes = [{ id: "navigation_button_panel", name: '◀️', type: 0, data: `${pagina}.0.panel_personal`, disabled: c_menu[0] }]

    if (pagina === 0)
        botoes = [{ id: "data_user_button", name: client.defaultEmoji("paper"), type: 2, data: "0" }]

    // Primeira página de botões de configuração do usuário
    // Modo fantasma, notificações em DM e Ranking
    if (pagina === 0)
        botoes = botoes.concat([
            { id: "user_panel_button", name: client.tls.phrase(user, "manu.data.ghostmode"), type: client.execute("functions", "emoji_button.type_button", user?.conf.ghost_mode), emoji: client.execute("functions", "emoji_button.emoji_button", user?.conf.ghost_mode), data: '0' },
            { id: "user_panel_button", name: client.tls.phrase(user, "manu.data.notificacoes"), type: client.execute("functions", "emoji_button.type_button", user?.conf.notify), emoji: client.execute("functions", "emoji_button.emoji_button", user?.conf.notify), data: '1' },
            { id: "user_panel_button", name: client.tls.phrase(user, "manu.data.ranking"), type: client.execute("functions", "emoji_button.type_button", user?.conf.ranking), emoji: client.execute("functions", "emoji_button.emoji_button", user?.conf.ranking), data: '2' }
        ])

    // Segunda página de botões de configuração do Alonsal
    // Badges visiveis públicamente, clima resumido e tarefas globais
    if (pagina === 1)
        botoes = botoes.concat([
            { id: "user_panel_button", name: client.tls.phrase(user, "manu.data.badges_publicas"), type: client.execute("functions", "emoji_button.type_button", user?.conf.public_badges), emoji: client.execute("functions", "emoji_button.emoji_button", user?.conf.public_badges), data: '3' },
            { id: "user_panel_button", name: client.tls.phrase(user, "manu.data.clima_resumido"), type: client.execute("functions", "emoji_button.type_button", !user?.misc.weather), emoji: client.execute("functions", "emoji_button.emoji_button", !user?.misc.weather), data: '4' },
            { id: "user_panel_button", name: client.tls.phrase(user, "manu.data.tarefas_globais"), type: client.execute("functions", "emoji_button.type_button", user?.conf.global_tasks), emoji: client.execute("functions", "emoji_button.emoji_button", user?.conf.global_tasks), data: '5' }
        ])

    if (pagina === 2)
        botoes = botoes.concat([
            { id: "user_panel_button", name: client.tls.phrase(user, "manu.painel.modo_compacto"), type: client.execute("functions", "emoji_button.type_button", user?.conf.resumed), emoji: client.execute("functions", "emoji_button.emoji_button", user?.conf.resumed), data: '6' },
            { id: "user_panel_button", name: client.tls.phrase(user, "manu.painel.servidores_conhecidos"), type: client.execute("functions", "emoji_button.type_button", user?.conf.cached_guilds), emoji: client.execute("functions", "emoji_button.emoji_button", user?.conf.cached_guilds), data: '7' },
            { id: "user_panel_button", name: client.tls.phrase(user, "manu.painel.misterioso"), type: client.execute("functions", "emoji_button.type_button", 0), emoji: client.execute("functions", "emoji_button.emoji_button", 3), data: '8', disabled: true }
        ])

    botoes.push({ id: "navigation_button_panel", name: '▶️', type: 0, data: `${pagina}.1.panel_personal`, disabled: c_menu[1] })

    client.reply(interaction, {
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction)],
        ephemeral: true
    })
}