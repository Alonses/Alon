const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("curiosidade")
        .setDescription("⌠😂|🇧🇷⌡ Uma curiosidade aleatória"),
    async execute({ client, interaction }) {
        await require('../../core/formatters/chunks/model_curiosidades')(client, interaction)
    }
}