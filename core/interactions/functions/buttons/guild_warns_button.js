const { ChannelType, EmbedBuilder } = require('discord.js')

const { atualiza_warns } = require('../../../auto/triggers/user_warns')
const { listAllGuildWarns, getGuildWarn } = require('../../../database/schemas/Guild_warns')

const { loggerMap } = require('../../../formatters/patterns/guild')
const { banMessageEraser, spamTimeoutMap } = require('../../../formatters/patterns/timeout')
const {updateGuild} = require("../../../database/schemas/Guild");

// 6 -> Advertências cronometradas
// 8 -> Ativar ou desativar as notificações das advertências
// 10 -> Ativar ou desativar as notificações de exclusões de advertências
// 11 -> Ativar ou desativar anúncios públicos

const operations = {
    6: { action: "warn.timed", page: 0 },
    8: { action: "warn.notify", page: 1 },
    10: { action: "warn.notify_exclusion", page: 1 },
    11: { action: "warn.announce.status", page: 1 }
}

module.exports = async ({ client, user, interaction, dados, pagina }) => {

    let operacao = parseInt(dados.split(".")[1]), reback = "panel_guild_warns.2", pagina_guia = 0

    const advertencias = await listAllGuildWarns(client, interaction.guild.id)
    let guild = await client.getGuild(interaction.guild.id, { warn: true } )

    if (operacao > 8) pagina_guia = 2

    // Sem canal de avisos definido, solicitando um canal
    if (!guild.warn.channel) {
        reback = "panel_guild.0"
        operacao = 5
    }

    // Tratamento dos cliques
    // 0 -> Entrar no painel de cliques
    // 1 -> Ativar ou desativar o warn
    // 3 -> Configurar advertências

    // 5 -> Escolher canal de avisos
    // 7 -> Definir exclusão de mensagens por banimento

    // 9 -> Alterar de página dentro do guia
    // 12 -> Definir canal de anúncios públicos
    // 15 -> Sub menu com as opções para gerenciar as notificações

    // 17 -> Definir canal temporário de avisos das advertências

    // 16 -> Tempo de expiração das advertências
    // 20 e 21 -> Sub menu com opções para gerenciar penalidades no servidor

    if (operations[operacao]) ({ guild, pagina_guia } = client.switcher({ guild, operations, operacao }))
    else if (operacao === 1) {

        if (advertencias.length < 2)
            return interaction.update({
                content: client.tls.phrase(user, "mode.warn.bloqueio_minimo", 47),
                ephemeral: true
            })

        // Ativa ou desativa as advertências do servidor
        await client.prisma.guildOptionsWarn.update({
            where: { id: guild.warn_id },
            data: { enabled: !guild.warn.enabled }
        })
    } else if (operacao === 3) {

        // Submenu para navegar pelas advertências do servidor
        let botoes = [], row = [{
            id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: "panel_guild_warns.0"
        }], indice_matriz = 5

        if (advertencias.length < 1) {
            await getGuildWarn(client, interaction.guild.id, 0)

            botoes.push({
                id: "warn_configure_button", name: "1°", type: 1, emoji: client.emoji(39), data: `9|0`
            })
        } else
            advertencias.forEach(warn => {

                let disabled = false

                // Verificando se não há botões com regras que resultam em expulsão ou banimento listados antes
                if (warn.rank > indice_matriz)
                    disabled = true

                botoes.push({
                    id: "warn_configure_button", name: `${warn.rank + 1}°`, type: 1, emoji: warn.action ? loggerMap[warn.action] : client.emoji(39), data: `9|${warn.rank}`, disabled: disabled
                })

                if (warn.action)
                    if (warn.action === "member_kick_2" || warn.action === "member_ban")
                        indice_matriz = warn.rank
            })

        if (botoes.length < 5) // Botão para adicionar uma nova advertência
            row.push({ id: "warn_configure_button", name: client.tls.phrase(user, "menu.botoes.nova_advertencia"), type: 2, emoji: client.emoji(43), data: `9|${advertencias.length < 1 ? 1 : advertencias.length}` })

        const embed = new EmbedBuilder()
            .setTitle(client.tls.phrase(user, "mode.warn.configurando_warns"))
            .setColor(client.embed_color(user.misc.color))
            .setDescription(client.tls.phrase(user, "mode.warn.descricao_configuracao_warn"))
            .setFooter({
                text: client.tls.phrase(user, "mode.warn.customizacao_rodape"),
                iconURL: interaction.user.avatarURL({ dynamic: true })
            })

        return interaction.update({
            embeds: [embed],
            components: [client.create_buttons(botoes, interaction), client.create_buttons(row, interaction)],
            ephemeral: true
        })

    } else if (operacao === 5 || operacao === 12 || operacao === 17) {

        // Definindo o canal de avisos dos warns, canal de avisos públicos ou de avisos temporários
        let canal = guild.warn.channel, alvo = "guild_warns#channel", digito = 2

        if (operacao === 12) {
            canal = guild.warn.announce_channel
            alvo = "guild_warns_announce#channel"
            reback = "panel_guild_warns"
            digito = 1
        }

        if (operacao === 17) {
            canal = guild.warn.timed_channel
            alvo = "guild_warns_timed_channel#channel"
            reback = "panel_guild_warns"
            digito = 2
        }

        const data = {
            title: { tls: "menu.menus.escolher_canal" },
            pattern: "choose_channel",
            alvo: alvo,
            reback: "browse_button.guild_warns_button",
            operation: operacao,
            values: []
        }

        if (canal && (operacao === 12 || operacao === 17))
            data.values.push({ name: client.tls.phrase(user, "manu.guild_data.remover_canal"), id: "none" })

        // Listando os canais do servidor
        data.values = data.values.concat(await client.getGuildChannels(interaction, user, ChannelType.GuildText, canal))

        // Subtrai uma página do total ( em casos de exclusão de itens e pagina em cache )
        if (data.values.length < pagina * 24) pagina--

        let botoes = [
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `${reback}.${digito}` },
            { id: "guild_warns_button", name: client.tls.phrase(user, "menu.botoes.atualizar"), type: 1, emoji: client.emoji(42), data: operacao }
        ]

        let row = client.menu_navigation(user, data, pagina || 0)

        if (row.length > 0) // Botões de navegação
            botoes = botoes.concat(row)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data, pagina }), client.create_buttons(botoes, interaction)],
            ephemeral: true
        })

    } else if (operacao === 7) {

        // Escolhendo o tempo de exclusão das mensagens para membros banidos por advertências
        const valores = []
        Object.keys(banMessageEraser).forEach(key => { if (parseInt(key) !== guild.warn.erase_ban_messages) valores.push(key) })

        const data = {
            title: { tls: "menu.menus.escolher_expiracao" },
            pattern: "numbers",
            alvo: "guild_warns_ban_eraser",
            values: valores
        }

        let row = client.create_buttons([{
            id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `${reback}.2`
        }], interaction)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), row],
            ephemeral: true
        })

    } else if (operacao == 16) {

        // Definindo o tempo de expiração das advertências no servidor
        const valores = []
        Object.keys(spamTimeoutMap).forEach(key => { if (parseInt(key) !== guild.warn.reset) valores.push(`${key}.${spamTimeoutMap[key]}`) })

        const data = {
            title: { tls: "mode.warn.definir_tempo" },
            pattern: "numbers",
            alvo: "guild_warns_reset",
            submenu: operacao,
            values: valores
        }

        let row = client.create_buttons([{
            id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: reback
        }], interaction)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), row],
            ephemeral: true
        })
    }

    // Sincroniza as advertências criadas
    if (operacao === 6) atualiza_warns(client)

    // Alterando a página 
    if (operacao === 15) pagina_guia = 1

    // Salvando os dados atualizados
    if (operations[operacao]) await updateGuild(client, guild.id, guild)

    // Redirecionando a função para o painel das advertências
    require('../../chunks/panel_guild_warns')({ client, user, interaction, pagina_guia })
}