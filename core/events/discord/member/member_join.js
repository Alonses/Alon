const { EmbedBuilder } = require('discord.js')

const { getUserReports } = require('../../../database/schemas/User_reports')
const { registerUserGuild } = require('../../../database/schemas/User_guilds')

module.exports = async (client, dados) => {

    const guild = await client.getGuild(dados.guild.id, {
        logger: true,
        reports: true
    })
    const user = await client.getUser(dados.user.id)

    if (user.conf?.cached_guilds) // Salvando o novo servidor ao usuário
        await registerUserGuild(user.uid, dados.guild.id)

    if (client.cached.join_guilds.has(dados.guild.id)) { // Servidores com cargos na entrada

        const acionador = "join", interaction = dados
        require('../../../auto/triggers/user_assign_role')({ client, guild, interaction, acionador })
    }

    if (guild?.reports.notify) { // Notificando o servidor sobre a entrada de um usuário que possui reportes
        let historico = []

        const reports = await getUserReports(dados.user.id)
        reports.forEach(valor => {
            historico.push(`${client.defaultEmoji("time")} ${new Date(valor.timestamp * 1000).toLocaleString("pt-BR")} | ${valor.issuer_nick || client.tls.phrase(guild, "util.steam.undefined")}: ${valor.relatory}`)
        })

        const alvo = {
            uid: dados.user.id,
            relatory: historico.join("\n\n")
        }

        if (alvo.relatory.length > 5) {
            const id_canal = guild.reports_channel
            require('../../../auto/send_report')({ client, alvo, id_canal })
        }
    }

    // Verificando se a guild habilitou o logger
    if (!guild.logger.member_join || !guild.logger.enabled) return

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(guild, "mode.logger.novo_membro"))
        .setColor(0x29BB8E)
        .setFields(
            {
                name: client.user_title(dados.user, guild, "util.server.membro"),
                value: `${client.emoji("icon_id")} \`${dados.user.id}\`\n${client.emoji("mc_name_tag")} \`${dados.user.username}\`\n( <@${dados.user.id}> )`,
                inline: true
            }
        )
        .setTimestamp()

    const url_avatar = dados.user.avatarURL({ dynamic: true, size: 2048 })
    if (url_avatar) embed.setThumbnail(url_avatar)

    client.notify(guild.logger.channel, { embeds: [embed] })
}