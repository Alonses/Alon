const { SlashCommandBuilder } = require('discord.js')

const create_menus = require('../../adm/discord/create_menus.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("badge")
        .setDescription("⌠👤⌡ (Un)pin your badges!")
        .setDescriptionLocalizations({
            "pt-BR": '⌠👤⌡ (Des)Fixe suas badges!',
            "es-ES": '⌠👤⌡ (Un)pin sus insignias!',
            "fr": '⌠👤⌡ (Dé)épinglez vos badges!',
            "it": '⌠👤⌡ (Un)appunta i tuoi badge!',
            "ru": '⌠👤⌡ (Не) носить значки!'
        })
        .addSubcommand(subcommand =>
            subcommand.setName("fix")
                .setNameLocalizations({
                    "pt-BR": 'fixar',
                    "es-ES": 'etiquetar',
                    "fr": 'epingler',
                    "it": 'evidenziare',
                    "ru": 'носить'
                })
                .setDescription("⌠👤⌡ Pin a badge to your profile")
                .setDescriptionLocalizations({
                    "pt-BR": '⌠👤⌡ Fixe uma badge ao seu perfil',
                    "es-ES": '⌠👤⌡ Pon una insignia en tu perfil',
                    "fr": '⌠👤⌡ Épinglez un badge sur votre profil',
                    "it": '⌠👤⌡ Evidenzia un badge sul tuo profilo',
                    "ru": '⌠👤⌡ Добавьте значок в свой профиль'
                }))
        .addSubcommand(subcommand =>
            subcommand.setName("remove")
                .setNameLocalizations({
                    "pt-BR": 'remover',
                    "es-ES": 'retirar',
                    "fr": 'retirer',
                    "it": 'rimuovere',
                    "ru": 'удалять'
                })
                .setDescription("⌠👤⌡ Remove pinned badge")
                .setDescriptionLocalizations({
                    "pt-BR": '⌠👤⌡ Remover a badge do fixado',
                    "es-ES": '⌠👤⌡ Quita la insignia',
                    "fr": '⌠👤⌡ Supprimer le badge de l\'épinglé',
                    "it": '⌠👤⌡ Rimuovi il badge da appuntato',
                    "ru": '⌠👤⌡ Удалить значок профиля'
                })),
    async execute(client, user, interaction) {

        return client.tls.reply(user, "inic.error.develop", true, 5)

        // Validando existência de badges antes do comando
        if (user.badges.badge_list.length <= 0)
            return interaction.reply({ content: `:mag: | ${client.tls.phrase(user, "dive.badges.error_1")}`, ephemeral: true })

        let all_badges = []
        const badge_list = user.badges.badge_list

        badge_list.forEach(valor => {
            all_badges.push(parseInt(Object.keys(valor)[0]))
        })

        if (interaction.options.getSubcommand() === "fix") // Menu seletor de Badges
            return interaction.reply({ content: client.tls.phrase(user, "dive.badges.cabecalho_menu"), components: [create_menus(client, all_badges, interaction)], ephemeral: true })
        else {
            user.updateOne({ uid: id },
                {
                    badges: {
                        fixed_badge: null,
                        badge_list: badge_list
                    }
                })
        }

        // Removendo a badge fixada
        interaction.reply({ content: `:medal: | Badge ${client.tls.phrase(user, "dive.badges.badge_removida")}`, ephemeral: true })
    }
}