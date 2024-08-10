const { gifs } = require("../../../files/json/gifs/galerito.json")

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, { conf: true })
    interaction.reply({
        content: gifs[client.random(gifs)],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}