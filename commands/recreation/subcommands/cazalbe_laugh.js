const { AttachmentBuilder } = require('discord.js')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, { conf: true })
    const file = new AttachmentBuilder("./files/songs/cazalbe.ogg")
    interaction.reply({
        files: [file],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}