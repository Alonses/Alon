module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id)

    await client.prisma.userOptionsSocial.update({
        where: { id: user.social_id },
        data: { pula_predios: interaction.options.getString("value") }
    })

    client.tls.reply(interaction, user, "util.lastfm.new_link", true, client.emoji("emojis_dancantes"), ["pula", "</pula:1023486895327555584>"])
}