const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("alaa")
        .setDescription("⌠😂|🇧🇷⌡ Funfo?"),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, { conf: true })
        const file = new AttachmentBuilder("./files/songs/alaa.ogg")
        interaction.reply({
            files: [file],
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    }
}