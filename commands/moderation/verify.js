const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("verify")
        .setDescription("⌠💂⌡ Check a user's history")
        .addSubcommand(subcommand =>
            subcommand.setName("user")
                .setDescription("⌠💂⌡ Check a user's history")
                .setDescriptionLocalizations({
                    "de": '⌠💂⌡ Überprüfen Sie den Verlauf eines Benutzers',
                    "es-ES": '⌠💂⌡ Consultar el historial de un usuario',
                    "fr": '⌠💂⌡ Vérifier l\'historique d\'un utilisateur',
                    "it": '⌠💂⌡ Controlla la cronologia di un utente',
                    "pt-BR": '⌠💂⌡ Verificar histórico de um usuário',
                    "ru": '⌠💂⌡ Проверить историю пользователя'
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
                        })
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName("guild")
                .setDescription("⌠💂⌡ View warned users on the server")
                .setDescriptionLocalizations({
                    "de": '⌠💂⌡ Zeigen Sie gewarnte Benutzer auf dem Server an',
                    "es-ES": '⌠💂⌡ Ver usuarios advertidos en el servidor',
                    "fr": '⌠💂⌡ Afficher les utilisateurs avertis sur le serveur',
                    "it": '⌠💂⌡ Visualizza gli utenti avvisati sul server',
                    "pt-BR": '⌠💂⌡ Ver usuários advertidos no servidor',
                    "ru": '⌠💂⌡ Просмотр предупрежденных пользователей на сервере'
                }))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute({ client, interaction }) {

        // Solicitando a função e executando
        require(`./subcommands/verify_${interaction.options.getSubcommand()}`)({ client, interaction })
    }
}