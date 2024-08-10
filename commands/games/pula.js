const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pula")
        .setDescription("⌠🎲⌡ The Pula Game!")
        .setDescriptionLocalizations({
            "de": '⌠🎲⌡ Das Pula-Spiel!',
            "es-ES": '⌠🎲⌡ ¡El Juego de Pula!',
            "fr": '⌠🎲⌡ Le Jeu Pula!',
            "it": '⌠🎲⌡ Il gioco di Pola!',
            "pt-BR": '⌠🎲⌡ O Jogo do Pula!',
            "ru": '⌠🎲⌡ Игра от Pula!'
        })
        .addUserOption(option =>
            option.setName("user")
                .setNameLocalizations({
                    "de": 'benutzer',
                    "es-ES": 'usuario',
                    "it": 'utente',
                    "pt-BR": 'usuario',
                    "ru": 'пользователь'
                })
                .setDescription("Mention a user")
                .setDescriptionLocalizations({
                    "de": 'Erwähnen Sie einen anderen Benutzer',
                    "es-ES": 'Mencionar a otro usuario',
                    "fr": 'Mentionner un utilisateur',
                    "it": 'Menziona un altro utente',
                    "pt-BR": 'Mencione outro usuário',
                    "ru": 'Упомянуть другого пользователя'
                })),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, { conf: true })
        let alvo = interaction.options.getUser("user") || interaction.user
        const user_pula = await client.getUser(alvo.id, {
            social: true,
            misc: true
        })

        // user_pula -> Dados do usuário alvo
        // user -> Dados do usuário que disparou o comando

        const row = client.create_buttons([
            { name: client.tls.phrase(user, "game.pula.jogar_agora"), type: 4, emoji: client.emoji("pula_2"), value: "https://gamejolt.com/games/pula-predios/613946" }
        ], interaction)

        if (!user_pula.social.pula_predios)
            return client.reply(interaction, {
                content: alvo.id !== interaction.user.id ? client.tls.phrase(user, "game.pula.vinculo", 1) : client.tls.phrase(user, "game.pula.sem_vinculo", 1),
                components: [row],
                ephemeral: true
            })

        fetch(`${process.env.url_apisal}/pula?token=placholder&sync=1&token_user=${user_pula.social.pula_predios}`)
            .then(res => res.json())
            .then(retorno => {

                if (retorno.status === 404)
                    return client.tls.reply(interaction, user, "game.pula.error_1", true, client.emoji(0))

                const datas_pula = retorno.data

                const embed = new EmbedBuilder()
                    .setTitle(client.tls.phrase(user, "game.pula.estatisticas_pula"))
                    .setColor(client.embed_color(user_pula.misc.color))
                    .setImage("https://m.gjcdn.net/game-header/1300/613946-crop0_236_1366_606-xqiv88ik-v4.webp")
                    .addFields(
                        {
                            name: `${client.emoji("pula_2")} **${client.tls.phrase(user, "game.pula.gerais")}**`,
                            value: `:part_alternation_mark: **${client.tls.phrase(user, "game.pula.pulos")}:** \`${client.locale(datas_pula.pulos)}\`\n:rocket: **${client.tls.phrase(user, "game.pula.mods_ativos")}:** \`${client.locale(datas_pula.mods)}\`\n:skull_crossbones: **${client.tls.phrase(user, "game.pula.mortes")}:** \`${client.locale(datas_pula.mortes)}\``,
                            inline: true,
                        },
                        {
                            name: `${client.defaultEmoji("time")} ${client.tls.phrase(user, "game.pula.tempos")}`,
                            value: `:joystick: **${client.tls.phrase(user, "game.pula.jogado")}:** \`${datas_pula.tempo_jogado}s\`\n:flying_disc: **${client.tls.phrase(user, "game.pula.voando")}:** \`${datas_pula.tempo_voando}s\`\n:carousel_horse: **${client.tls.phrase(user, "game.pula.em_eventos")}:** \`${datas_pula.tempo_eventos}s\``,
                            inline: true
                        },
                        {
                            name: `${client.emoji("mc_esmeralda")} **${client.tls.phrase(user, "game.pula.moedas")}**`,
                            value: `:bank: **${client.tls.phrase(user, "game.pula.coletadas")}:** \`${client.locale(datas_pula.moedas_coletadas)}\`\n:money_with_wings: **${client.tls.phrase(user, "game.pula.gastas")}:** \`${client.locale(datas_pula.moedas_gastas)}\`\n:moneybag: **${client.tls.phrase(user, "game.pula.guardadas")}:** \`${client.locale(datas_pula.moedas)}\``,
                            inline: true
                        },
                    )
                    .addFields(
                        {
                            name: `:carousel_horse: **${client.tls.phrase(user, "game.pula.eventos")}**`,
                            value: `:man_playing_water_polo: **${client.tls.phrase(user, "game.pula.aquatico")}:** \`${client.locale(datas_pula.eventos[0])}\`\n:hotsprings: **${client.tls.phrase(user, "game.pula.lava")}:** \`${client.locale(datas_pula.eventos[1])}\`\n:checkered_flag: **${client.tls.phrase(user, "game.pula.concluidos")}:** \`${client.locale(datas_pula.eventos_concluidos)}\``,
                            inline: true
                        },
                        {
                            name: "⠀",
                            value: `:city_dusk: **${client.tls.phrase(user, "game.pula.zona_densa")}:** \`${client.locale(datas_pula.eventos[2])}\`\n:park: **${client.tls.phrase(user, "game.pula.parque")}:** \`${client.locale(datas_pula.eventos[3])}\`\n:house_abandoned: **${client.tls.phrase(user, "game.pula.pisoes")}:** \`${client.locale(datas_pula.pisoes)}\``,
                            inline: true
                        },
                        {
                            name: "⠀",
                            value: `:gem: **${client.tls.phrase(user, "util.steam.conquistas")}**\n:tropical_drink: **${client.tls.phrase(user, "game.pula.progresso")} ${datas_pula.conquistas} / ${datas_pula.consquistas_total}**`,
                            inline: true
                        }
                    )

                if (parseInt(datas_pula.recorde) > 0)
                    embed.setDescription(`\`\`\`${client.tls.phrase(user, "game.pula.recorde", null, [client.locale(datas_pula.recorde), (datas_pula.distancia_percorrida / 1000).toFixed(2)])}\`\`\``)

                interaction.reply({
                    embeds: [embed],
                    components: [row],
                    ephemeral: client.decider(user?.conf.ghost_mode, 0)
                })
            })
            .catch(() => client.tls.reply(interaction, user, "game.pula.error_2", true, client.emoji(0)))
    }
}