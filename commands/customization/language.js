const { SlashCommandBuilder } = require('discord.js')

const { languagesMap } = require('../../core/formatters/patterns/user')
const {updateUser} = require("../../core/database/schemas/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("language")
        .setNameLocalizations({
            "de": "sprache",
            "es-ES": 'idioma',
            "fr": 'langue',
            "it": 'linguaggio',
            "pt-BR": 'idioma',
            "ru": 'язык'
        })
        .setDescription("⌠👤⌡ Change the language of Alonsal")
        .setDescriptionLocalizations({
            "de": "⌠👤⌡ Alonsals Sprache ändern",
            "es-ES": '⌠👤⌡ Cambiar el idioma de Alonsal',
            "fr": '⌠👤⌡ Changer la langue d\'Alonsal',
            "it": '⌠👤⌡ Cambia la lingua di Alonsal',
            "pt-BR": '⌠👤⌡ Altere o idioma do Alonsal',
            "ru": '⌠👤⌡ Изменить язык Алонсала',
        })
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
                .setDescription("What is the new language?")
                .setDescriptionLocalizations({
                    "de": 'Was ist die neue Sprache?',
                    "es-ES": '¿Cuál es el nuevo idioma?',
                    "fr": 'Quelle est la nouvelle langue?',
                    "it": 'Qual è la nuova lingua?',
                    "pt-BR": 'Qual o novo idioma?',
                    "ru": 'Каким будет новый язык?'
                })
                .addChoices(
                    { name: '🏴 Alonsês', value: 'al' },
                    { name: '🇩🇪 Deutsch', value: 'de' },
                    { name: '🇺🇸 English', value: 'en' },
                    { name: '🇪🇸 Español', value: 'es' },
                    { name: '🇫🇷 Français', value: 'fr' },
                    { name: '🔆 Hopês', value: 'hp' },
                    { name: '🇮🇹 Italiano', value: 'it' },
                    { name: '🇧🇷 Português', value: 'pt' },
                    { name: '🇷🇺 Русский', value: 'ru' }
                )
                .setRequired(true)),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, { misc: true })
        let novo_idioma = interaction.options.getString("language")
        let frase_idioma

        if (novo_idioma === "hp") {

            if (!user.misc.second_lang) { // Definindo um idioma secundário
                await client.prisma.userOptionsMisc.update({
                    where: { id: user.misc_id },
                    data: { second_lang: "pt-hp" }
                })
                frase_idioma = languagesMap["hp"][1]
            } else { // Removendo o idioma secundário
                await client.prisma.userOptionsMisc.update({
                    where: { id: user.misc_id },
                    data: { second_lang: null }
                })
                frase_idioma = client.tls.phrase(user, "mode.idiomas.idioma_secundario_removido", 11)
            }
        } else {
            // Validando e coletando os dados do idioma
            const matches = novo_idioma.match(/al|de|en|es|fr|it|pt|ru/)

            // Resgata os dados do idioma válido
            await updateUser(client, user.id, { lang: languagesMap[matches[0]][0] })
            frase_idioma = languagesMap[matches[0]][1]
        }

        interaction.reply({
            content: frase_idioma,
            ephemeral: true
        })
    }
}