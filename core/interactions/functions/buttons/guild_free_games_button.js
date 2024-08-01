const { PermissionsBitField, ChannelType } = require('discord.js')

const { free_games } = require('../../../functions/free_games.js')
const {updateGuild} = require("../../../database/schemas/Guild");

module.exports = async ({ client, user, interaction, dados, pagina }) => {

    let operacao = parseInt(dados.split(".")[1]), reback = "panel_guild_free_games"
    const guild = await client.getGuild(interaction.guild.id)

    // Sem canal de avisos definido, solicitando um canal
    if (!guild.games_channel) {
        reback = "panel_guild.1"
        operacao = 4
    }

    // Sem cargo de avisos definido, solicitando um cargo
    if (guild.games_channel && !guild.games_role) {
        reback = "panel_guild.1"
        operacao = 3
    }

    // Tratamento dos cliques
    // 0 -> Entrar no painel de cliques
    // 1 -> Ativar ou desativar os jogos gratuitos
    // 2 -> Anunciando os jogos gratuitos do momento
    // 3 -> Escolher cargo para notificar
    // 4 -> Escolher canal para enviar o anúncio

    // Ativa ou desativa o módulo de jogos gratuitos do servidor
    if (operacao === 1)
        await updateGuild(client, guild.id, { games_enabled: !guild.games_enabled })
    else if (operacao === 2) {
        // Enviando um anúncio com os titulos de graça no momento
        const canal_alvo = client.discord.channels.cache.get(guild.games_channel)

        if (canal_alvo) {

            // Permissão para enviar mensagens no canal
            if (await client.permissions(null, client.id(), [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel], canal_alvo)) {

                // Enviando os games para anunciar no servidor
                const guild_channel = guild.games_channel
                free_games({ client, guild_channel })

                return interaction.update({
                    content: client.tls.phrase(user, "mode.anuncio.anuncio_enviado_duplicatas", client.emoji(29), `<#${guild.games_channel}>`),
                    ephemeral: true
                })
            } else // Sem permissão para enviar mensagens no canal
                return interaction.update({
                    content: client.tls.phrase(user, "mode.anuncio.permissao_envio", client.defaultEmoji("guard")),
                    ephemeral: true
                })

        } else // Sem canal configurado
            return interaction.update({
                content: client.tls.phrase(user, "mode.anuncio.configuracao", client.defaultEmoji("guard")),
                ephemeral: true
            })

    } else if (operacao === 3) {

        // Desabilitando o botão de escolher cargos se não tiver permissão
        if (!await client.permissions(interaction, client.id(), [PermissionsBitField.Flags.ManageRoles]))
            return interaction.update({
                content: client.tls.phrase(user, "mode.anuncio.permissao_cargos", 7),
                ephemeral: true
            })

        // Definindo o cargo que receberá o avisos de games free
        const data = {
            title: { tls: "menu.menus.escolher_cargo" },
            pattern: "choose_role",
            alvo: "guild_free_games#role",
            reback: "browse_button.guild_free_games_button",
            operation: operacao,
            values: await client.getGuildRoles(interaction, guild.games_role, true)
        }

        // Subtrai uma página do total ( em casos de exclusão de itens e pagina em cache )
        if (data.values.length < pagina * 24) pagina--

        let botoes = [
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: reback },
            { id: "guild_free_games_button", name: client.tls.phrase(user, "menu.botoes.atualizar"), type: 1, emoji: client.emoji(42), data: "3" }
        ]

        let row = client.menu_navigation(user, data, pagina || 0)

        if (row.length > 0) // Botões de navegação
            botoes = botoes.concat(row)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data, pagina }), client.create_buttons(botoes, interaction)],
            ephemeral: true
        })

    } else if (operacao === 4) {

        // Definindo o canal de avisos de anúncio de games free
        const data = {
            title: { tls: "menu.menus.escolher_canal" },
            pattern: "choose_channel",
            alvo: "guild_free_games#channel",
            reback: "browse_button.guild_free_games_button",
            operation: operacao,
            values: await client.getGuildChannels(interaction, user, ChannelType.GuildText, guild.games_channel)
        }

        // Subtrai uma página do total ( em casos de exclusão de itens e pagina em cache )
        if (data.values.length < pagina * 24) pagina--

        let botoes = [
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: reback },
            { id: "guild_free_games_button", name: client.tls.phrase(user, "menu.botoes.atualizar"), type: 1, emoji: client.emoji(42), data: "4" }
        ]

        let row = client.menu_navigation(user, data, pagina || 0)

        if (row.length > 0) // Botões de navegação
            botoes = botoes.concat(row)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data, pagina }), client.create_buttons(botoes, interaction)],
            ephemeral: true
        })
    }

    // Redirecionando a função para o painel de jogos gratuitos
    require('../../chunks/panel_guild_free_games')({ client, user, interaction, operacao })
}