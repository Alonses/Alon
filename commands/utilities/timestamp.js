const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

const formata_horas = require('../../core/formatters/formata_horas')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timestamp")
        .setDescription("⌠💡⌡ Convert a date to timestamp or vice versa")
        .addSubcommand(subcommand =>
            subcommand
                .setName("custom")
                .setDescription("⌠💡⌡ Custom timestamp")
                .setDescriptionLocalizations({
                    "de": '⌠💡⌡ Benutzerdefinierter Zeitstempel',
                    "es-ES": '⌠💡⌡ Marca de tiempo personalizada',
                    "fr": '⌠💡⌡ Horodatage personnalisé',
                    "it": '⌠💡⌡ Timestamp personalizzato',
                    "pt-BR": '⌠💡⌡ Timestamp customizado',
                    "ru": '⌠💡⌡ Пользовательская временная метка'
                })
                .addIntegerOption(option =>
                    option.setName("time")
                        .setNameLocalizations({
                            "de": 'zeit',
                            "es-ES": 'tiempo',
                            "fr": 'temps',
                            "it": 'volta',
                            "pt-BR": 'tempo',
                            "ru": 'время'
                        })
                        .setDescription("The value to be converted")
                        .setDescriptionLocalizations({
                            "de": 'Der umzuwandelnde Wert',
                            "es-ES": 'El valor a convertir',
                            "fr": 'La valeur à convertir',
                            "it": 'Il valore da convertire',
                            "pt-BR": 'O Valor a ser convertido',
                            "ru": 'Значение для преобразования'
                        })
                        .setMinValue(0))
                .addStringOption(option =>
                    option.setName("timer")
                        .setDescription("A quick date to schedule")
                        .setDescriptionLocalizations({
                            "de": 'Vereinbaren Sie eine kurze Beratung',
                            "es-ES": 'Una fecha rápida para reservar',
                            "fr": 'Une date rapide à réserver',
                            "it": 'Un\'ora veloce per raccogliere',
                            "pt-BR": 'Uma data rápida para marcar',
                            "ru": 'Бронирование быстрой даты'
                        })
                        .addChoices(
                            { name: '+5 M', value: '5' },
                            { name: '+10 M', value: '10' },
                            { name: '+30 M', value: '30' },
                            { name: '+1 H', value: '60' },
                            { name: '+2 H', value: '120' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName("now")
                .setNameLocalizations({
                    "de": 'jetzt',
                    "es-ES": 'ahora',
                    "fr": 'present',
                    "it": 'adesso',
                    "pt-BR": 'agora',
                    "ru": 'сейчас'
                })
                .setDescription("⌠💡⌡ Current timestamp")
                .setDescriptionLocalizations({
                    "de": '⌠💡⌡ Aktueller Zeitstempel',
                    "es-ES": '⌠💡⌡ Marca de tiempo actual',
                    "fr": '⌠💡⌡ Horodatage actuel',
                    "it": '⌠💡⌡ Timestamp attuale',
                    "pt-BR": '⌠💡⌡ Timestamp atual',
                    "ru": '⌠💡⌡ Текущая метка времени'
                })),
    async execute({ client, user, interaction }) {

        let titulo = client.tls.phrase(user, "util.timestamp.timestamp_1")
        let timestamp, aviso = "", conversao_invalida = false, conversao_valida = "", retorno

        if (interaction.options.getSubcommand() === "custom") { // Entrada customizada

            let entrada = interaction.options.getInteger("time") || null
            let timer = parseInt(interaction.options.getString("timer")) * 60 || 0

            if (!entrada)
                entrada = client.timestamp() + timer // Iniciando o timestamp 

            if (!isNaN(entrada)) {
                titulo = client.tls.phrase(user, "util.timestamp.timestamp_crono")
                retorno = entrada

                timestamp = new Date(entrada)
                timestamp = `${timestamp.getFullYear()}-${("0" + (timestamp.getMonth() + 1)).slice(-2)}-${("0" + timestamp.getDate()).slice(-2)} ${formata_horas(timestamp.getHours(), timestamp.getMinutes(), timestamp.getSeconds())}`

                conversao_invalida = false
            } else if (!entrada.includes("-")) { // De timestamp para data normal
                timestamp = new Date(Number(entrada * 1000))
                titulo = client.tls.phrase(user, "util.timestamp.timestamp_2")
                retorno = entrada

                timestamp = `${timestamp.getFullYear()}-${("0" + (timestamp.getMonth() + 1)).slice(-2)}-${("0" + timestamp.getDate()).slice(-2)} ${formata_horas(timestamp.getHours(), timestamp.getMinutes(), timestamp.getSeconds())}`

                if ((timestamp instanceof Date && !isNaN(timestamp)) || timestamp.split("-")[0] === "NaN")
                    conversao_invalida = true
            } else { // De data normal para timestamp
                timestamp = new Date(data).getTime() / 1000
                retorno = timestamp

                if (isNaN(timestamp))
                    conversao_invalida = true
            }

            if (conversao_invalida)
                conversao_valida = `\`${data}\` -> \`${timestamp}\``
        } else {
            retorno = client.timestamp()
            titulo = client.tls.phrase(user, "util.timestamp.timestamp_now")
        }

        let dica_conversao = `\n\n( \`<t:${retorno}:R>\` ) <t:${retorno}:R>\n( \`<t:${retorno}:t>\` ) <t:${retorno}:t>\n( \`<t:${retorno}:T>\` ) <t:${retorno}:T>\n( \`<t:${retorno}:d>\` ) <t:${retorno}:d>\n( \`<t:${retorno}:D>\` ) <t:${retorno}:D>\n( \`<t:${retorno}:f>\` ) <t:${retorno}:f>\n( \`<t:${retorno}:F>\` ) <t:${retorno}:F>`

        if (conversao_invalida) {
            titulo = client.tls.phrase(user, "util.timestamp.erro_titulo")
            aviso = client.tls.phrase(user, "util.timestamp.erro_conversao")
            timestamp = client.tls.phrase(user, "util.timestamp.valor_nulo")
            dica_conversao = ""
        }

        const embed = new EmbedBuilder()
            .setTitle(titulo)
            .setColor(client.embed_color(user.misc.color))
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.avatarURL({ dynamic: true })
            })
            .setDescription(`${conversao_valida}${dica_conversao}`)

        if (aviso.length > 0)
            embed.setFooter(aviso)

        interaction.reply({
            embeds: [embed],
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    }
}