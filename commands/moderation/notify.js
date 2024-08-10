const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("notify")
        .setNameLocalizations({
            "de": 'benachrichtigen',
            "es-ES": 'notificar',
            "fr": 'notifier',
            "it": 'notificare',
            "pt-BR": 'notificar',
            "ru": 'уведомление'
        })
        .setDescription("⌠💂⌡ Set up free game ads")
        .addSubcommand(subcommand =>
            subcommand.setName("config")
                .setDescription("⌠💂⌡ Configure free games ad")
                .setDescriptionLocalizations({
                    "de": '⌠💂⌡ Konfigurieren Sie die Anzeige für kostenlose Spiele',
                    "es-ES": '⌠💂⌡ Configurar anuncios de juegos gratis',
                    "fr": '⌠💂⌡ Configurer des annonces de jeux gratuites',
                    "it": '⌠💂⌡ Imposta annunci di giochi gratuiti',
                    "pt-BR": '⌠💂⌡ Configurar o anúncio de games free',
                    "ru": '⌠💂⌡ Настроить рекламу бесплатных игр'
                })
                .addRoleOption(option =>
                    option.setName("role")
                        .setNameLocalizations({
                            "de": 'rolle',
                            "es-ES": 'rol',
                            "it": 'roule',
                            "pt-BR": 'cargo',
                            "ru": 'роль'
                        })
                        .setDescription("The role that will be notified")
                        .setDescriptionLocalizations({
                            "de": 'Die Rolle, die benachrichtigt wird',
                            "es-ES": 'El rol a ser notificado',
                            "fr": 'Le role qui sera notifié',
                            "it": 'La roule da notificare',
                            "pt-BR": 'O cargo que será notificado',
                            "ru": 'Роль, которую нужно уведомить'
                        })
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName("channel")
                        .setNameLocalizations({
                            "de": 'kanal',
                            "es-ES": 'canal',
                            "fr": 'salon',
                            "it": 'canale',
                            "pt-BR": 'canal',
                            "ru": 'канал'
                        })
                        .setDescription("The channel that will be used")
                        .setDescriptionLocalizations({
                            "de": 'Der zu verwendende Kanal',
                            "es-ES": 'El canal que se utilizará',
                            "fr": 'Le canal qui sera utilisé',
                            "it": 'Il canale che verrà utilizzato',
                            "pt-BR": 'O canal que será usado',
                            "ru": 'Канал, который будет использоваться'
                        })
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName("language")
                        .setNameLocalizations({
                            "de": 'sprache',
                            "es-ES": 'idioma',
                            "fr": 'langue',
                            "it": 'linguaggio',
                            "pt-BR": 'idioma',
                            "ru": 'язык'
                        })
                        .setDescription("The language to be used")
                        .setDescriptionLocalizations({
                            "de": 'Die zu verwendende Sprache',
                            "es-ES": 'El lenguaje a utilizar',
                            "fr": 'La langue à utiliser',
                            "it": 'La lingua da usare',
                            "pt-BR": 'O idioma que será utilizado',
                            "ru": 'Язык, который будет использоваться'
                        })
                        .addChoices(
                            { name: '🏴 Alonsês', value: 'al-br' },
                            { name: '🇩🇪 Deutsch', value: 'de-de' },
                            { name: '🇺🇸 English', value: 'en-us' },
                            { name: '🇪🇸 Español', value: 'es-es' },
                            { name: '🇫🇷 Français', value: 'fr-fr' },
                            { name: '🇮🇹 Italiano', value: 'it-it' },
                            { name: '🇧🇷 Português', value: 'pt-br' },
                            { name: '🇷🇺 Русский', value: 'ru-ru' }
                        )
                ))
        .addSubcommand(subcommand =>
            subcommand.setName("now")
                .setNameLocalizations({
                    "de": 'jetzt',
                    "es-ES": 'ahora',
                    "fr": 'maintenant',
                    "it": 'ora',
                    "pt-BR": 'agora',
                    "ru": 'сейчас'
                })
                .setDescription("⌠💂⌡ Announce currently active promotions")
                .setDescriptionLocalizations({
                    "de": '⌠💂⌡ Reichen Sie derzeit aktive Werbeaktionen ein',
                    "es-ES": '⌠💂⌡ Anunciar las promociones actualmente activas',
                    "fr": '⌠💂⌡ Annoncez les promotions actuellement actives',
                    "it": '⌠💂⌡ Annunciare le promozioni attualmente attive',
                    "pt-BR": '⌠💂⌡ Anunciar promoções ativas no momento',
                    "ru": '⌠💂⌡ Объявить об активных акциях'
                }))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute({ client, interaction }) {

        // Solicitando a função e executando
        require(`./subcommands/notify_${interaction.options.getSubcommand()}`)({ client, interaction })
    }
}