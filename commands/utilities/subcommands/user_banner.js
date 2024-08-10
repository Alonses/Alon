const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { EmbedBuilder } = require('discord.js')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, { conf: true })
    let user_alvo = interaction.options.getUser("user") || interaction.user
    const user_c = await client.getUser(user_alvo.id, { misc: true })

    let response = fetch(`https://discord.com/api/v8/users/${user_alvo.id}`, {
        method: 'GET',
        headers: {
            Authorization: `Bot ${client.x.token}`
        }
    })

    let receive = "", url_banner = ""

    response.then(a => {
        if (a.status !== 404) {
            a.json().then(data => {
                receive = data["banner"]

                if (receive !== null) {

                    let format = "png"
                    if (receive.substring(0, 2) === "a_") {
                        format = "gif"
                    }

                    url_banner = `https://cdn.discordapp.com/banners/${user_alvo.id}/${receive}.${format}?size=2048`
                }

                // Usuário sem banner customizado
                if (url_banner.length < 1)
                    return client.tls.reply(interaction, user, "util.avatar.sem_banner", true, client.emoji(0))

                const row = client.create_buttons([
                    { name: client.tls.phrase(user, "menu.botoes.navegador"), type: 4, emoji: "🌐", value: url_banner }
                ])

                // Exibindo o banner do usuário
                const embed = new EmbedBuilder()
                    .setTitle(`> ${user_alvo.username}`)
                    .setColor(client.embed_color(user_c.misc.embed))
                    .setImage(url_banner)
                    .setDescription(client.tls.phrase(user, "util.avatar.download_banner"))

                interaction.reply({
                    embeds: [embed],
                    components: [row],
                    ephemeral: client.decider(user?.conf.ghost_mode, 0)
                })
            })
        }
    })
}