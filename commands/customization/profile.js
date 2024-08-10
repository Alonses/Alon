const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("profile")
        .setNameLocalizations({
            "de": 'profil',
            "es-ES": 'perfil',
            "fr": 'profil',
            "it": 'profilo',
            "pt-BR": 'perfil',
            "ru": 'профиль',
        })
        .setDescription("⌠🎉⌡ Customize seu perfil!")
        .addSubcommand(subcommand =>
            subcommand
                .setName("about")
                .setNameLocalizations({
                    "es-ES": 'acerca',
                    "fr": 'propos',
                    "pt-BR": 'sobre'
                })
                .setDescription("⌠🎉⌡ Change your description on Alonsal")
                .setDescriptionLocalizations({
                    "de": '⌠🎉⌡Ändern Sie Ihre Beschreibung auf Alonsal',
                    "es-ES": '⌠🎉⌡ Cambia tu descripción en Alonsal',
                    "fr": '⌠🎉⌡ Modifiez votre description sur Alonsal',
                    "it": '⌠🎉⌡ Cambia la tua descrizione su Alonsal',
                    "pt-BR": '⌠🎉⌡ Altere sua descrição no Alonsal',
                    "ru": '⌠🎉⌡ Измените описание на Алонсале'
                })
                .addStringOption(option =>
                    option.setName("description")
                        .setNameLocalizations({
                            "de": 'beschreibung',
                            "es-ES": 'descripcion',
                            "it": 'descrizione',
                            "pt-BR": 'descricao',
                            "ru": 'описание'
                        })
                        .setDescription("What do you want to tell others?")
                        .setDescriptionLocalizations({
                            "de": 'Was möchtest du anderen mitteilen?',
                            "es-ES": '¿Qué quieres decirles a los demás?',
                            "fr": 'Que veux-tu dire aux autres?',
                            "it": 'Cosa vuoi dire agli altri?',
                            "pt-BR": 'O que deseja contar aos outros?',
                            "ru": 'Что вы хотите сказать другим?'
                        })
                        .setMaxLength(150)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName("link")
                .setDescription("⌠👤⌡ Connect your social networks to Alonsal")
                .setDescriptionLocalizations({
                    "de": '⌠👤⌡ Verbinden Sie Ihre sozialen Netzwerke mit Alonsal',
                    "es-ES": '⌠👤⌡ Conecta tus redes sociales a Alonsal',
                    "fr": '⌠👤⌡ Connectez vos réseaux sociaux à Alonsal',
                    "it": '⌠👤⌡ Collega i tuoi social network ad Alonsal',
                    "pt-BR": '⌠👤⌡ Conecte suas redes sociais ao Alonsal',
                    "ru": '⌠👤⌡ Подключите свои социальные сети к Алонсал'
                })
                .addStringOption(option =>
                    option.setName("platform")
                        .setNameLocalizations({
                            "de": 'plattform',
                            "es-ES": 'plataforma',
                            "fr": 'plate-forme',
                            "it": 'piattaforma',
                            "pt-BR": 'plataforma',
                            "ru": 'платформа'
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
                            { name: '🎮 Steam', value: 'steam' },
                            { name: '🎶 LastFM', value: 'lastfm' },
                            { name: '🗽 Locale', value: 'locale' },
                            { name: '🚀 Pula Prédios', value: 'pula' }
                        )
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName("value")
                        .setNameLocalizations({
                            "de": 'wert',
                            "es-ES": 'valor',
                            "fr": 'valeur',
                            "it": 'valore',
                            "pt-BR": 'valor',
                            "ru": 'ценить'
                        })
                        .setDescription("The entry value")
                        .setDescriptionLocalizations({
                            "de": 'der Eingabewert',
                            "es-ES": 'El valor de entrada',
                            "fr": 'La valeur d\'entrée',
                            "it": 'Il valore di entrata',
                            "pt-BR": 'O valor de entrada',
                            "ru": 'значение входа'
                        })
                        .setRequired(true))),
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName("panel")
    //         .setNameLocalizations({
    //             "pt-BR": 'painel',
    //         })
    //         .setDescription("⌠👤⌡ Set up your profile")
    //         .setDescriptionLocalizations({
    //             "pt-BR": '⌠👤⌡ Configure seu perfil'
    //         }))
    async execute({ client, interaction }) {

        // Navegando pelos módulos
        require(`./subcommands/profile_${interaction.options.getSubcommand()}`)({ client, interaction })
    }
}