const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("channel")
        .setDescription("⌠💡⌡ Show channel details")
        .setDescriptionLocalizations({
            "de": '⌠💡⌡ Siehe Kanaldetails',
            "es-ES": '⌠💡⌡ Ver detalles del canal',
            "fr": '⌠💡⌡ Afficher les détails de la chaîne',
            "it": '⌠💡⌡ Visualizza i dettagli del canale',
            "pt-BR": '⌠💡⌡ Veja detalhes de algum canal',
            "ru": '⌠💡⌡ Подробнее о канале'
        })
        .addChannelOption(option =>
            option.setName("channel")
                .setNameLocalizations({
                    "de": 'kanal',
                    "es-ES": 'canal',
                    "fr": 'chaîne',
                    "it": 'canale',
                    "pt-BR": 'canal',
                    "ru": 'канал'
                })
                .setDescription("Mention a channel")
                .setDescriptionLocalizations({
                    "de": 'einen Kanal erwähnen',
                    "es-ES": 'Mencionar un canal',
                    "fr": 'Mentionner une chaîne',
                    "it": 'Menzionare un canale',
                    "pt-BR": 'Mencione um canal',
                    "ru": 'упомянуть канал'
                })),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, {
            conf: true,
            misc: true
        })
        let canal = interaction.options.getChannel("channel") || interaction.channel

        // Coletando os dados do canal informado
        let nsfw = client.tls.phrase(user, "util.minecraft.nao")
        if (canal.nsfw) nsfw = client.tls.phrase(user, "util.minecraft.sim")

        const data_criacao = `<t:${Math.floor(canal.createdAt / 1000)}:f>` // Criação do canal
        const diferenca_criacao = `<t:${Math.floor(canal.createdAt / 1000)}:R>`
        let userlimit, bitrate = ""

        let topico = `\`\`\`${canal.topic || client.tls.phrase(user, "util.canal.sem_topico")}\`\`\``

        if (canal?.bitrate) {
            topico = `\`\`\`🔊 ${client.tls.phrase(user, "util.canal.canal_voz")}\`\`\``

            userlimit = canal.userLimit

            if (userlimit === 0)
                userlimit = client.tls.phrase(user, "util.canal.sem_limites")

            bitrate = `${canal.bitrate / 1000}kbps`
        }

        const infos_ch = new EmbedBuilder()
            .setColor(client.embed_color(user.misc.color))
            .setAuthor({
                name: canal.name,
                iconURL: canal.guild.iconURL({ size: 2048 })
            })
            .setDescription(topico)
            .addFields(
                {
                    name: `:globe_with_meridians: **${client.tls.phrase(user, "util.canal.id_canal")}**`,
                    value: `\`${canal.id}\``,
                    inline: true
                },
                {
                    name: `:label: **${client.tls.phrase(user, "util.canal.mencao")}**`,
                    value: `\`<#${canal.id}>\``,
                    inline: true
                }
            )

        if (bitrate === "")
            infos_ch.addFields(
                {
                    name: ":underage: NSFW",
                    value: `\`${nsfw}\``,
                    inline: true
                }
            )
        else
            infos_ch.addFields({ name: "⠀", value: "⠀", inline: true })

        infos_ch.addFields(
            {
                name: `:birthday: ${client.tls.phrase(user, "util.server.criacao")}`,
                value: `${data_criacao}\n [ ${diferenca_criacao} ]`,
                inline: true
            }
        )

        if (canal?.bitrate)
            infos_ch.addFields(
                {
                    name: `:mega: ${client.tls.phrase(user, "util.canal.transmissao")}`,
                    value: `:radio: **Bitrate: **\`${bitrate}\`\n:busts_in_silhouette: **Max. users: **\`${userlimit}\``,
                    inline: true
                }
            )

        if (canal?.rateLimitPerUser)
            if (canal.rateLimitPerUser > 0)
                infos_ch.addFields(
                    {
                        name: `:name_badge: ${client.tls.phrase(user, "util.canal.modo_lento")}`,
                        value: `\`${canal.rateLimitPerUser} ${client.tls.phrase(user, "util.unidades.segundos")}\``,
                        inline: true
                    }
                )

        interaction.reply({
            embeds: [infos_ch],
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    }
}