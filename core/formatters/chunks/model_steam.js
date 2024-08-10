const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { EmbedBuilder } = require('discord.js')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, { conf: true })

    const idioma_definido = client.idioma.getLang(interaction)
    let texto_entrada = ''

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

    if (!texto_entrada) { // Verificando se o usuário possui link com a steam
        if (!user_alvo.social.steam)
            return client.tls.reply(interaction, user, "util.steam.sem_link", true, 1)
        else
            texto_entrada = user_alvo.social.steam
    }

    // Perfis com links customizados
    texto_entrada = texto_entrada.replace("https://steamcommunity.com/id/", "")
    let usuario_alvo = `https://steamcommunity.com/id/${texto_entrada}`

    // Perfis sem links customizados
    if (texto_entrada.includes("https://steamcommunity.com/profiles/")) {
        texto_entrada = texto_entrada.replace("https://steamcommunity.com/profiles/", "")
        usuario_alvo = `https://steamcommunity.com/profiles/${texto_entrada}`
    }

    // Aumentando o tempo de duração da resposta
    await interaction.deferReply({ ephemeral: client.decider(user?.conf.ghost_mode, 0) })

    fetch(usuario_alvo)
        .then(response => response.text())
        .then(async res => {

            try {
                let status = res.split("<title>")[1]
                status = status.split("</title>")[0]
                status = status.replace("Steam Community :: ", "")

                if (status === "Error")
                    return client.tls.editReply(interaction, user, "util.steam.error_1", true, 1)

                let bandeira_user, nivel_user, status_atual, jogos_user, insignias_user, conquistas_user, conquistas_favoritas, total_conquistas_favoritas, porcentagem_conquistas, capturas_user, videos_user, artes_user, tempo_semanas
                let jogo_favorito = "", tempo_jogado = "", nota_rodape = "", anos_servico = "", background_user = "", criacoes_user = "", game_atual = ""

                if (res.includes("<video playsinline autoplay muted loop poster=\"")) {
                    background_user = res.split("<video playsinline autoplay muted loop poster=\"")[1]
                    background_user = background_user.split("\">")[0]
                } else if (res.includes("<div class=\"no_header profile_page has_profile_background")) {
                    background_user = res.split("<div class=\"no_header profile_page has_profile_background")[1]
                    background_user = background_user.split("' );\">")[0]
                    background_user = background_user.split("url( '")[1]
                }

                try {
                    bandeira_user = res.split("<img class=\"profile_flag\"")[1]
                    bandeira_user = bandeira_user.split("\">")[0]
                    bandeira_user = bandeira_user.replace(".gif", "")
                    bandeira_user = bandeira_user.slice(bandeira_user.length - 2)

                    bandeira_user = ` :flag_${bandeira_user}:`
                } catch {
                    bandeira_user = ""
                }

                const nome_user = status
                let avatar_user = res.split("<div class=\"playerAvatarAutoSizeInner\">")[1]

                if (avatar_user.includes("<div class=\"profile_avatar_frame\">")) // Verifica se o usuário possui decoração sob o avatar
                    avatar_user = avatar_user.split("</div>")[1]

                avatar_user = avatar_user.split("</div>")[0]
                avatar_user = avatar_user.replace("<img src=\"", "")
                avatar_user = avatar_user.replace("\">", "")

                try {
                    status_atual = res.split("<div class=\"profile_in_game_header\">")[1]

                    // Perfil em jogo no momento
                    if (status_atual.includes("<div class=\"profile_in_game_name\">")) {
                        game_atual = status_atual.split("<div class=\"profile_in_game_name\">")[1]
                        game_atual = game_atual.split("</div>")[0]
                    }

                    status_atual = status_atual.split("</div>")[0]
                    status_atual = status_atual.replace("Currently ", "")

                    if (status_atual === "Online")
                        status_atual = `**:green_circle: Online**`
                    else if (status_atual === "In-Game")
                        status_atual = `**:blue_circle: Jogando**`
                    else
                        status_atual = `**:black_circle: Offline**`

                } catch {
                    status = client.tls.phrase(user, `util.steam.undefined`)
                }

                try {
                    nivel_user = res.split("<span class=\"friendPlayerLevelNum\">")[1]
                    nivel_user = nivel_user.split("</span>")[0]
                } catch {
                    nivel_user = "-"
                }

                try {
                    jogos_user = res.split("<span class=\"count_link_label\">Games</span>&nbsp;")[1]
                    jogos_user = jogos_user.replace("<span class=\"profile_count_link_total\">", "").split("</span>")[0]
                    jogos_user = jogos_user.replace(",", ".").replace(/\s+/g, '')
                } catch {
                    jogos_user = "-"

                    if (res.includes("<div class=\"label\">Games Owned</div>")) {
                        jogos_user = res.split("<div class=\"label\">Games Owned</div>")[0]
                        jogos_user = jogos_user.slice(jogos_user.length - 120).split("<div class=\"value\">")[1]
                        jogos_user = jogos_user.split("</div>")[0]
                        jogos_user = jogos_user.replace(",", ".").replace(/\s+/g, '')
                    }
                }

                try {
                    insignias_user = res.split("<span class=\"count_link_label\">Badges</span>&nbsp;")[1]
                    insignias_user = insignias_user.replace("<span class=\"profile_count_link_total\">", "").split("</span>")[0]
                    insignias_user = insignias_user.replace(",", ".").replace(/\s+/g, '')
                } catch {
                    insignias_user = "-"
                }

                try {
                    if (res.includes("achievements in")) {
                        conquistas_user = res.split("achievements in")[1]
                        conquistas_user = conquistas_user.split("<div class=\"value\">")[1]
                        conquistas_user = conquistas_user.split("</div>")[0]
                    } else
                        conquistas_user = "-"
                } catch {
                    conquistas_user = "-"
                }

                if (res.includes("<div class=\"favoritegame_showcase\">")) {

                    const bloco_conquistas = res.split("<div class=\"favoritegame_showcase\">")[1]
                    conquistas_favoritas = bloco_conquistas.split("<div class=\"achievement_progress_bar_ctn\">")[0]
                    conquistas_favoritas = conquistas_favoritas.split("<span class=\"ellipsis\">")[1]
                    conquistas_favoritas = conquistas_favoritas.split("</span>")[0].replace("of", "/")
                }

                try {
                    tempo_semanas = res.split("<div class=\"recentgame_quicklinks recentgame_recentplaytime\">")[1]
                    tempo_semanas = tempo_semanas.split("</h2>")[0]
                    tempo_semanas = tempo_semanas.replace("<h2>", "")

                    const descriminador_tempo_2 = tempo_semanas.split(" ")[1]
                    tempo_semanas = parseFloat(tempo_semanas.split(" ")[0])

                    if (idioma_definido === "pt-br")
                        tempo_semanas = `▶ ${tempo_semanas} ${client.tls.phrase(user, `util.steam.${descriminador_tempo_2}`)}`
                    else
                        tempo_semanas = `▶ ${tempo_semanas} ${descriminador_tempo_2}`
                } catch {
                    tempo_semanas = "-"
                }

                try {
                    porcentagem_conquistas = res.split("<div class=\"label\">Avg. Game Completion Rate</div>")[0]
                    porcentagem_conquistas = porcentagem_conquistas.slice(porcentagem_conquistas.length - 40)
                    porcentagem_conquistas = porcentagem_conquistas.split("<div class=\"value\">")[1]
                    porcentagem_conquistas = porcentagem_conquistas.split("</div>")[0]
                } catch {
                    porcentagem_conquistas = "-"
                }

                let jogos_perfeitos
                try {
                    jogos_perfeitos = res.split("<div class=\"label\">Perfect Games</div>")[0]
                    jogos_perfeitos = jogos_perfeitos.slice(jogos_perfeitos.length - 40)
                    jogos_perfeitos = jogos_perfeitos.split("<div class=\"value\">")[1]
                    jogos_perfeitos = jogos_perfeitos.split("</div>")[0]
                    jogos_perfeitos = jogos_perfeitos.replace(",", ".").replace(/\s+/g, '')
                } catch {
                    jogos_perfeitos = "-"
                }

                let reviews_user
                try {
                    reviews_user = res.split("<span class=\"count_link_label\">Reviews</span>&nbsp;")[1]
                    reviews_user = reviews_user.replace("<span class=\"profile_count_link_total\">", "").split("</span>")[0]
                    reviews_user = reviews_user.replace(",", ".").replace(/\s+/g, '')
                } catch {
                    reviews_user = "-"
                }

                try {
                    capturas_user = res.split("<span class=\"count_link_label\">Screenshots</span>&nbsp;")[1]
                    capturas_user = capturas_user.replace("<span class=\"profile_count_link_total\">", "").split("</span>")[0]
                    capturas_user = capturas_user.replace(",", ".").replace(/\s+/g, '')
                } catch {
                    capturas_user = "-"
                }

                try {
                    videos_user = res.split("<span class=\"count_link_label\">Videos</span>&nbsp;")[1]
                    videos_user = videos_user.replace("<span class=\"profile_count_link_total\">", "").split("</span>")[0]
                    videos_user = videos_user.replace(",", ".").replace(/\s+/g, '')
                } catch {
                    videos_user = "-"
                }

                try {
                    artes_user = res.split("<span class=\"count_link_label\">Artwork</span>&nbsp;")[1]
                    artes_user = artes_user.replace("<span class=\"profile_count_link_total\">", "").split("</span>")[0]
                    artes_user = artes_user.replace(",", ".").replace(/\s+/g, '')
                } catch {
                    artes_user = "-"
                }

                let descriminador_tempo
                if (res.includes("<div class=\"showcase_item_detail_title\">")) {
                    const dados_jogo_fav = res.split("<div class=\"showcase_item_detail_title\">")[1]

                    jogo_favorito = dados_jogo_fav
                    jogo_favorito = jogo_favorito.split("</a>")[0]
                    jogo_favorito = jogo_favorito.split("\">")[1]
                    jogo_favorito = jogo_favorito.replaceAll(/\t/g, "")

                    jogo_favorito = jogo_favorito.replaceAll(/[\n\r]/g, "")

                    try {
                        tempo_jogado = dados_jogo_fav.split("<div class=\"showcase_stat\">")[1]
                        tempo_jogado = tempo_jogado.split("</div>")[0]
                        tempo_jogado = tempo_jogado.replace("<div class=\"value\">", "")
                    } catch {
                        tempo_jogado = "-"
                    }

                    try {
                        descriminador_tempo = dados_jogo_fav.split("<div class=\"label\">")[1]
                        descriminador_tempo = descriminador_tempo.split("</div>")[0]
                        descriminador_tempo = descriminador_tempo.split(" ")[0].toLocaleLowerCase()
                    } catch {
                        descriminador_tempo = "-"
                    }

                    if (conquistas_favoritas)
                        if (idioma_definido === "pt-br")
                            descriminador_tempo = client.tls.phrase(user, `util.steam.${descriminador_tempo}`)

                    tempo_jogado = tempo_jogado.replace(",", ".").replace(/\s+/g, '')
                    tempo_jogado = `${tempo_jogado} ${descriminador_tempo}`
                }

                if (res.includes("Member since ")) {
                    anos_servico = res.split("Member since ")[1]
                    anos_servico = client.execute("formatters", "formata_data", anos_servico.split(".\">")[0].replace(",", ""))
                }

                if (reviews_user === "-" || jogos_perfeitos === "-" || porcentagem_conquistas === "-" || conquistas_user === "-" || insignias_user === "-" || jogos_user === "-" || status === "-" || insignias_user === "-" || tempo_semanas === "-")
                    nota_rodape = client.tls.phrase(user, "util.steam.rodape")

                if (parseInt(jogos_user.replace(".", "")) < jogos_perfeitos)
                    nota_rodape = client.tls.phrase(user, "util.steam.suspeito")

                if (!conquistas_favoritas && !total_conquistas_favoritas)
                    jogo_favorito = ""

                conquistas_user = conquistas_user.replace(",", ".").replace(/\s+/g, '')

                if (capturas_user !== "-")
                    criacoes_user += `:frame_photo: **${client.tls.phrase(user, "util.steam.capturas")}: **\`${capturas_user}\``
                if (videos_user !== "-")
                    criacoes_user += `\n:film_frames: **${client.tls.phrase(user, "util.steam.videos")}: **\`${videos_user}\``
                if (artes_user !== "-")
                    criacoes_user += `\n:paintbrush: **${client.tls.phrase(user, "util.steam.artes")}: **\`${artes_user}\``

                if (reviews_user !== "-")
                    reviews_user = `${client.defaultEmoji("pen")} **${client.tls.phrase(user, "util.steam.analises")}: **\`${reviews_user}\``

                const row = client.create_buttons([
                    { name: "Steam", value: usuario_alvo, type: 4, emoji: "🌐" }
                ], interaction)

                const usuario_steam = new EmbedBuilder()
                    .setTitle(`${nome_user.replace(/ /g, "")}${bandeira_user}`)
                    .setColor(client.embed_color(user_alvo.misc.color))
                    .setAuthor({
                        name: "Steam",
                        iconURL: "https://th.bing.com/th/id/R.dc9023a21d267f5a69f80d73f6e89dc2?rik=3XtZuRHyuD3yhQ&riu=http%3a%2f%2ficons.iconarchive.com%2ficons%2ffroyoshark%2fenkel%2f512%2fSteam-icon.png&ehk=Q%2bLzz3YeY7Z8gPsTI2r1YF4KgfPnV%2bHMJkEoSx%2bKPy0%3d&risl=&pid=ImgRaw&r=0"
                    })
                    .setThumbnail(avatar_user)
                    .addFields(
                        {
                            name: `${client.defaultEmoji("gamer")} **${client.tls.phrase(user, "util.steam.nivel")} ${nivel_user}**`,
                            value: `:red_envelope: **${insignias_user} ${client.tls.phrase(user, "util.steam.insignias")}**`,
                            inline: true
                        })

                // Adicionando uma nota no rodape do perfil
                if (nota_rodape !== "")
                    usuario_steam.setFooter({
                        text: nota_rodape,
                        iconURL: interaction.user.avatarURL({ dynamic: true })
                    })

                // Jogos do usuário
                if (jogos_user !== "-")
                    usuario_steam.addFields(
                        {
                            name: `:video_game: **${jogos_user} ${client.tls.phrase(user, "util.steam.jogos")}**`,
                            value: `${reviews_user}`,
                            inline: true
                        })
                else
                    usuario_steam.addFields({ name: "⠀", value: "⠀", inline: true })

                // Status de atividade do usuário
                usuario_steam.addFields(
                    {
                        name: status_atual,
                        value: "⠀",
                        inline: true
                    }
                )

                // Conquistas, games completos e porcentagem
                if (conquistas_user !== "-" || porcentagem_conquistas !== "-" || jogos_perfeitos !== "-")
                    usuario_steam.addFields(
                        {
                            name: `:trophy: **${client.tls.phrase(user, "util.steam.conquistas")}**`,
                            value: `**${client.tls.phrase(user, "util.steam.total")}: **\`${conquistas_user}\`\n**${client.tls.phrase(user, "util.steam.porcentagem")}:** \`${porcentagem_conquistas}\`\n**${client.tls.phrase(user, "util.steam.jogos_perfeitos")}: **\`${jogos_perfeitos}\``,
                            inline: true
                        }
                    )
                else
                    usuario_steam.addFields({ name: "⠀", value: "⠀", inline: true })

                // Imagem personalizada de fundo
                if (background_user.length > 0)
                    usuario_steam.setImage(background_user)

                // Criações do usuário
                if (criacoes_user !== "")
                    usuario_steam.addFields(
                        {
                            name: `:piñata: **${client.tls.phrase(user, "util.steam.criacoes")}**`,
                            value: `${criacoes_user}`,
                            inline: true
                        })

                // Tempo de jogo nas últimas 2 semanas
                if (tempo_semanas !== "-")
                    usuario_steam.addFields(
                        { name: `${client.defaultEmoji("time")} **${client.tls.phrase(user, "util.steam.semanas")}**\n\`${tempo_semanas}\``, value: "⠀", inline: true }
                    )
                else
                    usuario_steam.addFields({ name: "⠀", value: "⠀", inline: true })

                // Card de jogo favorito no perfil
                if (jogo_favorito !== "")
                    usuario_steam.addFields(
                        {
                            name: `:star: ${client.tls.phrase(user, "util.steam.jogo_favorito")}`,
                            value: `**${client.tls.phrase(user, "util.steam.nome")}: **\`${jogo_favorito}\`\n:trophy: **${client.tls.phrase(user, "util.steam.conquistas")}: **\`${conquistas_favoritas}\`\n${client.defaultEmoji("time")} **${client.tls.phrase(user, "util.steam.tempo_jogado")}: **\`${tempo_jogado}\``,
                            inline: false
                        }
                    )

                // Jogando atualmente
                if (game_atual !== "")
                    usuario_steam.setDescription(`\`\`\`fix\n${client.defaultEmoji("playing")} ${game_atual}\`\`\``)

                // Tempo de criação da conta
                if (anos_servico !== "")
                    usuario_steam.addFields(
                        {
                            name: `:birthday: ${client.tls.phrase(user, "util.user.entrada")}`,
                            value: `<t:${anos_servico}:D>\n( <t:${anos_servico}:R> )`,
                            inline: false
                        }
                    )

                interaction.editReply({
                    embeds: [usuario_steam],
                    components: [row],
                    ephemeral: client.decider(user?.conf.ghost_mode, 0)
                })

            } catch (err) {
                client.error(err, "Steam Model")
                interaction.editReply(`${client.tls.phrase(user, "util.steam.error_2")}\n<${usuario_alvo}>`)
            }
        })
        .catch((err) => {
            client.error(err, "Steam Model")
            interaction.editReply(`${client.tls.phrase(user, "util.steam.error_2")}\n<${usuario_alvo}>`)
        })
}