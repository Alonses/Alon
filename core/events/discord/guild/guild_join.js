const { EmbedBuilder, AuditLogEvent, PermissionsBitField } = require('discord.js')

const { verifyDynamicBadge } = require('../../../database/schemas/User_badges')

const { badges } = require('../../../formatters/patterns/user')
const {updateGuild} = require("../../../database/schemas/Guild");
const {updateUser} = require("../../../database/schemas/User");

module.exports = async ({ client, guild }) => {

    if (client.id() !== process.env.client_1 || !process.env.channel_server) return

    const erase_id = await client.getGuild(guild.id).erase_id
    await client.prisma.guildOptionsErase.update({
        where: { id: erase_id },
        data: { erase_valid: false }
    })

    const canais = guild.channels.cache.filter((c) => c.type !== "GUILD_CATEGORY").size
    const server_info = `\n\n:busts_in_silhouette: **Members** ( \`${guild.memberCount - 1}\` )\n:placard: **Channels** ( \`${canais}\` )`

    // Verificando permissão para do registro de auditoria, não registra o usuário que adicionou o bot
    if (await client.permissions(guild, client.id(), PermissionsBitField.Flags.ViewAuditLog)) {

        // Resgatando informações sobre o usuário que adicionou o bot ao servidor
        guild.fetchAuditLogs({ type: AuditLogEvent.BotAdd, limit: 1 }).then(async log => {

            const user = log.entries.first().executor

            // Salvando o ID do usuário que adicionou o bot ao servidor
            if (user) {

                // Apenas contabiliza o hoster caso o servidor possua muitos membros
                if ((guild.memberCount - 1) > 20)
                    await updateGuild(client, guild.id, { inviter: user.id })

                const inviter = await client.getUser(user.id)

                if (!inviter.hoster) { // Envia um Embed ao usuário que adicionou o bot ao servidor
                    const row = client.create_buttons([
                        { name: client.tls.phrase(inviter, "inic.ping.site"), type: 4, emoji: "🌐", value: 'http://alonsal.discloud.app/' },
                        { name: client.tls.phrase(inviter, "inic.inicio.suporte"), type: 4, emoji: client.emoji("icon_rules_channel"), value: process.env.url_support }
                    ])

                    const embed = new EmbedBuilder()
                        .setTitle(client.tls.phrase(inviter, "inic.ping.titulo"))
                        .setColor(client.embed_color(inviter.misc.color))
                        .setImage("https://i.imgur.com/N8AFVTH.png")
                        .setDescription(`${client.tls.phrase(inviter, "inic.ping.boas_vindas")}\n\n${client.defaultEmoji("earth")} | ${client.tls.phrase(inviter, "inic.ping.idioma_dica_server")}`)

                    client.sendDM(inviter.id, { embeds: [embed], components: [row] }, true)
                }

                // Atualizando os dados do usuário para não avisar mais o mesmo em DM
                await updateUser(client, inviter.id, { hoster: true })
            }

            // Checking which user invited the bot the most
            if ((guild.memberCount - 1) > 20) verifyDynamicBadge(client, "hoster", badges.HOSTER)
        })
    }

    const embed = new EmbedBuilder()
        .setTitle("> 🟢 Server update")
        .setColor(0x29BB8E)
        .setDescription(`:globe_with_meridians: ( \`${guild.id}\` | \`${guild.name}\` )${server_info}`)
        .setTimestamp()

    client.notify(process.env.channel_server, { embeds: [embed] })
}