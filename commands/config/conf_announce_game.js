const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

const { createGame, verifyInvalidGames } = require('../../core/database/schemas/Game')

const dispara_anuncio = require('../../core/auto/send_announcement')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("c_anunciar")
        .setDescription("⌠🤖⌡ Anúnciar games/dlcs free")
        .addStringOption(option =>
            option.setName("nome")
                .setDescription("O nome do conteúdo")
                .setRequired(true))
        .addNumberOption(option =>
            option.setName("preço")
                .setDescription("O preço do conteúdo")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("expiração")
                .setDescription("A data limite da promoção")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("horario")
                .setDescription("O horário limite da promoção")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("link")
                .setDescription("O link do conteúdo")
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName("imagem")
                .setDescription("A imagem que será exibida"))
        .addStringOption(option =>
            option.setName("tipo")
                .setDescription("O tipo do conteudo")
                .addChoices(
                    { name: 'Jogo', value: 'jogo' },
                    { name: 'DLC/Expansão', value: 'dlc' },
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.Administrator),
    async execute({ client, user, interaction }) {

        if (interaction.user.id !== client.x.owners[0])
            return client.tls.reply(interaction, user, "inic.error.comando_restrito", true, 18)

        // Verificando pelos games que já expiraram
        await verifyInvalidGames(client)
        await interaction.deferReply({ ephemeral: true })

        const item = {
            name: interaction.options.getString("nome"),
            type: interaction.options.getString("tipo"),
            link: interaction.options.getString("link"),
            price: interaction.options.getNumber("preço"),
            expire: client.timestamp(interaction.options.getString("expiração"), interaction.options.getString("horario")),
            thumbnail: interaction.options.getAttachment("imagem")
        }

        if (item.thumbnail)
            item.thumbnail = item.thumbnail.attachment

        if (!item.tipo)
            item.type = "game"

        const objetos_anunciados = [item]
        await createGame(client, item)

        dispara_anuncio({ client, interaction, objetos_anunciados })
    }
}