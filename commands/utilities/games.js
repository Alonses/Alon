const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("games")
        .setNameLocalizations({
            "de": 'spiele',
            "es-ES": 'juegos',
            "fr": 'jeux',
            "it": 'giochi',
            "ru": 'игры'
        })
        .setDescription("⌠💡⌡ The free game(s) of the moment")
        .setDescriptionLocalizations({
            "de": '⌠💡⌡ Die neuesten kostenlosen Spiele',
            "es-ES": '⌠💡⌡ El(los) juego(s) gratuito(s) del momento',
            "fr": '⌠💡⌡ Le(s) jeu(x) gratuit(s) du moment',
            "it": '⌠💡⌡ Il/i gioco/i gratuito/i del momento',
            "pt-BR": '⌠💡⌡ O(s) jogo(s) gratuito(s) do momento',
            "ru": '⌠💡⌡ Текущие бесплатные игры'
        }),
    async execute({ client, interaction }) {

        // Redirecionando o evento
        await require('../../core/formatters/chunks/model_free_games')(client, interaction)
    }
}