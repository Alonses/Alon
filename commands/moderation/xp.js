const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, InteractionContextType } = require('discord.js')

const { getUserRankServer } = require('../../core/database/schemas/User_rank_guild')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("xp")
        .setDescription("⌠💂⌡ Adjust some user's XP")
        .setDescriptionLocalizations({
            "de": '⌠💂⌡ Passen Sie die XP eines Benutzers an',
            "es-ES": '⌠💂⌡ Ajustar la XP de algunos usuarios',
            "fr": '⌠💂⌡ Ajustez XP pour certains utilisateurs',
            "it": '⌠💂⌡ Regola gli XP di un altro utente',
            "pt-BR": '⌠💂⌡ Ajuste o XP de algum usuário',
            "ru": '⌠💂⌡ Настройка опыта некоторых пользователей'
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
                .setDescription("The user to adjust")
                .setDescriptionLocalizations({
                    "de": 'Der zu definierende Benutzer',
                    "es-ES": 'El usuario para ajustar',
                    "fr": 'Utilisateur cible',
                    "it": 'L\'utente da aggiornare',
                    "pt-BR": 'O usuário a ser ajustado',
                    "ru": 'Пользователь для установки'
                })
                .setRequired(true))
        .addNumberOption(option =>
            option.setName("xp")
                .setDescription("What is the new XP?")
                .setDescriptionLocalizations({
                    "de": 'Was ist das neue XP?',
                    "es-ES": '¿Qué es el nuevo XP?',
                    "fr": 'Qu\'est-ce que le nouvel XP?',
                    "it": 'Qual è il nuovo XP?',
                    "pt-BR": 'Qual o novo XP?',
                    "ru": 'Что такое новый XP?'
                })
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageChannels | PermissionFlagsBits.Administrator)
        .setContexts(InteractionContextType.Guild),
    async execute({ client, user, interaction }) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild) && interaction.user.id !== client.x.owners[0])
            return client.tls.reply(interaction, user, "mode.xp.permissao", true, 3)

        // Coletando os dados do usuário informado no servidor
        const alvo = interaction.options.getUser("user")
        const user_c = await getUserRankServer(client.encrypt(alvo.id), client.encrypt(interaction.guild.id))

        // Validando se o usuário tem o ranking habilitado
        if (!await client.verifyUserRanking(alvo.id))
            return client.tls.reply(interaction, user, "mode.ranking.error", true, 5)

        user_c.nickname = client.encrypt(alvo.username)
        let novo_exp = parseFloat(interaction.options.get('xp').value)

        user_c.xp = parseFloat(novo_exp)
        novo_nivel = parseFloat(novo_exp / 1000)

        await user_c.save()

        client.tls.reply(interaction, user, "mode.xp.sucesso", true, 17, [user_c.nickname, novo_exp.toFixed(2), novo_nivel.toFixed(2)])
    }
}