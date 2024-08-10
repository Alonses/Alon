const {addMoney} = require("../../core/database/schemas/User")

const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

const { padrao_forca } = require('../../core/formatters/patterns/game')

const games = new Map()

module.exports = {
    data: new SlashCommandBuilder()
        .setName("forca")
        .setDescription("⌠🎲|🇧🇷⌡ O jogo da forca!")
        .addStringOption(option =>
            option.setName("entrada")
                .setDescription("Uma letra ou a palavra inteira!")),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, {
            conf: true,
            misc: true
        })
        if (!games[interaction.user.id]) {
            fetch('https://api.dicionario-aberto.net/random')
                .then(res => res.json())
                .then(dados => {

                    const palavra_escolhida = dados.word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")

                    games[interaction.user.id] = {
                        word: palavra_escolhida,
                        descobertas: lista_posicoes(dados.word),
                        erros: 0,
                        entradas: [],
                        finalizado: false
                    }

                    retorna_jogo(client, interaction, user)
                })
        } else {

            // Acionado caso seja escrito algo para o chute da palavra
            if (interaction.options.data.length === 1) {
                const entrada = interaction.options.getString("entrada").toLowerCase()

                await verifica_chute(client, entrada, interaction, user)
            }

            // Verifica se o jogo ainda existe
            if (games[interaction.user.id])
                await retorna_jogo(client, interaction, user)
        }
    }
}

const verifica_chute = async (client, entrada, interaction, user) => {

    const split = games[interaction.user.id].word.split("")

    let acerto = false
    let descobertas = games[interaction.user.id].descobertas.split(" ")

    if (entrada.length === 1) { // Chutando por letras

        // Barra caso a letra já tenha sido informada
        if (!games[interaction.user.id].entradas.includes(entrada)) {
            for (let i = 0; i < split.length; i++) {
                if (entrada === split[i]) {
                    descobertas[i] = `\`${entrada}\``

                    acerto = true
                }
            }

            games[interaction.user.id].entradas.push(entrada)
            games[interaction.user.id].descobertas = descobertas.join(" ")

            if (!acerto)
                games[interaction.user.id].erros++

            await verifica_palavra(client, interaction, user, entrada)

            if (games[interaction.user.id].finalizado) {
                delete games[interaction.user.id]
            }
        }
    } else { // Chute pela palavra inteira
        await verifica_palavra(client, interaction, user, entrada)

        if (games[interaction.user.id].finalizado) {
            delete games[interaction.user.id]
        }
    }
}

const verifica_palavra = async (client, interaction, user, entrada) => {

    // Verifica se a palavra foi completa ou se o chute foi certeiro
    if (entrada === games[interaction.user.id].word || client.replace(games[interaction.user.id].descobertas, null, ["`", "'"]).replaceAll(" ", "") === games[interaction.user.id].word) {
        interaction.reply({
            content: `${client.emoji("emojis_negativos")} ${client.tls.phrase(user, "game.forca.acertou")} \`${games[interaction.user.id].word}\`\n\n${client.tls.phrase(user, "game.forca.bufunfas")}`,
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })

        games[interaction.user.id].finalizado = true

        await addMoney(client, user, 50)

        client.registryStatement(user.id, "misc.b_historico.jogos_forca", true, 150)
        client.journal("gerado", 150)

    } else if (entrada.length > 1 || games[interaction.user.id].erros >= 7) {
        interaction.reply({
            content: `${client.emoji("emojis_dancantes")} ${client.tls.phrase(user, "game.forca.errou")} \`${games[interaction.user.id].word}\``,
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })

        games[interaction.user.id].finalizado = true
    }
}

const lista_posicoes = (palavra) => {

    let array = []

    for (let i = 0; i < palavra.length; i++)
        array.push("`_`")

    return array.join(" ")
}

const painel_jogo = (interaction) => {
    return `\`\`\`${padrao_forca[games[interaction.user.id].erros]}\`\`\``
}

const retorna_jogo = async (client, interaction, user) => {

    const painel = painel_jogo(interaction)
    let entradas = ""

    // Entradas que o usuário tentou
    if (games[interaction.user.id].entradas.length > 0)
        entradas = `\n${client.tls.phrase(user, "game.forca.usado")}\`\`\`${games[interaction.user.id].entradas.join(", ")}\`\`\``

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "game.forca.titulo"))
        .setColor(client.embed_color(user.misc.color))
        .setDescription(`${games[interaction.user.id].descobertas} ${painel} ${entradas}\n${client.tls.phrase(user, "game.forca.comando")}`)
        .setFooter({
            text: `${client.tls.phrase(user, "game.forca.tentativas")} ${(7 - games[interaction.user.id].erros)}`
        })

    interaction.reply({
        embeds: [embed],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}