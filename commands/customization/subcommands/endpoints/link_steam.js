module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, { social: true })
    await interaction.deferReply({ ephemeral: true })

    const steam = interaction.options.getString("value")

    // Verificando se o local existe antes de salvar
    await fetch(`https://steamcommunity.com/id/${steam}`)
        .then(response => response.text())
        .then(async res => {

            if (res.includes("The specified profile could not be found."))
                return interaction.editReply({
                    content: client.tls.phrase(user, "util.steam.nome_invalido", 1),
                    ephemeral: true
                })

            await client.prisma.userOptionsSocial.update({
                where: { id: user.social_id },
                data: { steam: steam }
            })

            interaction.editReply({
                content: client.tls.phrase(user, "util.lastfm.new_link", client.emoji("emojis_dancantes"), ["steam", "</steam:1018609879562334384>"]),
                ephemeral: true
            })
        })
}