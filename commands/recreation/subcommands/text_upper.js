module.exports = async ({ client, interaction, texto_entrada }) => {
    const user = await client.getUser(interaction.user.id, { conf: true })
    // Torna o texto nesse formato "A A A A A A"
    interaction.reply({
        content: texto_entrada.toUpperCase().split('').join(" ").trim(),
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}