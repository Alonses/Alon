module.exports = async ({ client, interaction, channel }) => {
    const user = await client.getUser(interaction.user.id)

    await channel.permissionOverwrites.edit(
        interaction.guild.id,
        {
            SendMessages: false,
            ViewChannel: true,
            ReadMessageHistory: true,
            CreatePublicThreads: false,
            CreatePrivateThreads: false
        }
    )

    client.tls.reply(interaction, user, "mode.canal.lock", true, client.defaultEmoji("guard"))
}