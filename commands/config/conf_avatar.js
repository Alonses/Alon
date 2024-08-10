const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("c_avatar")
        .setDescription("⌠🤖⌡ Alterar o avatar do Alonsal")
        .addAttachmentOption(option =>
            option.setName("foto")
                .setDescription("A nova foto de perfil do bot")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.Administrator),
    async execute({ client, interaction }) {

        if (!client.x.owners.includes(interaction.user.id)) return

        let arquivo = interaction.options.getAttachment("foto")

        if (!arquivo.contentType.includes("image/"))
            return interaction.reply(":octagonal_sign: | Envie um arquivo de imagem!")

        const embed = new EmbedBuilder()
            .setTitle(`:bust_in_silhouette: O Avatar do ${client.username()} foi alterado`)
            .setColor(0x29BB8E)
            .setImage(arquivo.attachment)
            .setDescription(`**Alterado por** ( \`${interaction.user.username}\` | \`${interaction.user.id}\` )`)

        await client.user().setAvatar(arquivo.attachment)

        interaction.reply({
            content: ":bust_in_silhouette: | Avatar enceirado atualizado",
            ephemeral: true
        })

        client.notify(process.env.channel_feeds, { embeds: [embed] })
    }
}