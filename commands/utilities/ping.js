const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("⌠💡⌡ See your ping")
        .setDescriptionLocalizations({
            "de": '⌠💡⌡ Überprüfen Sie Ihren Ping',
            "es-ES": '⌠💡⌡ Ver tu ping',
            "fr": '⌠💡⌡ Voir votre ping',
            "it": '⌠💡⌡ Guarda il tuo ping',
            "pt-BR": '⌠💡⌡ Veja seu ping',
            "ru": '⌠💡⌡ Проверьте свой пинг'
        }),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, { conf: true })
        const m = await interaction.reply({
            content: "Ping?",
            fetchReply: true,
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })

        const delay = m.createdTimestamp - interaction.createdTimestamp

        let mensagem = `:ping_pong: Pong! [ **\`${delay}ms\`** ] ${client.tls.phrase(user, "util.ping.ping_1")} ${client.emoji("dancando_thanos")}`

        if (delay < 200)
            mensagem = `:ping_pong: Pong! [ **\`${delay}ms\`** ] ${client.tls.phrase(user, "util.ping.ping_2")}`

        if (delay < 100)
            mensagem = `:ping_pong: Pong! [ **\`${delay}ms\`** ] ${client.tls.phrase(user, "util.ping.ping_3")} ${client.emoji("dancando_steve")}`

        if (delay > 600)
            mensagem = `:ping_pong: Pong! [ **\`${delay}ms\`** ] ${client.tls.phrase(user, "util.ping.ping_4")} ${client.emoji("pare_agr")}`

        if (delay <= 0)
            mensagem = `:ping_pong: Pong!? [ **\`${delay}ms\`** ] ${client.tls.phrase(user, "util.ping.ping_5")} ${client.emoji("susto2")}`

        mensagem += `\n${client.tls.phrase(user, "util.ping.latencia")} [ **\`${Math.round(client.discord.ws.ping)}ms\`** ]`

        await interaction.editReply({
            content: mensagem,
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    }
}