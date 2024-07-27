const { PermissionsBitField } = require('discord.js')

const { free_games } = require('../../../core/functions/free_games.js')

module.exports = async ({ client, user, interaction }) => {

    let guild = await client.getGuild(interaction.guild.id)

    if (!guild.games_channel || !guild.games_role)
        return client.tls.reply(interaction, user, "mode.anuncio.configuracao", true, 11)

    const canal_alvo = client.discord.channels.cache.get(guild.games_channel)

    if (canal_alvo) {
        if (canal_alvo.type === 0 || canal_alvo.type === 5) {

            // Permissão para enviar mensagens no canal
            if (await client.permissions(null, client.id(), [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel], canal_alvo)) {

                if (guild.conf_games) // Módulo de anúncios de games ativado
                    client.tls.reply(interaction, user, "mode.anuncio.anuncio_enviado_duplicatas", true, 29, `<#${guild.games_channel}>`)
                else // Módulo de anúncios de games desativado
                    client.tls.reply(interaction, user, "mode.anuncio.anuncio_enviado", true, 29, `<#${guild.games_channel}>`)

                // Enviando os games para anunciar no servidor
                const guild_channel = guild.games_channel
                free_games({ client, guild_channel })

            } else // Sem permissão para enviar mensagens no canal
                return client.tls.reply(interaction, user, "mode.anuncio.permissao_envio", true, client.defaultEmoji("guard"))

        } else // Tipo de canal inválido
            return client.tls.reply(interaction, user, "mode.anuncio.tipo_canal", true, client.defaultEmoji("types"))

    } else // Sem canal configurado
        return client.tls.reply(interaction, user, "mode.anuncio.configuracao", true, client.defaultEmoji("guard"))
}