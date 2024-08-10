const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gta")
        .setDescription("⌠🎲⌡ GTA Online information")
        .setDescriptionLocalizations({
            "de": '⌠🎲⌡ GTA Online-Infos',
            "es-ES": '⌠🎲⌡ Información de GTA Online',
            "fr": '⌠🎲⌡ Informations sur GTA Online',
            "it": '⌠🎲⌡ Informazioni su GTA Online',
            "pt-BR": '⌠🎲⌡ Informações do GTA Online',
            "ru": '⌠🎲⌡ ГТА Онлайн информация'
        }),
    async execute({ client, interaction }) {

        // Redirecionando o evento
        await require('../../core/interactions/chunks/gta_resume')({client, interaction})
    }
}