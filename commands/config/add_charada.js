const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js')

const { createCharada } = require('../../core/database/schemas/Charadas')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("c_charada")
        .setDescription("⌠🤖⌡ Adiciona uma charada")
        .addStringOption(option =>
            option.setName("pergunta")
                .setDescription("A pergunta da charada")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("resposta")
                .setDescription("A resposta da charada")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.Administrator),
    async execute({ client, user, interaction }) {

        if (!client.x.owners.includes(interaction.user.id)) return

        const question = interaction.options.getString("pergunta")
        const answer = await interaction.options.getString("resposta")

        await createCharada(client, {question, answer})

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Charada adicionada com sucesso")
                    .setDescription(`${question}\n${answer}`)],
            ephemeral: true
        })
    }
}