module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, { conf: true })
    interaction.reply({
        content: 'https://tenor.com/view/galerito-gil-das-esfihas-meme-br-slondo-gif-15414263',
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}