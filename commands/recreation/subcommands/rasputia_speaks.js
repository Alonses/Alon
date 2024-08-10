const { AttachmentBuilder } = require('discord.js')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, { conf: true })
    let num = client.random(client.countFiles("./files/songs/norbit", "ogg") - 1)

    const file = new AttachmentBuilder(`./files/songs/norbit/norbit_${num}.ogg`, { name: "norbit.ogg" })

    interaction.reply({
        files: [file],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}