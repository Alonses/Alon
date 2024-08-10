const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { EmbedBuilder } = require('discord.js')

const direcao_cardial = require("../../functions/cardinal_direction")

const getCountryISO3 = require("country-iso-2-to-3")
const formata_horas = require('../formata_horas')

module.exports = async (client, interaction) => {
    const user = await client.getUser(interaction.user.id, {
        conf: true,
        misc: true
    })

    let idioma_definido = user.lang === "al-br" ? "pt-br" : user.lang || "pt-br", pesquisa, pesquisa_bruta
    let lang_min = idioma_definido.slice(0, 2) === "ru" ? "en" : idioma_definido.slice(0, 2)

    const translations = require(`i18n-country-code/locales/${lang_min}.json`)

    // Requisições manuais
    if (interaction) {
        // Verifica se não há entrada customizada e se o usuário não possui um local padrão
        if (interaction.options.data.length < 1 && !user.misc.locale)
            return client.tls.editReply(interaction, user, "util.tempo.error_locale", true, 2)

        // Usa o local padrão caso não tenha entrada definida
        pesquisa = interaction.options.getString("place") || user.misc.locale
        pesquisa_bruta = `\"${pesquisa.replaceAll("\"", "")}"`
    }

    const url_completa =  `${process.env.url_weather}appid=${process.env.key_weather}&q=${pesquisa ?? user.misc.locale}&units=metric&lang=${lang_min}`

    fetch(url_completa)
        .then(response => response.json())
        .then(async res => {

            if (interaction) {
                if (res.cod === '404' || res.cod === '400')
                    return interaction.editReply({
                        content: `${client.tls.phrase(user, "util.tempo.aviso_2", client.emoji("emojis_negativos"), pesquisa)}\n${client.tls.phrase(user, "util.tempo.sugestao")} \`/${interaction.commandName} ${pesquisa_bruta}\``,
                        ephemeral: true
                    })
                else if (res.cod === '429')// Erro da API
                    return interaction.editReply({
                        content: client.tls.phrase(user, "util.tempo.aviso_3", client.emoji("emojis_negativos")),
                        ephemeral: true
                    })
                else if (res.id === '1873107')
                    return interaction.editReply({
                        content: client.tls.phrase(user, "util.tempo.error_2", client.emoji("emojis_negativos")),
                        ephemeral: true
                    })
            } else {
                if (res.cod === '404' || res.cod === '400')
                    return client.sendDM(user.id, { content: client.tls.phrase(user, "util.tempo.aviso_2", client.emoji("emojis_negativos"), pesquisa) }, true)
                else if (res.cod === '429') // Erro da API
                    return client.sendDM(user.id, { content: client.tls.phrase(user, "util.tempo.aviso_3", client.emoji("emojis_negativos")) }, true)
                else if (res.id === '1873107')
                    return client.sendDM(user.id, { content: client.tls.phrase(user, "util.tempo.error_2", client.emoji("emojis_negativos")) }, true)
            }

            fetch(`${process.env.url_time}key=${process.env.key_time}&format=json&by=position&lat=${res.coord.lat}&lng=${res.coord.lon}`) // Buscando o horário local
                .then(response => response.json())
                .then(async res_hora => {

                    let dados_att = new Date((res.dt) * 1000)
                    dados_att = `${("0" + dados_att.getHours()).substr(-2)}:${("0" + dados_att.getMinutes()).substr(-2)} (*)`

                    let bandeira_pais = "", nome_pais = "", horario_local
                    let nota_rodape = `${client.tls.phrase(user, "util.tempo.dados_atts")} ${dados_att}`

                    const indicaTemp = require('../../functions/temperature')
                    const estacao_atual = require('../../functions/current_season')

                    if (res.sys.country) {
                        bandeira_pais = `:flag_${(res.sys.country).toLowerCase()}:`

                        const cod_pais = getCountryISO3(res.sys.country)
                        nome_pais = ` - ${translations[cod_pais]}`

                        if (res.sys.country === "AQ")
                            nome_pais = ` - ${client.tls.phrase(user, "util.tempo.antartida")}`

                        if (nome_pais.includes(res.name)) {
                            nome_pais = ""
                            nota_rodape += ` | ${client.tls.phrase(user, "util.tempo.aviso_pais")}`
                        }

                        horario_local = res_hora.formatted
                        horario_local = new Date(horario_local)
                    } else {
                        horario_local = new Date(res.dt * 1000)

                        if (res.name !== "Globe" && (res.coord.lon !== 0 && res.coord.lat !== 0))
                            nota_rodape += ` | ${client.tls.phrase(user, "util.tempo.aviso_continente")}`
                        else if (res.coord.lon === 0 && res.coord.lat === 0)
                            nota_rodape += ` | ${client.tls.phrase(user, "util.tempo.aviso_planeta")}`
                    }

                    // 10800 (timezone brasilia)
                    let nascer_sol = new Date((res.sys.sunrise + res.timezone + 10800) * 1000)
                    let por_sol = new Date((res.sys.sunset + res.timezone + 10800) * 1000)

                    nascer_sol = formata_horas(nascer_sol.getHours(), nascer_sol.getMinutes())
                    por_sol = formata_horas(por_sol.getHours(), por_sol.getMinutes())

                    let tempo_atual = res.weather[0].description // Clima atual
                    tempo_atual = tempo_atual.charAt(0).toUpperCase() + tempo_atual.slice(1)

                    const minutos = formata_horas(horario_local.getMinutes()) // Preservar o digito 0
                    const hora = formata_horas(horario_local.getHours()) // Preservar o digito 0
                    const dia = horario_local.getDate()

                    let mes = horario_local.toLocaleString(lang_min, { month: 'long' })
                    let hours = horario_local.getHours()

                    hours %= 12
                    hours = hours ? hours : 12

                    if (minutos >= 30)
                        hours += "30"

                    let emoji_ceu_atual = ":park:"

                    // Umidade
                    let emoji_umidade = ":sweat_drops:", emoji_indica_humidade = "", emoji_indica_visibilidade = ""

                    if (res.main.humidity < 60)
                        emoji_umidade = ":droplet:"

                    if (res.main.humidity < 30)
                        emoji_umidade = ":cactus:"

                    // Nuvens
                    let emoji_nuvens = ":cloud:"

                    if (res.clouds.all < 60)
                        emoji_nuvens = ":white_sun_cloud:"

                    if (res.clouds.all < 41)
                        emoji_nuvens = ":white_sun_small_cloud:"

                    if (res.clouds.all < 31) {
                        emoji_nuvens = ":sunny:"

                        if (hora > 17 || hora < 7) // Noite
                            emoji_nuvens = ":full_moon_with_face:"
                    }

                    if (hora > 17 || hora < 7)
                        emoji_ceu_atual = ":milky_way:"

                    // Sensação térmica dinâmica
                    let emoji_sensacao_termica = ":hot_face:"

                    if (res.main.feels_like >= 15 && res.main.feels_like <= 28)
                        emoji_sensacao_termica = ":ok_hand:"

                    if (res.main.feels_like < 15)
                        emoji_sensacao_termica = ":cold_face:"

                    if (res.main.feels_like < 0)
                        emoji_sensacao_termica = ":snowman2:"

                    if (res.main.feels_like >= 35)
                        emoji_sensacao_termica = ":fire:"

                    horario_local = `:clock${hours}: **${client.tls.phrase(user, "util.tempo.hora_local")}:** \`${hora}:${minutos} | ${dia} ${client.tls.phrase(user, "util.tempo.de")} ${mes}\``

                    let nome_local = `${client.tls.phrase(user, "util.tempo.na")} ${res.name}`, rodape_cabecalho = ""
                    let cabecalho_fix = estacao_atual(res.coord.lat, client, user)

                    if (res.sys.country)
                        if (lang_min === "pt")
                            nome_local = nome_local.replace("na", "em")

                    if (res.name === "Globe")
                        nome_local = `${client.tls.phrase(user, "util.tempo.terra")} ${client.defaultEmoji("earth")}`

                    // Dados para chuva
                    if (res.rain) {
                        cabecalho_fix += "\n------------------------------"

                        cabecalho_fix += `\n${client.tls.phrase(user, "util.tempo.chovendo")}\n${client.tls.phrase(user, "util.tempo.chuva")} 1H: ${res.rain["1h"]}mm`

                        if (res.rain["3h"]) // Dados de chuva para 3 horas
                            cabecalho_fix += `\n${client.tls.phrase(user, "util.tempo.chuva")} 3H: ${res.rain["3h"]}mm`

                        emoji_indica_humidade     = " 🔼"
                        emoji_indica_visibilidade = " 🔽"
                        rodape_cabecalho = `${client.emoji("trollface")} _${client.tls.phrase(user, "util.tempo.chuva_troll")}_`
                    }

                    // Dados para neve
                    if (res.snow) {
                        cabecalho_fix = `${client.tls.phrase(user, "util.tempo.nevando")}\n${client.tls.phrase(user, "util.tempo.neve")} 1H: ${res.rain["1h"]}mm`

                        if (res.rain["3h"]) // Dadps de nevasca para 3 horas
                            cabecalho_fix += `\n${client.tls.phrase(user, "util.tempo.neve")} 3H: ${res.rain["3h"]}mm`

                        emoji_indica_visibilidade = " 🔽"

                        rodape_cabecalho = `${client.emoji("trollface")} _${client.tls.phrase(user, "util.tempo.neve_troll")}_`
                    }

                    // Dados para rajadas de vento
                    if (res.wind.gust && user.misc?.weather) {
                        if (cabecalho_fix !== "")
                            cabecalho_fix += "\n------------------------------"

                        cabecalho_fix += `\n${client.tls.phrase(user, "util.tempo.rajadas_vento")}\n${client.tls.phrase(user, "util.tempo.velocidade")}: ${res.wind.gust} km/h`
                    }

                    if (cabecalho_fix !== "")
                        cabecalho_fix = `\`\`\`fix\n${cabecalho_fix}\`\`\``

                    let pressao_local = `**${client.tls.phrase(user, "util.server.atual")}: **\`${res.main.pressure} kPA\``

                    // Dados de pressão atmosférica
                    if (res.main.grnd_level)
                        pressao_local = `:camping: **${client.tls.phrase(user, "util.tempo.nivel_chao")}: ** \`${res.main.grnd_level} kPA\`\n:island: **${client.tls.phrase(user, "util.tempo.nivel_mar")}: ** \`${res.main.sea_level} kPA\``

                    let emoji_indica_temp = indicaTemp(res.sys.sunrise + res.timezone, res.sys.sunset + res.timezone, res.dt + res.timezone, res.main.temp_max, res.main.temp_min, res.main.temp, rodape_cabecalho)

                    if (res.coord.lat > -20 && res.coord.lat < 20)
                        rodape_cabecalho = `:ringed_planet: ${client.tls.phrase(user, "util.tempo.equador")}\n${rodape_cabecalho}`

                    let embed_clima = new EmbedBuilder()
                        .setTitle(`:boom: ${client.tls.phrase(user, "util.tempo.tempo_agora")} ${nome_local}${nome_pais} ${bandeira_pais}`)
                        .setColor(client.embed_color(user.misc.color))

                    // Máximos de informações para o clima
                    if (user.misc?.weather) {
                        embed_clima
                            .setThumbnail(`http://openweathermap.org/img/wn/${res.weather[0].icon}@2x.png`)
                            .setDescription(`${horario_local} | **${tempo_atual}**${cabecalho_fix}${rodape_cabecalho}`)
                            .addFields(
                                {
                                    name: `:thermometer: **${client.tls.phrase(user, "util.tempo.temperatura")}**`,
                                    value: `${emoji_indica_temp} **${client.tls.phrase(user, "util.server.atual")}**: \`${res.main.temp}°C\`\n:small_red_triangle: **Max:** \`${res.main.temp_max}°C\`\n:small_red_triangle_down: **Min:** \`${res.main.temp_min}°C\``,
                                    inline: true
                                },
                                {
                                    name: `${emoji_ceu_atual} **${client.tls.phrase(user, "util.tempo.ceu_momento")}**`,
                                    value: `${emoji_nuvens} **${client.tls.phrase(user, "util.tempo.nuvens")}: **\`${res.clouds.all}%\`\n:sunrise: **${client.tls.phrase(user, "util.tempo.nas_sol")}: **\`${nascer_sol}\`\n:city_sunset: **${client.tls.phrase(user, "util.tempo.por_sol")}: **\`${por_sol}\``,
                                    inline: true
                                },
                                {
                                    name: `:wind_chime: **${client.tls.phrase(user, "util.tempo.vento")}**`,
                                    value: `:airplane: **Vel.: **\`${res.wind.speed} km/h\`\n:compass: **${client.tls.phrase(user, "util.tempo.direcao")}: ** \`${direcao_cardial(res.wind.deg)}\`\n:eye: **${client.tls.phrase(user, "util.tempo.visibilidade")}: ** \`${res.visibility / 100}%${emoji_indica_visibilidade}\``,
                                    inline: true
                                }
                            )
                            .addFields(
                                {
                                    name: `${emoji_sensacao_termica} **${client.tls.phrase(user, "util.tempo.sensacao_termica")}.**`,
                                    value: `**${client.tls.phrase(user, "util.server.atual")}: **\`${res.main.feels_like}°C\``,
                                    inline: true
                                },
                                {
                                    name: `${emoji_umidade} **${client.tls.phrase(user, "util.tempo.umidade_ar")}**`,
                                    value: `**${client.tls.phrase(user, "util.server.atual")}: **\`${res.main.humidity}%${emoji_indica_humidade}\``,
                                    inline: true
                                },
                                {
                                    name: `:compression: **${client.tls.phrase(user, "util.tempo.pressao_ar")}**`,
                                    value: `${pressao_local}`,
                                    inline: true
                                }
                            )
                            .setFooter({
                                text: nota_rodape
                            })
                    } else { // Minímo de informações para o clima
                        embed_clima
                            .setThumbnail(`http://openweathermap.org/img/wn/${res.weather[0].icon}@2x.png`)
                            .setDescription(`${horario_local} | **${tempo_atual}**${cabecalho_fix}${rodape_cabecalho}`)
                            .addFields(
                                {
                                    name: `:thermometer: **${client.tls.phrase(user, "util.tempo.temperatura")}**`,
                                    value: `${emoji_indica_temp} **${client.tls.phrase(user, "util.server.atual")}**: \`${res.main.temp}°C\``,
                                    inline: true
                                },
                                {
                                    name: `:small_red_triangle: **Max: ${res.main.temp_max}°C**`,
                                    value: `:small_red_triangle_down: **Min: ${res.main.temp_min}°C**`,
                                    inline: true
                                },
                                {
                                    name: `:wind_chime: **${client.tls.phrase(user, "util.tempo.vento")}: ${res.wind.speed} km/h**`,
                                    value: "⠀",
                                    inline: true
                                }
                            )
                            .addFields(
                                {
                                    name: `${emoji_sensacao_termica} **${client.tls.phrase(user, "util.tempo.sensacao_termica")}.**`,
                                    value: `**${client.tls.phrase(user, "util.server.atual")}: **\`${res.main.feels_like}°C\``,
                                    inline: true
                                },
                                {
                                    name: `${emoji_umidade} **${client.tls.phrase(user, "util.tempo.umidade_ar")}**`,
                                    value: `**${client.tls.phrase(user, "util.server.atual")}: **\`${res.main.humidity}%${emoji_indica_humidade}\``,
                                    inline: true
                                },
                                {
                                    name: `${emoji_ceu_atual} **${client.tls.phrase(user, "util.tempo.ceu_momento")}**`,
                                    value: `${emoji_nuvens} **${client.tls.phrase(user, "util.tempo.nuvens")}: **\`${res.clouds.all}%\``,
                                    inline: true
                                }
                            )
                            .setFooter({
                                text: nota_rodape
                            })
                    }

                    if (interaction)
                        return interaction.editReply({
                            embeds: [embed_clima],
                            ephemeral: client.decider(user?.conf.ghost_mode, 0)
                        })
                    else
                        return client.sendDM(user.id, { embeds: [embed_clima] }, true)
                })
        }) // Erro com a API de clima
        .catch(() => {
            if (interaction)
                return interaction.editReply({
                    content: client.tls.phrase(user, "util.tempo.aviso_3", client.emoji("emojis_negativos")),
                    ephemeral: true
                })
            else
                return client.sendDM(user.id, { content: client.tls.phrase(user, "util.tempo.aviso_3", client.emoji("emojis_negativos")) }, true)
        })
}