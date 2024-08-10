const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("panel")
        .setNameLocalizations({
            "fr": 'panneau',
            "it": 'pannello',
            "pt-BR": 'painel',
            "ru": 'панель'
        })
        .setDescription("⌠👤⌡ Control my functions")
        .addSubcommand(subcommand =>
            subcommand
                .setName("personal")
                .setNameLocalizations({
                    "de": 'personliches',
                    "fr": 'personnel',
                    "it": 'personnel',
                    "pt-BR": 'pessoal',
                    "ru": 'личная'
                })
                .setDescription("⌠👤⌡ Control my functions")
                .setDescriptionLocalizations({
                    "de": '⌠👤⌡ Kontrolliere meine Ressourcen',
                    "es-ES": '⌠👤⌡ Controlar mis funciones',
                    "fr": '⌠👤⌡ Contrôler mes fonctions',
                    "it": '⌠👤⌡ Controllare le mie funzioni',
                    "pt-BR": '⌠👤⌡ Controle minhas funções',
                    "ru": '⌠👤⌡ контролировать мои функции'
                })
                .addStringOption(option =>
                    option.setName("function")
                        .setNameLocalizations({
                            "de": 'funktion',
                            "es-ES": 'funcion',
                            "fr": 'fonction',
                            "it": 'funzione',
                            "pt-BR": 'funcao',
                            "ru": 'функция'
                        })
                        .setDescription("A function to configure")
                        .setDescriptionLocalizations({
                            "de": 'Eine Funktion zum Konfigurieren',
                            "es-ES": 'Una función para configurar',
                            "fr": 'Une fonction à configurer',
                            "it": 'Una funzione da configurare',
                            "pt-BR": 'Uma função para configurar',
                            "ru": 'Функция для настройки'
                        })
                        .addChoices(
                            { name: '🧾 Your data', value: 'data' },
                            { name: '👻 Ghostmode', value: '0' },
                            { name: '🔔 DM notifications', value: '1' },
                            { name: '🏆 Ranking', value: '2' },
                            { name: '🕶 Public badges', value: '3' },
                            { name: '🌩 Weather summary', value: '4' },
                            { name: '🌐 Global tasks', value: '5' },
                            { name: '💬 Compact mode', value: '6' },
                            { name: '🌎 Cached Servers', value: '7' },
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName("guild")
                .setDescription("⌠💂⌡ Control my functions")
                .setDescriptionLocalizations({
                    "de": '⌠💂⌡ Kontrolliere meine Ressourcen',
                    "es-ES": '⌠💂⌡ Controlar mis funciones',
                    "fr": '⌠💂⌡ Contrôler mes fonctions',
                    "it": '⌠💂⌡ Controllare le mie funzioni',
                    "pt-BR": '⌠💂⌡ Controle minhas funções',
                    "ru": '⌠💂⌡ контролировать мои функции'
                })
                .addStringOption(option =>
                    option.setName("function")
                        .setNameLocalizations({
                            "de": 'funktion',
                            "es-ES": 'funcion',
                            "fr": 'fonction',
                            "it": 'funzione',
                            "pt-BR": 'funcao',
                            "ru": 'функция'
                        })
                        .setDescription("A function to configure")
                        .setDescriptionLocalizations({
                            "de": 'Eine Funktion zum Konfigurieren',
                            "es-ES": 'Una función para configurar',
                            "fr": 'Une fonction à configurer',
                            "it": 'Una funzione da configurare',
                            "pt-BR": 'Uma função para configurar',
                            "ru": 'Функция для настройки'
                        })
                        .addChoices(
                            { name: '🧾 Guild data', value: 'data' },
                            { name: '📜 Event log', value: 'logger' },
                            { name: '📜 Event log Configs', value: 'logger.1' },
                            { name: '💀 Death note', value: 'logger.2' },
                            { name: '🛑 Warns', value: 'warns' },
                            { name: '🛑 Warns Pings', value: 'warns.1' },
                            { name: '🛑 Warns Configs', value: 'warns.2' },
                            { name: '👑 Hierarchy Warns', value: 'hierarchy_warns.0' },
                            { name: '📛 Anti-Spam', value: 'anti_spam' },
                            { name: '📛 Anti-Spam Resources', value: 'anti_spam.1' },
                            { name: '📛 Anti-Spam Configs', value: 'anti_spam.2' },
                            { name: '📡 Network', value: 'network' },
                            { name: '📡 Network Configs', value: 'network.1' },
                            { name: '💂 External reports', value: 'external_reports' },
                            { name: '💂 External reports Configs', value: 'external_reports.2' },
                            { name: '🔨 AutoBan', value: 'external_reports.1' },
                            { name: '🎮 Free Games ad', value: 'free_games' },
                            { name: '⌚ Timed roles', value: 'timed_roles' },
                            { name: '💂 In-server reports', value: 'tickets' },
                            { name: '🔗 Tracked Invitations', value: 'tracked_invites' }
                        ))),
    async execute({ client, interaction }) {

        const operador = interaction.options.getString("function")
        require(`../../core/interactions/chunks/panel_${interaction.options.getSubcommand()}`)({ client, interaction, operador })
    }
}