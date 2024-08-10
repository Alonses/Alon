const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { EmbedBuilder } = require('discord.js')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, { conf: true })
    fetch(`${process.env.url_apisal}/gta?idioma=${user.lang}`)
        .then(response => response.json())
        .then(async data => {

            let emoji_horario = data.gameTimeStr.slice(0, 2) < 20 && data.gameTimeStr.slice(0, 2) > 6 ? data.gameTimeStr.slice(0, 2) > 17 ? ":city_sunset:" : ":park:" : ":bridge_at_night:"

            let hours = data.gameTimeStr.split(":")[0] % 12
            hours = hours ? hours : 12

            if (data.gameTimeStr.split(":")[1] >= 30)
                hours += "30"

            const embed = new EmbedBuilder()
                .setTitle("> This is Weazel News")
                .setColor(client.embed_color(user.misc.color))
                .setDescription(`\`\`\`${data.currentWeatherEmoji} - ${data.currentWeatherDescription}\`\`\``)
                .addFields(
                    {
                        name: client.tls.phrase(user, "game.gta.horario_atual"),
                        value: `:clock${hours}: \`${data.gameTimeStr}\`${emoji_horario}\` \``,
                        inline: true
                    }
                )

            const row = client.create_buttons([
                { id: "gta_resume", name: client.tls.phrase(user, "menu.botoes.atualizar"), type: 1, emoji: client.emoji(42), data: "0" }
            ], interaction)

            client.reply(interaction, {
                embeds: [embed],
                components: [row],
                ephemeral: client.decider(user?.conf.ghost_mode, 0)
            })
        })
        .catch(() => {
            client.reply(interaction, {
                content: client.tls.phrase(user, "game.gta.erro_apisal", client.emoji(0))
            })
        })
}