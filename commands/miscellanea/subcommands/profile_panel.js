module.exports = async ({ client, interaction }) => {

    // Enviando o embed para validação
    const id_alvo = interaction.user.id, operador = 0
    const user = await client.getUser(id_alvo, { profile: true })
    const embed = await client.create_profile({ interaction, user, id_alvo, operador })

    // Criando os botões para customizar o perfil
    let botoes = [{ id: "misc_profile_about", name: client.tls.phrase(user, "menu.botoes.customizar_informacoes"), type: 1, emoji: client.defaultEmoji("tools"), data: "1" }]

    // Botão para remover o "Sobre mim" caso o usuário tenha escrito algo
    if (user.profile.about)
        botoes = botoes.concat([{ id: "misc_profile_about", name: client.tls.phrase(user, "menu.botoes.remover_sobre"), type: 1, emoji: client.emoji(0), data: "0" }])

    client.reply(interaction, {
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction)],
        ephemeral: true
    })
}