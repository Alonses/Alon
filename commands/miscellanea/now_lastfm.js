const { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("now")
        .setNameLocalizations({
            "de": 'jetzt',
            "es-ES": 'ahora',
            "fr": 'maintenant',
            "it": 'ora',
            "pt-BR": 'agora',
            "ru": 'сейчас'
        })
        .setDescription("⌠👤⌡ See what a user is listening to right now")
        .setDescriptionLocalizations({
            "de": '⌠👤⌡ Sehen Sie, was ein Benutzer gerade hört',
            "es-ES": '⌠👤⌡ Ver lo que un usuario está escuchando en este momento',
            "fr": '⌠👤⌡ Découvrez ce qu\'un utilisateur écoute en ce moment',
            "it": '⌠👤⌡ Scopri cosa sta ascoltando un utente in questo momento',
            "pt-BR": '⌠👤⌡ Veja o que um usuário está ouvindo agora',
            "ru": '⌠👤⌡ Узнайте, что сейчас слушает пользователь'
        })
        .addStringOption(option =>
            option.setName("url")
                .setDescription("The username")
                .setDescriptionLocalizations({
                    "de": 'Der Nutzername',
                    "es-ES": 'El nombre de usuario',
                    "fr": 'Nom de profil',
                    "it": 'il nome utente',
                    "pt-BR": 'O nome do usuário',
                    "ru": 'Имя пользователя'
                }))
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Mention a user")
                .setDescriptionLocalizations({
                    "de": 'einen Benutzer erwähnen',
                    "es-ES": 'Mencionar a otro usuario',
                    "fr": 'Mentionner un utilisateur',
                    "it": 'Menziona un altro utente',
                    "pt-BR": 'Mencione outro usuário',
                    "ru": 'Упомянуть другого пользователя'
                })),
    menu_data: new ContextMenuCommandBuilder()
        .setName("Listening Now")
        .setNameLocalizations({
            "de": 'Aktuelle Musik ansehen',
            "es-ES": 'Escuchando ahora',
            "fr": 'Écouter maintenant',
            "it": 'Ascolto adesso',
            "pt-BR": "Ouvindo agora",
            "ru": 'Слушаю сейчас'
        })
        .setType(ApplicationCommandType.User),
    async execute({ client, interaction }) {

        // Redirecionando o evento
        await require("../../core/formatters/chunks/model_lastfm_now")({client, interaction})
    },
    async menu({ client, interaction }) {

        // Redirecionando o evento
        await require("../../core/formatters/chunks/model_lastfm_now")({client, interaction})
    }
}