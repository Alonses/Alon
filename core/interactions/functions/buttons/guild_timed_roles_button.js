const { ChannelType } = require('discord.js')

const { defaultRoleTimes } = require('../../../formatters/patterns/timeout')

module.exports = async ({ client, user, interaction, dados, pagina }) => {

    let operacao = parseInt(dados.split(".")[1]), reback = "panel_guild_timed_roles"
    const guild = await client.getGuild(interaction.guild.id)

    // Sem canal definido, solicitando um canal
    if (!guild.timed_roles_channel) {
        reback = "panel_guild.2"
        operacao = 2
    }

    // Tratamento dos cliques
    // 0 -> Entrar no painel de cliques

    // 1 -> Escolher o tempo padrão para novos cargos temporários
    // 2 -> Escolher canal para os avisos de cargos temporários

    if (operacao === 1) {

        // Submenu para escolher o tempo de expiração dos cargos
        const valores = []
        Object.keys(defaultRoleTimes).forEach(key => { if (parseInt(key) !== guild.timed_roles_timeout) valores.push(`${key}.${defaultRoleTimes[key]}`) })

        const data = {
            title: { tls: "menu.menus.escolher_tempo_remocao" },
            pattern: "numbers",
            alvo: "guild_timed_roles_timeout",
            values: valores
        }

        let row = client.create_buttons([{
            id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: reback
        }], interaction)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), row],
            ephemeral: true
        })

    } else if (operacao === 2) {

        // Definindo o canal para os avisos dos cargos temporários
        const data = {
            title: { tls: "menu.menus.escolher_canal" },
            pattern: "choose_channel",
            alvo: "guild_timed_roles#channel",
            reback: "browse_button.guild_timed_roles_button",
            operation: operacao,
            values: await client.getGuildChannels(interaction, user, ChannelType.GuildText, guild.timed_roles_channel)
        }

        // Subtrai uma página do total ( em casos de exclusão de itens e pagina em cache )
        if (data.values.length < pagina * 24) pagina--

        let botoes = [
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: reback },
            { id: "guild_timed_roles_button", name: client.tls.phrase(user, "menu.botoes.atualizar"), type: 1, emoji: client.emoji(42), data: "2" }
        ]

        let row = client.menu_navigation(user, data, pagina || 0)

        if (row.length > 0) // Botões de navegação
            botoes = botoes.concat(row)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data, pagina }), client.create_buttons(botoes, interaction)],
            ephemeral: true
        })
    }

    // Redirecionando a função para o painel dos cargos temporários
    require('../../chunks/panel_guild_timed_roles')({ client, user, interaction, operacao })
}