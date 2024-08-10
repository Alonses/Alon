module.exports = async ({ client, interaction, texto_entrada }) => {
    const user = await client.getUser(interaction.user.id, { conf: true })
    // Inverte o texto enviado
    interaction.reply({
        content: texto_entrada.split('').reverse().join(""),
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}