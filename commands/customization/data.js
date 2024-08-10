const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("data")
        .setDescription("⌠👤⌡ Everything we know about you")
        .setDescriptionLocalizations({
            "de": '⌠👤⌡ Alles, was wir über dich wissen',
            "es-ES": '⌠👤⌡ Todo lo que sabemos de ti',
            "fr": '⌠👤⌡ Tout ce que l\'on sait sur vous',
            "it": '⌠👤⌡ Tutto quello che sappiamo di te',
            "pt-BR": '⌠👤⌡ Tudo o que sabemos sobre você',
            "ru": '⌠👤⌡ Все, что мы знаем о тебе'
        }),
    async execute({ client, interaction }) {

        // Redirecionando o usuário para o painel com as opções de data
        await require("../../core/interactions/chunks/panel_personal_data")({client, interaction})
    }
}