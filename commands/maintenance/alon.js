const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("alonsal")
        .setDescription("⌠📡⌡ Alonsal information")
        .setDescriptionLocalizations({
            "de": '⌠📡⌡ Alonsal-Informationen',
            "es-ES": '⌠📡⌡ Información Alonsal',
            "fr": '⌠📡⌡ Informations sur le Alonsal',
            "it": '⌠📡⌡ Informazioni Alonsal',
            "pt-BR": '⌠📡⌡ Informações do Alonsal',
            "ru": '⌠📡⌡ Информация от Алонсал'
        }),
    async execute({ client, interaction }) {

        // Redirecionando o evento
        const caso = 0
        await require('../../core/interactions/chunks/browse_info')({client, interaction, caso})
    }
}