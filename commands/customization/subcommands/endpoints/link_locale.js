module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id)
    await interaction.deferReply({ ephemeral: true })

    const locale = interaction.options.getString("value")

    // Verificando se o local existe antes de salvar
    await fetch(`${process.env.url_weather}appid=${process.env.key_weather}&q=${locale}&units=metric&lang=pt`)
        .then(response => response.json())
        .then(async res => {

            if (res.cod === '404')
                return interaction.editReply({
                    content: client.tls.phrase(user, "util.tempo.sem_local", 1),
                    ephemeral: true
                })

            await client.prisma.userOptionsMisc.update({
                where: { id: user.misc_id },
                data: { locale: locale }
            })

            interaction.editReply({
                content: client.tls.phrase(user, "util.tempo.new_link", client.emoji("emojis_dancantes"), locale),
                ephemeral: true
            })
        })
}