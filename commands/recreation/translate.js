const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("translate")
        .setNameLocalizations({
            "de": 'übersetzen',
            "es-ES": 'traducir',
            "fr": 'traduire',
            "it": 'tradurre',
            "pt-BR": 'traduz',
            "ru": 'перевести'
        })
        .setDescription("⌠😂⌡ Text Translations")
        .setDescriptionLocalizations({
            "de": '⌠😂⌡ Textübersetzungen',
            "es-ES": '⌠😂⌡ Traducciones de texto',
            "fr": '⌠😂⌡ Traductions de textes',
            "it": '⌠😂⌡ Traduzioni di testi',
            "pt-BR": '⌠😂⌡ Operações com traduções',
            "ru": '⌠😂⌡ Переводы текстов'
        })
        .addStringOption(option =>
            option.setName("key")
                .setNameLocalizations({
                    "de": 'schlüssel',
                    "es-ES": 'llave',
                    "fr": 'cle',
                    "it": 'chiave',
                    "pt-BR": 'chave',
                    "ru": 'ключ'
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
                    { name: '1️⃣ binary', value: 'binary' },
                    { name: '📻 morse', value: 'morse' },
                    { name: '🐱 hieroglyphics', value: 'hieroglyphics' },
                    { name: '🔆 hopês', value: 'hopes' }
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
        .addBooleanOption(option =>
            option.setName("reverse")
                .setNameLocalizations({
                    "de": 'umkehren',
                    "es-ES": 'reverso',
                    "fr": 'inverse',
                    "it": 'inversione',
                    "pt-BR": 'reverso'
                })
                .setDescription("Invert output result")
                .setDescriptionLocalizations({
                    "de": 'Ausgabeergebnis invertieren',
                    "es-ES": 'Invertir resultado de salida',
                    "fr": 'Inverser le résultat de sortie',
                    "it": 'invertire il risultato di output',
                    "pt-BR": 'Inverter resultado de saída',
                    "ru": 'инвертировать вывод'
                }))
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
                .setDescription("Force an operation")
                .setDescriptionLocalizations({
                    "de": 'eine Operation erzwingen',
                    "es-ES": 'Forzar una operación',
                    "fr": 'Forcer une opération',
                    "it": 'forzare un\'operazione',
                    "pt-BR": 'Forçar uma operação',
                    "ru": 'форсировать операцию'
                })
                .addChoices(
                    { name: 'Encode', value: '0' },
                    { name: 'Decode', value: '1' }
                )),
    async execute({ client, interaction }) {

        // Redirecionando para a opção respectiva
        require(`./subcommands/translate_${interaction.options.getString("key")}`)({ client, interaction })
    }
}