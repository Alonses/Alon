module.exports = async ({ client, interaction, channel }) => {
    const user = await client.getUser(interaction.user.id)

    await channel.permissionOverwrites.edit(
        interaction.guild.id,
        {
            SendMessages: true,
            ViewChannel: true,
            ReadMessageHistory: true,
            CreatePublicThreads: true,
            CreatePrivateThreads: true
        }
    )

    client.tls.reply(interaction, user, "mode.canal.unlock", true, client.defaultEmoji("guard"))
}