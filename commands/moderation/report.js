const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("report")
        .setDescription("⌠💂⌡ Report users who cause problems")
        .addSubcommand(subcommand =>
            subcommand.setName("create")
                .setDescription("⌠💂⌡ Report users who cause problems")
                .setDescriptionLocalizations({
                    "de": '⌠💂⌡ Melden Sie Benutzer, die Probleme verursachen',
                    "es-ES": '⌠💂⌡ Reportar usuarios que crean problemas',
                    "fr": '⌠💂⌡ Signaler les utilisateurs qui créent des problèmes',
                    "it": '⌠💂⌡ Segnala gli utenti che creano problemi',
                    "pt-BR": '⌠💂⌡ Denuncie usuários que criam problemas',
                    "ru": '⌠💂⌡ Сообщайте о пользователях, которые создают проблемы'
                })
                .addStringOption(option =>
                    option.setName("reason")
                        .setNameLocalizations({
                            "de": 'grund',
                            "es-ES": 'razon',
                            "fr": 'raison',
                            "it": 'motivo',
                            "pt-BR": 'motivo',
                            "ru": 'причина'
                        })
                        .setDescription("Report what happened to this user")
                        .setDescriptionLocalizations({
                            "de": 'Melden Sie, was mit diesem Benutzer passiert ist',
                            "es-ES": 'Reportar lo que le pasó a este usuario',
                            "fr": 'Signaler ce qui est arrivé à cet utilisateur',
                            "it": 'Segnala cosa è successo a questo utente',
                            "pt-BR": 'Relate o que aconteceu com este usuário',
                            "ru": 'Сообщить о случившемся с этим пользователем'
                        })
                        .setRequired(true))
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
            subcommand.setName("remove")
                .setDescription("⌠💂⌡ Remove the report on a user")
                .setDescriptionLocalizations({
                    "de": '⌠💂⌡ Bericht über einen Benutzer entfernen',
                    "es-ES": '⌠💂⌡ Remove a denúncia sobre um usuário',
                    "fr": '⌠💂⌡ Supprimer une denúncia sobre um usuário',
                    "it": '⌠💂⌡ Rimuovi una denuncia su un utente',
                    "pt-BR": '⌠💂⌡ Remova a denúncia sobre um usuário',
                    "ru": '⌠💂⌡ Удалить жалобу от пользователя'
                }))
        .addSubcommand(subcommand =>
            subcommand.setName("migrate")
                .setDescription("⌠💂⌡ Migrate all banned users from server to Alonsal")
                .setDescriptionLocalizations({
                    "de": '⌠💂⌡ Migrieren Sie alle gesperrten Benutzer vom Server nach Alonsal',
                    "es-ES": '⌠💂⌡ Migrar todos los usuarios prohibidos del servidor a Alonsal',
                    "fr": '⌠💂⌡ Migrer tous les utilisateurs bannis du serveur vers l\'Alonsal',
                    "it": '⌠💂⌡ Migra tutti gli utenti bannati dal server ad Alonsal',
                    "pt-BR": '⌠💂⌡ Migre todos os usuários banidos do servidor para o Alonsal',
                    "ru": '⌠💂⌡ Перевести всех забаненных пользователей с сервера на Alonsal'
                })
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers),
    async execute({ client, interaction }) {

        // Redirecionando o evento
        require(`./subcommands/report_${interaction.options.getSubcommand()}`)({ client, interaction })
    }
}