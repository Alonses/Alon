const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("wiki")
        .setDescription("⌠💡⌡ Search for something on the wiki")
        .setDescriptionLocalizations({
            "de": '⌠💡⌡ Suchen Sie etwas im Wiki',
            "es-ES": '⌠💡⌡ Busca algo en la wiki',
            "fr": '⌠💡⌡ Rechercher quelque chose sur le wiki',
            "it": '⌠💡⌡ Cerca qualcosa sul wiki',
            "pt-BR": '⌠💡⌡ Pesquise sobre algo na wiki',
            "ru": '⌠💡⌡ Ищите что-нибудь в вики'
        })
        .addStringOption(option =>
            option.setName("search")
                .setNameLocalizations({
                    "de": 'suchen',
                    "es-ES": 'busqueda',
                    "fr": 'chercher',
                    "it": 'ricerca',
                    "pt-BR": 'pesquisa',
                    "ru": 'поиск'
                })
                .setDescription("I'm lucky")
                .setDescriptionLocalizations({
                    "de": 'Ich bin glücklich',
                    "es-ES": 'Estoy con suerte',
                    "fr": 'J\'ai de la chance',
                    "it": 'Sono fortunato',
                    "pt-BR": 'Estou com sorte',
                    "ru": 'я удачлив'
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
                .setDescription("In which language?")
                .setDescriptionLocalizations({
                    "de": 'In welcher Sprache?',
                    "es-ES": '¿En qué idioma?',
                    "fr": 'Dans quelle langue?',
                    "it": 'In quale lingua?',
                    "pt-BR": 'Em qual idioma?',
                    "ru": 'На каком языке?'
                })
                .addChoices(
                    { name: '🇩🇪 Deutsch', value: 'de-de' },
                    { name: '🇺🇸 English', value: 'en-us' },
                    { name: '🇪🇸 Español', value: 'es-es' },
                    { name: '🇫🇷 Français', value: 'fr-fr' },
                    { name: '🇮🇹 Italiano', value: 'it-it' },
                    { name: '🇧🇷 Português', value: 'pt-br' },
                    { name: '🇷🇺 Русский', value: 'ru-ru' }
                )),
    async execute({ client, user, interaction }) {

        let idioma_definido = user.lang === "al-br" ? "pt-br" : user.lang
        const content = interaction.options.getString("search")

        if (interaction.options.data.length > 1)
            idioma_definido = interaction.options.getString("language")

        if (content.includes("slondo")) // Pesquisando por "slondo"
            return client.tls.reply(interaction, user, "util.wiki.wiki_slondo", client.decider(user?.conf.ghost_mode, 0), 5)

        const url = `https://api.duckduckgo.com/?q=${encodeURI(content)}&format=json&pretty=0&skip_disambig=1&no_html=1`

        let counter = 0

        fetch(url, { headers: { "accept-language": idioma_definido } })
            .then(response => response.json())
            .then(async res => {

                const fields = []

                if (res.RelatedTopics.length > 0)
                    fields.push({
                        name: `:books: ${client.tls.phrase(user, "util.wiki.topicos_rel")}`,
                        value: "\u200B"
                    })

                for (const topic of res.RelatedTopics) {
                    counter++

                    const text = `${topic.Text.substr(0, 100)}...`

                    fields.push({
                        name: text,
                        value: topic.FirstURL,
                        inline: true
                    })

                    if (counter > 5)
                        break
                }

                if (res.Heading !== "") {
                    fields.length = fields.length > 5 ? 5 : fields.length

                    const row = client.create_buttons([
                        { name: client.tls.phrase(user, "util.wiki.artigo_completo"), value: res.AbstractURL, type: 4, emoji: "🌐" }
                    ], interaction)

                    const Embed = new EmbedBuilder()
                        .setTitle(res.Heading)
                        .setColor(client.embed_color(user.misc.color))
                        .setAuthor({ name: res.AbstractSource })
                        .setThumbnail(res.Image !== '' ? `https://api.duckduckgo.com${res.Image}` : 'https://cdn.iconscout.com/icon/free/png-256/duckduckgo-3-569238.png')
                        .addFields(fields)
                        .setDescription(res.AbstractText)
                        .setTimestamp()
                        .setFooter({
                            text: 'DuckDuckGo API',
                            iconURL: interaction.user.avatarURL({ dynamic: true })
                        })

                    interaction.reply({
                        embeds: [Embed],
                        components: [row],
                        ephemeral: client.decider(user?.conf.ghost_mode, 0)
                    })
                } else {

                    const username = interaction.user.username, termo_pesquisado_cc = content.slice(1)

                    if (username.includes(termo_pesquisado_cc))
                        client.tls.reply(interaction, user, "util.wiki.auto_pesquisa", client.decider(user?.conf.ghost_mode, 0), client.emoji("emojis_negativos"))
                    else
                        client.tls.reply(interaction, user, "util.wiki.sem_dados", client.decider(user?.conf.ghost_mode, 0), client.emoji("emojis_negativos"), content)
                }
            })
            .catch(() => client.tls.reply(interaction, user, "util.wiki.sem_dados", true, client.emoji("emojis_negativos"), content))
    }
}