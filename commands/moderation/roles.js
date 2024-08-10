const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("role")
        .setNameLocalizations({
            "de": 'rolle',
            "es-ES": 'rol',
            "it": 'roule',
            "pt-BR": 'cargo',
            "ru": 'роль'
        })
        .setDescription("⌠💂⌡ Conceda cargos para membros do servidor")
        .addSubcommand(subcommand =>
            subcommand.setName("global")
                .setDescription("⌠💂⌡ Conceda cargos para membros do servidor"))
        .addSubcommand(subcommand =>
            subcommand.setName("join")
                .setNameLocalizations({
                    "pt-BR": 'entrada'
                })
                .setDescription("⌠💂⌡ Conceda cargos para membros que entrarem no servidor"))
        .addSubcommand(subcommand =>
            subcommand.setName("timed")
                .setNameLocalizations({
                    "pt-BR": 'temporario'
                })
                .setDescription("⌠💂⌡ Grant a temporary role to a member")
                .setDescriptionLocalizations({
                    "pt-BR": '⌠💂⌡ Conceda um cargo temporário a um membro'
                })
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("The user who will receive")
                        .setDescriptionLocalizations({
                            "de": 'Der Zielbenutzer',
                            "es-ES": 'El usuario que recibirá',
                            "fr": 'L\'utilisateur qui recevra',
                            "it": 'L\'utente che riceverà',
                            "pt-BR": 'O usuário que receberá',
                            "ru": 'Пользователь, который получит'
                        })
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName("role")
                        .setNameLocalizations({
                            "de": 'rolle',
                            "es-ES": 'rol',
                            "it": 'roule',
                            "pt-BR": 'cargo',
                            "ru": 'роль'
                        })
                        .setDescription("The role that will be granted")
                        .setDescriptionLocalizations({
                            "pt-BR": 'O cargo que será concedido'
                        })
                        .setRequired(true))
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
                        .setDescription("Reason for granting this role")
                        .setDescriptionLocalizations({
                            "pt-BR": 'Motivo pela concessão deste cargo'
                        })))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers | PermissionFlagsBits.ManageRoles),
    async execute({ client, interaction }) {

        // Redirecionando o evento
        require(`./subcommands/roles_${interaction.options.getSubcommand()}`)({ client, interaction })
    }
}