const { relation } = require('../../../files/songs/faustop/songs.json')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, { conf: true })
    const data = {
        title: { tls: "Escolha uma frase do faustão!" },
        pattern: "phrases",
        alvo: "faustop",
        values: relation
    }

    interaction.reply({
        content: client.tls.phrase(user, "menu.menus.escolher_frase", 6),
        components: [client.create_menus({ client, interaction, user, data })],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}