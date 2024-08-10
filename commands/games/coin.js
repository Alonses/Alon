const { SlashCommandBuilder } = require('discord.js')
const {addMoney} = require("../../core/database/schemas/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("coin")
        .setDescription("⌠🎲⌡ Play heads or tails")
        .setDescriptionLocalizations({
            "de": '⌠🎲⌡ Spielen Sie Kopf oder Zahl',
            "es-ES": '⌠🎲⌡ Juega cara o cruz',
            "fr": '⌠🎲⌡ Jouez à pile ou face',
            "it": '⌠🎲⌡ Gioca testa o croce',
            "pt-BR": '⌠🎲⌡ Jogue cara ou coroa',
            "ru": '⌠🎲⌡ Играть орлом или решкой'
        })
        .addStringOption(option =>
            option.setName("choise")
                .setNameLocalizations({
                    "de": 'auswahl',
                    "es-ES": 'eleccion',
                    "fr": 'choix',
                    "it": 'scelta',
                    "pt-BR": 'escolha',
                    "ru": 'выбор'
                })
                .setDescription("Heads or tails?")
                .setDescriptionLocalizations({
                    "de": 'Kopf oder Zahl?',
                    "es-ES": '¿Cara o cruz?',
                    "fr": 'Pile ou face?',
                    "it": 'Testa o croce?',
                    "pt-BR": 'Cara ou coroa?',
                    "ru": 'Орел или решка?'
                })
                .addChoices(
                    { name: '🟡', value: '0' },
                    { name: '👑', value: '1' }
                )
                .setRequired(true))
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
                .setMaxValue(200)),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, {
            conf: true,
            misc: true
        })

        const escolha = parseInt(interaction.options.getString("choise"))
        const bet = interaction.options.getNumber("bet") ?? 0

        if (bet && bet > user.misc.money) // Sem Bufunfas para poder apostar
            return client.tls.reply(interaction, user, "game.jokenpo.erro_aposta", true, [9, 4])

        const moeda = Math.round(Math.random())
        let emoji_exib = ":coin:", profit = bet

        if (moeda === 1)
            emoji_exib = ":crown:"

        let resultado = `[ ${emoji_exib} ] ${client.tls.phrase(user, "game.cara.acertou")} ${client.emoji("emojis_dancantes")}\n[Lucro: \`B$ ${profit}\`]`

        if (escolha !== moeda) { // Errou
            profit = -bet
            resultado = `[ ${emoji_exib} ] ${client.tls.phrase(user, "game.cara.errou")} ${client.emoji("epic_embed_fail2")}\n[Lucro: \`B$ ${profit}\`]`
        }

        await addMoney(client, user, profit)

        // Registrando as movimentações de bufunfas para o usuário
        if (profit > 0) {
            await client.registryStatement(user.id, "misc.b_historico.jogos_cara", true, profit)
            await client.journal("gerado", profit)
        } else if (profit < 0) {
            await client.registryStatement(user.id, "misc.b_historico.jogos_cara", false, profit * -1)
            await client.journal("reback", profit * -1)
        }

        interaction.reply({
            content: resultado,
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    }
}