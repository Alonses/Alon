const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("calculator")
        .setNameLocalizations({
            "de": 'taschenrechner',
            "es-ES": 'calculadora',
            "fr": 'calculatrice',
            "it": 'calcolatrice',
            "pt-BR": 'calculadora',
            "ru": 'калькулятор'
        })
        .setDescription("⌠💡⌡ Find math problem results")
        .addSubcommand(subcommand =>
            subcommand
                .setName("equation")
                .setNameLocalizations({
                    "de": 'gleichung',
                    "es-ES": 'ecuacion',
                    "fr": 'equation',
                    "it": 'equazione',
                    "pt-BR": 'equacao',
                    "ru": 'уравнение'
                })
                .setDescription("⌠💡⌡ Find math problem results")
                .setDescriptionLocalizations({
                    "de": '⌠💡⌡ Finden Sie Ergebnisse von mathematischen Problemen',
                    "es-ES": '⌠💡⌡ Encuentra los resultados de los problemas matemáticos',
                    "fr": '⌠💡⌡ Trouver les résultats des problèmes mathématiques',
                    "it": '⌠💡⌡ Trova i risultati dei problemi di matematica',
                    "pt-BR": '⌠💡⌡ Ache resultados de problemas matemáticos',
                    "ru": '⌠💡⌡ Найдите результаты математических задач'
                })
                .addStringOption(option =>
                    option.setName("equation")
                        .setNameLocalizations({
                            "de": 'gleichung',
                            "es-ES": 'ecuacion',
                            "fr": 'equation',
                            "it": 'equazione',
                            "pt-BR": 'equacao',
                            "ru": 'уравнение'
                        })
                        .setDescription("Write something!")
                        .setDescriptionLocalizations({
                            "de": 'Schreibe etwas!',
                            "es-ES": '¡Escribe algo!',
                            "fr": 'Écris quelque chose!',
                            "it": 'Scrivi qualcosa!',
                            "pt-BR": 'Escreva algo!',
                            "ru": 'Напиши что-нибудь!'
                        })
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("circle")
                .setNameLocalizations({
                    "de": 'kreis',
                    "es-ES": 'circulo',
                    "fr": 'cercle',
                    "it": 'cerchio',
                    "pt-BR": 'circulo',
                    "ru": 'круг'
                })
                .setDescription("⌠💡⌡ Discover values of circular objects")
                .setDescriptionLocalizations({
                    "de": '⌠💡⌡ Entdecken Sie die Werte kreisförmiger Objekte',
                    "es-ES": '⌠💡⌡ Descubre valores de objetos circulares',
                    "fr": '⌠💡⌡ Découvrez les valeurs des objets circulaires',
                    "it": '⌠💡⌡ Scopri i valori degli oggetti circolari',
                    "pt-BR": '⌠💡⌡ Descubra os valores dos objetos circulares',
                    "ru": '⌠💡⌡ Откройте для себя значения круглых объектов'
                })
                .addStringOption(option =>
                    option.setName("input")
                        .setNameLocalizations({
                            "de": 'typ',
                            "es-ES": 'entrada',
                            "fr": 'entree',
                            "it": 'entrata',
                            "pt-BR": 'entrada',
                            "ru": 'вход'
                        })
                        .setDescription("The input type")
                        .setDescriptionLocalizations({
                            "de": 'Die Art Ihrer Eingabe',
                            "es-ES": 'El tipo de entrada',
                            "fr": 'Le type d\'entrée',
                            "it": 'Il tipo di ingresso',
                            "pt-BR": 'O tipo da sua entrada',
                            "ru": 'тип ввода'
                        })
                        .addChoices(
                            { name: '🕛 Ray', value: '0' },
                            { name: '🚫 Diameter', value: '1' },
                            { name: '⭕ Perimeter', value: '2' },
                            { name: '⚪ Area', value: '3' }
                        )
                        .setRequired(true))
                .addNumberOption(option =>
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
                        .setMinValue(0)
                        .setRequired(true))),
    async execute({ client, interaction }) {

        // Solicitando a função e executando
        require(`./subcommands/calculator_${interaction.options.getSubcommand()}`)({ client, interaction })
    }
}