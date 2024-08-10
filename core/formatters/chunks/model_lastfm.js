const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { EmbedBuilder } = require('discord.js')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, { conf: true })

    let texto_entrada = "", descricao = "", descricao_status = ""

    const params = {
        url: interaction.options.getString("url"),
        user: interaction.options.getUser("user")
    }

    if (params.url)
        texto_entrada = params.url

    const alvo = interaction.options.getUser("user") || interaction.user
    const user_alvo = await client.getUser(alvo.id, {
        misc: true,
        social: true
    })

    // user_alvo -> usuário marcado pelo comando
    // user -> usuário que disparou o comando

    if (!texto_entrada) // Verificando se o usuário possui link com a steam
        if (!user_alvo.social || !user_alvo.social.lastfm)
            return client.tls.reply(interaction, user, "util.lastfm.sem_link", true, 1)
        else
            texto_entrada = user_alvo.social.lastfm

    // Aumentando o tempo de duração da resposta
    await interaction.deferReply({ ephemeral: client.decider(user?.conf.ghost_mode, 0) })

    fetch(`${process.env.url_apisal}/lastfm?profile=${texto_entrada}`)
        .then(response => response.json())
        .then(async res => {

            if (res.status === "401") // Usuário existe mas não possui scrobbles
                return client.tls.editReply(interaction, user, "util.lastfm.sem_scrobbles", client.decider(user?.conf.ghost_mode, 0), 1)

            if (res.status === "402") // Erro na busca pela lastfm
                return client.tls.editReply(interaction, user, "util.lastfm.error_2", true, 4)

            if (res.status === "404") // Usuário não existe
                return client.tls.editReply(interaction, user, "util.lastfm.error_1", client.decider(user?.conf.ghost_mode, 0), 1)

            const row = client.create_buttons([
                { name: "LastFM", value: `https://www.last.fm/pt/user/${texto_entrada}`, type: 4, emoji: "🌐" }
            ], interaction)

            if (res.descricao) // Usuário com descrição no perfil
                descricao = res.descricao

            if (res.obsessao) // Usuário definiu alguma obsessão
                descricao_status = `💿 ${client.tls.phrase(user, "util.lastfm.obsessao")}:\n${res.obsessao}\n-----------------------\n`

            if (res.scrobble_atual) // Usuário está ouvindo agora atualmente
                descricao_status += `🎶 ${client.tls.phrase(user, "util.lastfm.em_scrobble")}:\n${res.scrobble_atual.curtida} ${res.scrobble_atual.faixa}`

            if (descricao_status.length > 0)
                descricao_status = `\`\`\`fix\n${descricao_status}\`\`\``

            const embed = new EmbedBuilder()
                .setTitle(client.tls.phrase(user, "util.lastfm.perfil_musical", null, res.nome))
                .setColor(client.embed_color(user_alvo.misc.color))
                .setThumbnail(res.avatar)
                .setDescription(`${descricao}${descricao_status}`)
                .addFields(
                    {
                        name: `${client.defaultEmoji("instrument")} ${client.tls.phrase(user, "util.lastfm.geral")}`,
                        value: `${client.defaultEmoji("music")} **Scrobbles: **\`${res.stats.musicas_ouvidas}\`\n:radio: **${client.tls.phrase(user, "util.lastfm.media_dia")}: **\`${res.stats.media_scrobbles}\``,
                        inline: true
                    },
                    {
                        name: "⠀",
                        value: `${client.defaultEmoji("singer")} **${client.tls.phrase(user, "util.lastfm.artistas")}: **\`${res.stats.artistas_ouvidos}\`\n${client.defaultEmoji("heart")} **${client.tls.phrase(user, "util.lastfm.faixas_favoritas")}: **\`${res.stats.faixas_preferidas}\``,
                        inline: true
                    },
                    {
                        name: `:birthday: ${client.tls.phrase(user, "util.user.conta_criada")}`,
                        value: `<t:${res.timestamp_entrada}:D>\n ( <t:${res.timestamp_entrada}:R> )`,
                        inline: true
                    }
                )

            if (res.week_stats)
                embed.addFields(
                    {
                        name: `${client.defaultEmoji("calendar")} ${client.tls.phrase(user, "util.lastfm.semanal")}`,
                        value: `${client.defaultEmoji("album")} **${client.tls.phrase(user, "util.lastfm.albuns")}: **\`${res.week_stats.album.now} vs ${res.week_stats.album.before}\` \`${res.week_stats.album.porcent}%\`\n${client.defaultEmoji("singer")} **${client.tls.phrase(user, "util.lastfm.artistas")}: **\`${res.week_stats.artistas.now} vs ${res.week_stats.artistas.before}\` \`${res.week_stats.artistas.porcent}%\`\n${client.defaultEmoji("music")} **Scrobbles: **\`${res.week_stats.scrobbles.now} vs ${res.week_stats.scrobbles.before}\` \`${res.week_stats.scrobbles.porcent}%\`\n:radio: **${client.tls.phrase(user, "util.lastfm.media_dia")}: **\`${res.week_stats.media.now} vs ${res.week_stats.media.before}\` \`${res.week_stats.media.porcent}%\`\n${client.defaultEmoji("time")} **${client.tls.phrase(user, "util.lastfm.tempo_tocado")}: **\`${res.week_stats.tempo.now} vs ${res.week_stats.tempo.before}\` \`${res.week_stats.tempo.porcent}%\``,
                        inline: false
                    }
                )

            interaction.editReply({
                embeds: [embed],
                components: [row],
                ephemeral: client.decider(user?.conf.ghost_mode, 0)
            })
        })
}