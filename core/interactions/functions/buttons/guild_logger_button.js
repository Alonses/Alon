const { ChannelType } = require('discord.js')
const {updateGuild} = require("../../../database/schemas/Guild");

// 1 -> Ativar ou desativar o log de eventos
// 5 -> Ativar ou desativar o registro de punições em canal separado
// 7 -> Ativar ou desativar as notificações

const operations = {
    1: { action: "conf.logger", page: 0 },
    5: { action: "death.note", page: 2 },
    7: { action: "death.note.notify", page: 2 }
}

module.exports = async ({ client, user, interaction, dados, pagina }) => {

    let operacao = parseInt(dados.split(".")[1]), reback = "panel_guild_logger", pagina_guia = 0
    let guild = await client.getGuild(interaction.guild.id)

    // Sem canal de avisos definido, solicitando um canal
    if (!guild.logger_channel) {
        reback = "panel_guild.0"
        operacao = 3
    }

    // Sem canal de aviso para o Death note escolhido
    if (operacao === 5 && !guild.death_note_channel)
        operacao = 8

    // Tratamento dos cliques
    // 0 -> Entrar no painel de cliques
    // 2 -> Eventos do logger

    // Página 1
    // 3 -> Escolher canal de avisos
    // 4 -> Alterar o idioma do servidor

    // Página 2
    // 6 -> Escolher eventos a serem separados
    // 8 -> Escolher canal de penalidades

    // 9 -> Página 1 ( configurações do log de eventos )
    // 10 -> Página 2 ( opções do registrador )

    if (operations[operacao]) ({ guild, pagina_guia } = client.switcher({ guild, operations, operacao }))
    else if (operacao === 2 || operacao === 6) {

        const eventos = []
        let lista_eventos = Object.keys(guild).filter(prop => prop.startsWith("logger")), alvo = "guild_logger#events", digito = 0

        if (operacao === 6) {
            lista_eventos = Object.keys(guild).filter(prop => prop.startsWith("death_note"))
            alvo = "guild_logger_death_note#events"
            digito = 2
        }

        lista_eventos.forEach(evento => {
            if (evento !== "logger_channel" && operacao === 2)
                eventos.push({ type: evento.replace("logger_", ""), status: guild[evento] })

            if (evento.includes("member_") && operacao === 6) {
                eventos.push({type: evento.replace("death_note_", ""), status: guild[evento]})
            }
        })

        // Definindo os eventos que o log irá relatar no servidor
        const data = {
            title: { tls: "menu.menus.escolher_eventos" },
            pattern: "choose_events",
            alvo: alvo,
            reback: "browse_button.guild_logger_button",
            operation: operacao,
            values: eventos
        }

        const botoes = client.create_buttons([{ id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `${reback}.${digito}` }], interaction)
        const multi_select = true

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data, pagina, multi_select }), botoes],
            ephemeral: true
        })

    } else if (operacao === 3 || operacao === 8) {

        let canal = guild.logger_channel, alvo = "guild_logger#channel", digito = 1

        if (operacao === 8) {
            canal = guild.death_note_channel
            alvo = "guild_logger_death_note#channel"
            digito = 2
        }

        // Definindo o canal de avisos do log de eventos e de avisos separados
        const data = {
            title: { tls: "menu.menus.escolher_canal" },
            pattern: "choose_channel",
            alvo: alvo,
            reback: "browse_button.guild_logger_button",
            operation: operacao,
            values: await client.getGuildChannels(interaction, user, ChannelType.GuildText, canal)
        }

        // Subtrai uma página do total ( em casos de exclusão de itens e pagina em cache )
        if (data.values.length < pagina * 24) pagina--

        let botoes = [
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `${reback}.${digito}` },
            { id: "guild_logger_button", name: client.tls.phrase(user, "menu.botoes.atualizar"), type: 1, emoji: client.emoji(42), data: operacao }
        ]

        let row = client.menu_navigation(user, data, pagina || 0)

        if (row.length > 0) // Botões de navegação
            botoes = botoes.concat(row)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data, pagina }), client.create_buttons(botoes, interaction)],
            ephemeral: true
        })

    } else if (operacao === 4) {

        // Alterando o idioma do servidor
        const data = {
            title: { tls: "menu.menus.escolher_idioma" },
            pattern: "choose_language",
            alvo: "guild_logger#language",
            reback: "browse_button.guild_logger_button",
            operation: operacao,
            values: await client.listLanguages(guild.lang)
        }

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), client.create_buttons([{ id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `${reback}.1` }], interaction)],
            ephemeral: true
        })
    }

    if (operacao === 9) pagina_guia = 1
    if (operacao === 10) pagina_guia = 2

    // Salvando os dados atualizados
    if (operations[operacao]) await updateGuild(client, guild.id, guild)

    // Redirecionando a função para o painel do log de eventos
    require('../../chunks/panel_guild_logger')({ client, user, interaction, operacao, pagina_guia })
}