const { ChannelType } = require('discord.js')

const { banMessageEraser } = require('../../../formatters/patterns/timeout')
const {updateGuild} = require("../../../database/schemas/Guild");

// 1 -> Ativar ou desativar o módulo de reportes externos
// 2 -> Ativar ou desativar o AutoBan
// 3 -> Ativar ou desativar o aviso de novos usuários reportados

const operations = {
    1: { action: "reports.enabled", page: 0 },
    2: { action: "reports.auto_ban", page: 1 },
    3: { action: "reports.notify", page: 2 }
}

module.exports = async ({ client, user, interaction, dados, pagina }) => {

    let operacao = parseInt(dados.split(".")[1]), reback = "panel_guild_external_reports", pagina_guia = 0
    let guild = await client.getGuild(interaction.guild.id, { reports: true })

    // Sem canal de avisos definido, solicitando um canal
    if (!guild.reports.channel) {
        reback = "panel_guild.1"
        operacao = 4
    }

    // Tratamento dos cliques
    // 0 -> Entrar no painel de cliques

    // 4 -> Escolher canal de avisos
    // 5 -> Escolher cargo para ser mencionado

    // 2 -> Ativar ou desativar o AutoBan
    // 6 -> Escolher o tempo de exclusão de mensagens de membros banidos

    // 20 -> Sub-menu dos AutoBan
    // 21 -> Sub-menu com opções extras 

    if (operations[operacao]) ({ guild, pagina_guia } = client.switcher({ guild, operations, operacao }))
    else if (operacao === 4) {

        // Definindo o canal de avisos dos relatórios externos
        const data = {
            title: { tls: "menu.menus.escolher_canal" },
            pattern: "choose_channel",
            alvo: "guild_reports#channel",
            reback: "browse_button.guild_reports_button",
            operation: operacao,
            values: await client.getGuildChannels(interaction, user, ChannelType.GuildText, guild.reports.channel)
        }

        // Subtrai uma página do total ( em casos de exclusão de itens e pagina em cache )
        if (data.values.length < pagina * 24) pagina--

        let botoes = [
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `${reback}.2` },
            { id: "guild_reports_button", name: client.tls.phrase(user, "menu.botoes.atualizar"), type: 1, emoji: client.emoji(42), data: "3" }
        ]

        let row = client.menu_navigation(user, data, pagina || 0)

        if (row.length > 0) // Botões de navegação
            botoes = botoes.concat(row)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data, pagina }), client.create_buttons(botoes, interaction)],
            ephemeral: true
        })

    } else if (operacao === 5) {

        // Definindo o cargo que receberá o avisos de entradas do reporte
        const data = {
            title: { tls: "menu.menus.escolher_cargo" },
            pattern: "choose_role",
            alvo: "guild_reports_button#role",
            reback: "browse_button.guild_reports_button",
            operation: operacao,
            values: []
        }

        if (guild.reports.role)
            data.values.push({ name: client.tls.phrase(user, "manu.guild_data.remover_cargo"), id: "none" })

        data.values = data.values.concat(await client.getGuildRoles(interaction, guild.reports.role, true))

        // Subtrai uma página do total ( em casos de exclusão de itens e pagina em cache )
        if (data.values.length < pagina * 24) pagina--

        let botoes = [
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `${reback}.2` },
            { id: "guild_reports_button", name: client.tls.phrase(user, "menu.botoes.atualizar"), type: 1, emoji: client.emoji(42), data: "6" }
        ]

        let row = client.menu_navigation(user, data, pagina || 0)

        if (row.length > 0) // Botões de navegação
            botoes = botoes.concat(row)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data, pagina }), client.create_buttons(botoes, interaction)],
            ephemeral: true
        })

    } else if (operacao === 6) {

        // Escolhendo o tempo de exclusão das mensagens para membros banidos pelo AutoBan
        const valores = []
        Object.keys(banMessageEraser).forEach(key => { if (parseInt(key) !== guild.reports.erase_ban_messages) valores.push(key) })

        const data = {
            title: { tls: "menu.menus.escolher_expiracao" },
            pattern: "numbers",
            alvo: "guild_reports_ban_eraser",
            values: valores
        }

        let row = client.create_buttons([{
            id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `${reback}.1`
        }], interaction)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), row],
            ephemeral: true
        })
    }

    // Salvando os dados atualizados
    if (operations[operacao]) await client.prisma.guildOptionsReports.update({
        where: { id: guild.reports_id },
        data: guild.reports
    })

    if (operacao === 20) pagina_guia = 1
    else if (operacao === 21) pagina_guia = 2

    // Redirecionando a função para o painel de denuncias in-server
    require('../../chunks/panel_guild_external_reports')({ client, user, interaction, pagina_guia })
}