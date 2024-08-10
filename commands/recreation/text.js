const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("text")
        .setNameLocalizations({
            "es-ES": 'texto',
            "fr": 'texte',
            "it": 'testo',
            "pt-BR": 'texto',
            "ru": 'текст'
        })
        .setDescription("⌠😂⌡ Text operations")
        .setDescriptionLocalizations({
            "de": '⌠😂⌡ Textoperationen',
            "es-ES": '⌠😂⌡ Operaciones de texto',
            "fr": '⌠😂⌡ Opérations de texte',
            "it": '⌠😂⌡ Operazioni di testo',
            "pt-BR": '⌠😂⌡ Operações com textos',
            "ru": '⌠😂⌡ Текстовые операции'
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
                    { name: '📠 Anagram', value: 'anagram' },
                    { name: '◀ Reverse', value: 'reverse' },
                    { name: '⏫ Upper', value: 'upper' },
                    { name: '🔠 Sans', value: 'sans' },
                    { name: '😁 Emoji', value: 'emoji' },
                    { name: '🔢 Counter', value: 'counter' }
                )
                .setRequired(true))
        .addStringOption(option =>
            option.setName("text")
                .setNameLocalizations({
                    "es-ES": 'texto',
                    "fr": 'texte',
                    "it": 'testo',
                    "pt-BR": 'texto',
                    "ru": 'текст'
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
                .setRequired(true))
        .addStringOption(option =>
            option.setName("emoji")
                .setNameLocalizations({
                    "ru": 'эмодзи'
                })
                .setDescription("Choose one!")
                .setDescriptionLocalizations({
                    "de": 'Wähle ein!',
                    "es-ES": '¡Escoge uno!',
                    "fr": 'Choisissez-en un!',
                    "it": 'Scegline uno!',
                    "pt-BR": 'Escolha um!',
                    "ru": 'Выбери один!'
                })),
    async execute({ client, interaction }) {

        let texto_entrada = interaction.options.getString("text")

        // Redirecionando para a opção respectiva
        require(`./subcommands/text_${interaction.options.getString("operation")}`)({ client, interaction, texto_entrada })
    }
}