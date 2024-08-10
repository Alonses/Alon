const { AttachmentBuilder } = require('discord.js')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, { conf: true })
    const data = new Date()
    let num = client.random(client.countFiles("./files/songs/faustop", "ogg") - 1)

    if (data.getHours() === 20 && data.getMinutes() === 7)
        num = client.random(1, 1) > 1 ? 7 : 12

    const file = new AttachmentBuilder(`./files/songs/faustop/faustop_${num}.ogg`, { name: "faustop.ogg" })

    interaction.reply({
        files: [file],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}