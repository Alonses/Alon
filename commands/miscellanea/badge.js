const { SlashCommandBuilder } = require('discord.js')

const { atualiza_fixed_badges } = require('../../core/auto/triggers/user_fixed_badges')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("badge")
        .setDescription("⌠👤⌡ Manage your badges")
        .setDescriptionLocalizations({
            "de": '⌠👤⌡ Verwalten Sie Ihre Abzeichen',
            "es-ES": '⌠👤⌡ Gestiona tus insignias',
            "fr": '⌠👤⌡ Gérez vos badges',
            "it": '⌠👤⌡ Gestisci i tuoi badge',
            "pt-BR": '⌠👤⌡ Gerencie suas badges',
            "ru": '⌠👤⌡ Управляйте своими значками'
        })
        .addStringOption(option =>
            option.setName("operation")
                .setNameLocalizations({
                    "de": 'betrieb',
                    "es-ES": 'operacion',
                    "fr": 'operation',
                    "it": 'operazione',
                    "pt-BR": 'operacao',
                    "ru": 'операция'
                })
                .setDescription("Select an operation")
                .setDescriptionLocalizations({
                    "de": 'Wählen Sie einen Vorgang aus',
                    "es-ES": 'Seleccione una operación',
                    "fr": 'Sélectionnez une opération',
                    "it": 'Seleziona un\'operazione',
                    "pt-BR": 'Escolha uma operação',
                    "ru": 'Выберите операцию'
                })
                .addChoices(
                    { name: '🔖 Fix', value: 'fix' },
                    { name: '❌ Remove', value: 'remove' }
                )
                .setRequired(true)),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id)
        const badges = await client.getUserBadges(interaction.user.id)

        // Validando se o usuário possui badges
        if (badges.length < 1)
            return client.tls.reply(interaction, user, "dive.badges.error_1", true, 1)

        let all_badges = []

        badges.forEach(valor => {
            all_badges.push(valor.badge)
        })

        const data = {
            title: { tls: "dive.badges.escolha_uma" },
            pattern: "badges",
            alvo: "badges",
            values: all_badges
        }

        if (interaction.options.getString("operation") === "fix") // Menu seletor de Badges
            return interaction.reply({
                content: client.tls.phrase(user, "dive.badges.cabecalho_menu"),
                components: [client.create_menus({ client, interaction, user, data })],
                ephemeral: true
            })

        // Removendo a badge fixada
        await client.prisma.userOptionsMisc.update({
            where: { id: user.misc_id },
            data: { fixed_badge: null }
        })

        // Atualizando a lista de badges fixas em cache
        await atualiza_fixed_badges(client)

        interaction.reply({
            content: `:medal: | Badge ${client.tls.phrase(user, "dive.badges.badge_removida")}`,
            ephemeral: true
        })
    }
}