module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id)
    await interaction.deferReply({ ephemeral: true })

    const lastfm = interaction.options.getString("value")

    // Verificando se o local existe antes de salvar
    await fetch(`https://www.last.fm/pt/user/${lastfm}`)
        .then(response => response.text())
        .then(async res => {

            if (res.includes("Página não encontrada"))
                return client.tls.editReply(interaction, user, "util.lastfm.error_1", true, 1)

            await client.prisma.userOptionsSocial.update({
                where: { id: user.social_id },
                data: { lastfm: lastfm }
            })

            interaction.editReply({
                content: client.tls.phrase(user, "util.lastfm.new_link", client.emoji("emojis_dancantes"), ["lastfm", "</lastfm:1018609879512006796>"]),
                ephemeral: true
            })
        })
}