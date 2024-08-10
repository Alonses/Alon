const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits } = require('discord.js')

const { getUserRankServer, updateUserRankGuild} = require('../../core/database/schemas/User_rank_guild')

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
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageChannels | PermissionFlagsBits.Administrator),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id)

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild) && interaction.user.id !== client.x.owners[0])
            return client.tls.reply(interaction, user, "mode.xp.permissao", true, 3)

        // Coletando os dados do usuário informado no servidor
        const alvo = interaction.options.getUser("user")
        const user_c = await getUserRankServer(client, alvo.id, interaction.guild.id)

        // Validando se o usuário tem o ranking habilitado
        if (!await client.verifyUserRanking(user_c.user_id))
            return client.tls.reply(interaction, user, "mode.ranking.error", true, 5)

        const novo_exp = parseFloat(interaction.options.get('xp').value)
        const novo_nivel = novo_exp / 1000

        await updateUserRankGuild(client, user_c, {
            nickname: alvo.username,
            xp: novo_exp
        })

        client.tls.reply(interaction, user, "mode.xp.sucesso", true, 17, [alvo.username, novo_exp.toFixed(2), novo_nivel.toFixed(2)])
    }
}