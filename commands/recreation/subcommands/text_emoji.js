module.exports = async ({ client, user, interaction, texto_entrada, user_command }) => {

    // Torna o texto nesse formato "teste😂testado😂testadamente"
    let emoji = interaction.options.getString("emoji")

    if (!emoji) // Não informou um emoji
        return client.tls.reply(interaction, user, "dive.counter.sem_emoji", true, 5)

    // Emoji customizado
    if (emoji.startsWith("<") && emoji.endsWith(">")) {
        const id = emoji.match(/\d{15,}/g)[0]

        emoji = client.emoji(id)

        return interaction.reply({
            content: texto_entrada.replaceAll(" ", emoji),
            flags: client.decider(user?.conf.ghost_mode || user_command, 0) ? "Ephemeral" : null
        })
    }

    // Emoji padrão do discord
    interaction.reply({
        content: texto_entrada.replaceAll(" ", emoji),
        flags: client.decider(user?.conf.ghost_mode || user_command, 0) ? "Ephemeral" : null
    })
}