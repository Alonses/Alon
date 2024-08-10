module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id)
    await client.prisma.userOptionsProfile.update({
        where: { id: user.profile_id },
        data: { cache_about: interaction.options.getString("description") }
    })

    // Enviando o embed para validação
    const id_alvo = interaction.user.id, operador = 0
    const embed = await client.create_profile({ interaction, user, id_alvo, operador })

    // Exibindo a descrição temporária enviada pelo usuário
    embed.setDescription(user.profile.cache.about)

    // Criando os botões para a cor customizada
    const row = client.create_buttons([
        { id: "user_profile_about", name: client.tls.phrase(user, "menu.botoes.confirmar"), type: 2, emoji: client.emoji(10), data: "1" },
        { id: "user_profile_about", name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 3, emoji: client.emoji(0), data: "0" }
    ], interaction)

    client.reply(interaction, {
        embeds: [embed],
        components: [row],
        ephemeral: true
    })
}