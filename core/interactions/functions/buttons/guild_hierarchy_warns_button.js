const { ChannelType } = require('discord.js')

const { defaultWarnStrikes, defaultEraser } = require('../../../formatters/patterns/timeout')
const {updateGuild} = require("../../../database/schemas/Guild");

// 1 -> Ativar ou desativar as advertências com hierarquia
// 2 -> Ativar ou desativar a expiração de anotações

const operations = {
    1: { action: "warn.hierarchy.status", page: 0 },
    2: { action: "warn.hierarchy.timed", page: 0 }
}

module.exports = async ({ client, user, interaction, dados, pagina }) => {

    let operacao = parseInt(dados.split(".")[1]), reback = "panel_guild_warns.0", pagina_guia = 0
    let guild = await client.getGuild(interaction.guild.id)

    // Sem canal de avisos definido, solicitando um canal
    if (!guild.warn_hierarchy_channel) {
        // reback = "panel_guild_warns.0"
        operacao = 5
    }

    // Tratamento dos cliques
    // 0 -> Entrar no painel de cliques

    // 4 -> Escolher o número de avisos prévios
    // 5 -> Escolher o canal de avisos para advertências completadas

    if (operations[operacao]) ({ guild, pagina_guia } = client.switcher({ guild, operations, operacao }))
    else if (operacao === 4) {

        // Escolher o número de avisos prévios
        const valores = []
        defaultWarnStrikes.forEach(key => { if (parseInt(key) !== guild.warn.hierarchy.strikes) valores.push(key) })

        const data = {
            title: { tls: "menu.menus.escolher_numero" },
            pattern: "numbers",
            alvo: "guild_hierarchy_warns_strikes",
            raw: true,
            values: valores
        }

        let row = client.create_buttons([{
            id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "panel_guild_hierarchy_warns"
        }], interaction)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), row],
            ephemeral: true
        })

    } else if (operacao === 5) {

        // Definindo o canal de avisos das advertências hierárquicas
        let canal = guild.warn_hierarchy_channel

        const data = {
            title: { tls: "menu.menus.escolher_canal" },
            pattern: "choose_channel",
            alvo: "guild_hierarchy_warns#channel",
            reback: "browse_button.guild_warns_button",
            operation: operacao,
            values: []
        }

        // Listando os canais do servidor
        data.values = data.values.concat(await client.getGuildChannels(interaction, user, ChannelType.GuildText, canal))

        // Subtrai uma página do total ( em casos de exclusão de itens e pagina em cache )
        if (data.values.length < pagina * 24) pagina--

        let botoes = [
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "panel_guild_hierarchy_warns" },
            { id: "guild_hierarchy_warns_button", name: client.tls.phrase(user, "menu.botoes.atualizar"), type: 1, emoji: client.emoji(42), data: operacao }
        ]

        let row = client.menu_navigation(user, data, pagina || 0)

        if (row.length > 0) // Botões de navegação
            botoes = botoes.concat(row)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data, pagina }), client.create_buttons(botoes, interaction)],
            ephemeral: true
        })

    } else if (operacao === 6) {

        // Escolhendo o tempo de expiração dos avisos de advertência
        const valores = []
        Object.keys(defaultEraser).forEach(key => { if (parseInt(key) !== guild.warn_hierarchy_reset) valores.push(`${key}.${defaultEraser[key]}`) })

        const data = {
            title: { tls: "mode.warn.definir_tempo" },
            pattern: "numbers",
            alvo: "guild_hierarchy_warns_reset",
            submenu: operacao,
            values: valores
        }

        let row = client.create_buttons([{
            id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "panel_guild_hierarchy_warns"
        }], interaction)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), row],
            ephemeral: true
        })
    }

    // Salvando os dados atualizados
    if (operations[operacao]) await updateGuild(client, guild.id, guild)

    // Redirecionando a função para o painel das advertências com hierarquia
    require('../../chunks/panel_guild_hierarchy_warns')({ client, user, interaction, pagina_guia })
}