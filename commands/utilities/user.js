const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("user")
        .setDescription("⌠💡⌡ View user details")
        .addSubcommand(subcommand =>
            subcommand
                .setName("avatar")
                .setDescription("⌠💡⌡ The user's avatar")
                .setDescriptionLocalizations({
                    "de": '⌠💡⌡ Benutzer-Avatar',
                    "es-ES": '⌠💡⌡ El avatar de usuario',
                    "fr": '⌠💡⌡ L\'avatar de l\'utilisateur',
                    "it": '⌠💡⌡ L\'utente avatar',
                    "pt-BR": '⌠💡⌡ O Avatar do usuário',
                    "ru": '⌠💡⌡ Аватар пользователя'
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
                        .setDescription("Mention a user")
                        .setDescriptionLocalizations({
                            "de": 'einen Benutzer erwähnen',
                            "es-ES": 'Mencionar a otro usuario',
                            "fr": 'Mentionner un utilisateur',
                            "it": 'Menziona un altro utente',
                            "pt-BR": 'Mencione outro usuário',
                            "ru": 'Упомянуть другого пользователя'
                        })))
        .addSubcommand(subcommand =>
            subcommand
                .setName("info")
                .setDescription("⌠💡⌡ User Information")
                .setDescriptionLocalizations({
                    "pt-BR": '⌠💡⌡ Informações do usuário',
                    "es-ES": '⌠💡⌡ Información del usuario',
                    "fr": '⌠💡⌡ Informations utilisateur',
                    "it": '⌠💡⌡ Informazioni sull\'utente',
                    "ru": '⌠💡⌡ Информация о пользователе'
                })
                .addUserOption(option =>
                    option.setName("user")
                        .setNameLocalizations({
                            "pt-BR": 'usuario',
                            "es-ES": 'usuario',
                            "it": 'utente',
                            "ru": 'пользователь'
                        })
                        .setDescription("Mention a user")
                        .setDescriptionLocalizations({
                            "es-ES": 'Mencionar a otro usuario',
                            "fr": 'Mentionner un utilisateur',
                            "it": 'Menziona un altro utente',
                            "pt-BR": 'Mencione outro usuário',
                            "ru": 'Упомянуть другого пользователя'
                        })))
        .addSubcommand(subcommand =>
            subcommand
                .setName("banner")
                .setDescription("⌠💡⌡ The user's banner")
                .setDescriptionLocalizations({
                    "pt-BR": '⌠💡⌡ Banner do usuário',
                    "es-ES": '⌠💡⌡ Banner de usuario',
                    "fr": '⌠💡⌡ Bannière utilisateur',
                    "it": '⌠💡⌡ Bandiera dell\'utente',
                    "ru": '⌠💡⌡ пользовательский баннер'
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
                        .setDescription("Mention a user")
                        .setDescriptionLocalizations({
                            "de": 'Erwähnen Sie einen anderen Benutzer',
                            "es-ES": 'Mencionar a otro usuario',
                            "fr": 'Mentionner un utilisateur',
                            "it": 'Menziona un altro utente',
                            "pt-BR": 'Mencione outro usuário',
                            "ru": 'Упомянуть другого пользователя'
                        }))),
    async execute({ client, interaction }) {

        // Solicitando a função e executando
        require(`./subcommands/user_${interaction.options.getSubcommand()}`)({ client, interaction })
    }
}