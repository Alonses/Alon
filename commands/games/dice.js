const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dice")
        .setNameLocalizations({
            "de": 'würfel',
            "es-ES": 'dado',
            "fr": 'des',
            "it": 'dadi',
            "pt-BR": 'dado',
            "ru": 'отданный'
        })
        .setDescription("⌠🎲⌡ Roll one or more dice")
        .setDescriptionLocalizations({
            "de": '⌠🎲⌡ Drehe einen oder mehrere Würfel',
            "es-ES": '⌠🎲⌡ Rotar uno o más dados',
            "fr": '⌠🎲⌡ Tourner un ou plusieurs dés',
            "it": '⌠🎲⌡ Tira uno o più dadi',
            "pt-BR": '⌠🎲⌡ Rodar um ou vários dados',
            "ru": '⌠🎲⌡ Поверните один или несколько кубиков'
        })
        .addIntegerOption(option =>
            option.setName("amount")
                .setNameLocalizations({
                    "de": 'menge',
                    "es-ES": 'monto',
                    "fr": 'montant',
                    "it": 'quantita',
                    "pt-BR": 'quantia',
                    "ru": 'количество'
                })
                .setDescription("The amount of dice to roll")
                .setDescriptionLocalizations({
                    "de": 'Die Anzahl der zu würfelnden Würfel',
                    "es-ES": 'La cantidad de dados a tirar',
                    "fr": 'Le nombre de dés à lancer',
                    "it": 'La quantità di dadi da lanciare',
                    "pt-BR": 'A quantia de dados para rolar',
                    "ru": 'Количество костей для броска'
                })
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName("faces")
                .setNameLocalizations({
                    "de": 'gesichter',
                    "es-ES": 'caras',
                    "fr": 'visages',
                    "it": 'facce',
                    "ru": 'лица'
                })
                .setDescription("Number of dice faces")
                .setDescriptionLocalizations({
                    "de": 'Anzahl der Würfelflächen',
                    "es-ES": 'Número de caras de dados',
                    "fr": 'Nombre de faces de dés',
                    "it": 'Numero di facce dei dadi',
                    "pt-BR": 'Número da faces dos dados',
                    "ru": 'Количество граней игральных костей'
                })
                .setMinValue(4)
                .setMaxValue(120)
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName("accrual")
                .setNameLocalizations({
                    "de": 'hinzufügen',
                    "es-ES": 'agregar',
                    "fr": 'ajouter',
                    "it": 'inserisci',
                    "pt-BR": 'acrescimo',
                    "ru": 'добавить'
                })
                .setDescription("Add in the sum")
                .setDescriptionLocalizations({
                    "de": 'Addieren Sie die Summe',
                    "es-ES": 'Agregar la suma',
                    "fr": 'Ajouter la somme',
                    "it": 'Aggiungi la somma',
                    "pt-BR": 'Acrescentar a somatória',
                    "ru": 'добавить к сумме'
                })
                .setMinValue(1)
                .setMaxValue(50000)),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, { conf: true })

        const qtd_dados = interaction.options.getInteger("amount")
        const qtd_faces = interaction.options.getInteger("faces")
        const acrescimo = interaction.options.getInteger("accrual") || 0

        const faces = []
        let somatoria = 0

        for (let i = 1; i < qtd_dados + 1; i++) {

            const num = client.random(qtd_faces)
            somatoria += num

            if (i < qtd_dados)
                faces.push(`${num}, `)
            else
                faces.push(num)

            if (qtd_dados < 40) {
                if (i % 4 === 0 && i !== 0)
                    faces.push("\n")
            } else
                if (i % 10 === 0 && i !== 0)
                    faces.push("\n")
        }

        if (acrescimo > 0)
            somatoria = `[ ${somatoria} ] + ${acrescimo} ⇁ ${client.locale(somatoria + acrescimo)}`
        else
            somatoria = client.locale(somatoria)

        interaction.reply({
            content: `${client.emoji("dice")} ${qtd_dados}d${qtd_faces} | \`${somatoria}\` |\n\`\`\`${faces.join("")}\`\`\``,
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    }
}