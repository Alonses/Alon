const { SlashCommandBuilder } = require('discord.js')
const {addMoney} = require("../../core/database/schemas/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("jokenpo")
        .setDescription("⌠🎲⌡ Play jokenpo")
        .setDescriptionLocalizations({
            "de": '⌠🎲⌡ Spielen Sie Jokepo',
            "es-ES": '⌠🎲⌡ Juega jokenpo',
            "fr": '⌠🎲⌡ Jouer au jokenpo',
            "it": '⌠🎲⌡ Gioca a jokenpo',
            "pt-BR": '⌠🎲⌡ Jogue jokenpô',
            "ru": '⌠🎲⌡ Играть в Джокенпо'
        })
        .addStringOption(option =>
            option.setName("choice")
                .setNameLocalizations({
                    "de": 'auswahl',
                    "es-ES": 'eleccion',
                    "fr": 'choix',
                    "it": 'scelta',
                    "pt-BR": 'escolha',
                    "ru": 'выбор'
                })
                .setDescription("What's your choice?")
                .setDescriptionLocalizations({
                    "de": 'Was ist deine Wahl?',
                    "es-ES": '¿Cual es tu eleccion?',
                    "fr": 'Quel est ton choix?',
                    "it": 'Qual\'è la tua scelta?',
                    "pt-BR": 'Qual a sua escolha?',
                    "ru": 'Каков ваш выбор?'
                })
                .addChoices(
                    { name: '🗿', value: 'pedra' },
                    { name: '🧻', value: 'papel' },
                    { name: '✂️', value: 'tesoura' }
                ))
        .addNumberOption(option =>
            option.setName('bet')
                .setNameLocalizations({
                    "de": 'wette',
                    "es-ES": 'apuesta',
                    "fr": 'pari',
                    "it": 'scommessa',
                    "pt-BR": 'aposta',
                    "it": 'scommessa',
                    "ru": 'прогноз'
                })
                .setDescription('The amount to bet')
                .setDescriptionLocalizations({
                    "de": 'Wettbetrag',
                    "es-ES": 'La cantidad a apostar',
                    "fr": 'Le montant à miser',
                    "it": 'Valore della scommessa',
                    "pt-BR": 'A quantia que sera apostada',
                    "it": 'L\'importo da scommettere',
                    "ru": 'ценность ставки'
                })
                .setMinValue(0.01)
                .setMaxValue(1000)),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, {
            conf: true,
            misc: true
        })

        const idioma_definido = client.idioma.getLang(interaction)
        let jooj = ["pedra", "papel", "tesoura", "pedra"]

        const escolha = interaction.options.getString("choice")
            ?? jooj[client.random(2)]

        const bet = interaction.options.getNumber("bet") ?? 0

        if (bet && bet > user.misc.money) // Sem Bufunfas para poder apostar
            return client.tls.reply(interaction, user, "game.jokenpo.erro_aposta", true, [9, 4])

        const emojis = [":rock:", ":roll_of_paper:", ":scissors:", ":rock:"]

        let player = jooj.indexOf(escolha)
        let bot = client.random(2), ganhador = ":thumbsdown:", profit = -bet

        if (player === 0) player = 3
        if (bot === 0) bot = 3
        if (player === 3 && bot === 1) player = 0

        if (bot < player || (player === 1 && bot === 3)) {
            ganhador = ":trophy:"
            profit = bet
        }

        if (bot === player) {
            ganhador = ":infinity:"
            profit = 0
        }

        let mensagem = `Jokenpô! \n[ ${emojis[bot]} ] Bot\n[ ${emojis[player]} ] <- Você\n[ ${ganhador} ]\n[Lucro: \`B$ ${profit}\`]`

        if (idioma_definido !== "pt-br" && idioma_definido !== "al-br")
            mensagem = `Jokenpo! \n[ ${emojis[bot]} ] Bot\n[ ${emojis[player]} ] <- You\n[ ${ganhador} ]\n[Profit: \`B$ ${profit}\`]`

        await addMoney(client, user, profit)

        // Registrando as movimentações de bufunfas para o usuário
        if (profit > 0) {
            await client.registryStatement(user.id, "misc.b_historico.jogos_jokenpo", true, profit)
            client.journal("gerado", profit)
        } else if (profit < 0) {
            await client.registryStatement(user.id, "misc.b_historico.jogos_jokenpo", false, profit * -1)
            client.journal("reback", profit * -1)
        }

        interaction.reply({
            content: mensagem,
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    }
}