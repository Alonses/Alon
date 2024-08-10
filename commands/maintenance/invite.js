const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setNameLocalizations({
            "de": 'einladen',
            "es-ES": 'invitacion',
            "fr": 'invitation',
            "it": 'invito',
            "pt-BR": 'convite',
            "ru": 'пригласить',
        })
        .setDescription("⌠📡⌡ Invite Alonsal right now!")
        .setDescriptionLocalizations({
            "de": '⌠📡⌡ Jetzt Alonsal einladen!',
            "es-ES": '⌠📡⌡ ¡Invita a Alonsal ahora mismo!',
            "fr": '⌠📡⌡ Invitez Alonsal maintenant!',
            "it": '⌠📡⌡ Invita Alonsal ora!',
            "pt-BR": '⌠📡⌡ Convide o Alonsal agora mesmo!',
            "ru": '⌠📡⌡ Пригласите Алонсала прямо сейчас!'
        }),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, { misc: true })
        const row = client.create_buttons([
            { name: client.tls.phrase(user, "inic.inicio.convidar"), type: 4, emoji: client.emoji("mc_coracao"), value: `https://discord.com/oauth2/authorize?client_id=${client.id()}&scope=bot&permissions=2550136990` }
        ], interaction)

        const embed = new EmbedBuilder()
            .setTitle(client.tls.phrase(user, "manu.convite.titulo"))
            .setColor(client.embed_color(user.misc.color))
            .setImage("https://i.imgur.com/N8AFVTH.png")
            .setDescription(client.tls.phrase(user, "manu.convite.convite"))

        interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        })
    }
}