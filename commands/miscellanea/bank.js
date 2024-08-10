const { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bank")
        .setNameLocalizations({
            "es-ES": 'banco',
            "fr": 'banque',
            "it": 'banca',
            "pt-BR": 'banco',
            "ru": 'банк'
        })
        .setDescription("⌠💸⌡ See your Bufunfas")
        .setDescriptionLocalizations({
            "de": '⌠💸⌡ Überprüfen Sie Ihre Bufunfas',
            "es-ES": '⌠💸⌡ Mira a tus Bufunfas',
            "fr": '⌠💸⌡ Voir vos Bufunfas',
            "it": '⌠💸⌡ Visualizza il tuo Bufunfa',
            "pt-BR": '⌠💸⌡ Veja suas Bufunfas',
            "ru": '⌠💸⌡ посмотреть свой Bufunfa'
        })
        .addUserOption(option =>
            option.setName("user")
                .setNameLocalizations({
                    "de": 'benutzer',
                    "es-ES": 'usuario',
                    "it": 'utente',
                    "pt-BR": 'usuario',
                    "ru": 'пользователь'
                })
                .setDescription("View another user\'s bank")
                .setDescriptionLocalizations({
                    "de": 'Überprüfen Sie die Bank eines anderen Benutzers',
                    "es-ES": 'Ver el banco de otro usuario',
                    "fr": 'Afficher la banque d\'un autre utilisateur',
                    "it": 'Visualizza la banca di un altro utente',
                    "pt-BR": 'Visualizar o banco de outro usuário',
                    "ru": 'Просмотр банка другого пользователя'
                })),
    menu_data: new ContextMenuCommandBuilder()
        .setName("Bank")
        .setNameLocalizations({
            "es-ES": 'Banco',
            "fr": 'Banque',
            "it": 'Banca',
            "pt-BR": 'Banco',
            "ru": 'банк'
        })
        .setType(ApplicationCommandType.User),
    async execute({ client, interaction }) {

        // Redirecionando o evento
        await require(`./subcommands/bank_statement`)({client, interaction})
    },
    async menu({ client, interaction }) {

        // Redirecionando o evento
        await require("./subcommands/bank_statement")({client, interaction})
    }
}