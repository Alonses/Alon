const { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("steam")
        .setDescription("⌠👤⌡ Someone's Steam Profile")
        .setDescriptionLocalizations({
            "de": '⌠👤⌡ Jemandes Steam-Profil',
            "es-ES": '⌠👤⌡ Perfil de alguien en Steam',
            "fr": '⌠👤⌡ Profil Steam de quelqu\'un',
            "it": '⌠👤⌡ Profilo Steam di qualcuno',
            "pt-BR": '⌠👤⌡ Perfil de alguém na Steam',
            "ru": '⌠👤⌡ Посмотреть чей-то профиль на Steam'
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
        .setName("Steam")
        .setType(ApplicationCommandType.User),
    async execute({ client, interaction }) {

        // Redirecionando o evento
        await require("../../core/formatters/chunks/model_steam")({client, interaction})
    },
    async menu({ client, interaction }) {

        // Redirecionando o evento
        await require("../../core/formatters/chunks/model_steam")({client, interaction})
    }
}