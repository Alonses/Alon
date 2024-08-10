const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mine")
        .setDescription("⌠💡⌡ Minecraft!")
        .addSubcommand(subcommand =>
            subcommand.setName("item")
                .setDescription("⌠💡⌡ Search Minecraft items")
                .setDescriptionLocalizations({
                    "de": '⌠💡⌡ Suche nach Minecraft-Gegenständen',
                    "es-ES": '⌠💡⌡ Buscar elementos de Minecraft',
                    "fr": '⌠💡⌡ Rechercher des articles Minecraft',
                    "it": '⌠💡⌡ Cerca oggetti Minecraft',
                    "pt-BR": '⌠💡⌡ Pesquise itens do Minecraft',
                    "ru": '⌠💡⌡ Найди предметы в майнкрафте'
                })
                .addStringOption(option =>
                    option.setName("item")
                        .setDescription("Insert an item")
                        .setDescriptionLocalizations({
                            "de": 'Geben Sie einen Namen ein',
                            "es-ES": 'Insertar un artículo',
                            "fr": 'Insérer un élément',
                            "it": 'Inserire un elemento',
                            "pt-BR": 'Insira um item',
                            "ru": 'поиск элемента'
                        })))
        // .addSubcommand(subcommand =>
        //     subcommand.setName("chunk")
        //         .setDescription("⌠🎲⌡ See your position in the current chunk")
        //         .setDescriptionLocalizations({
        //             "de": '⌠🎲⌡ Sehen Sie sich Ihre Position im aktuellen Block an',
        //             "es-ES": '⌠🎲⌡ Ver su posición en el fragmento actual',
        //             "fr": '⌠🎲⌡ Voir votre position dans le morceau actuel',
        //             "it": '⌠🎲⌡ Visualizza la tua posizione nel blocco corrente',
        //             "pt-BR": '⌠🎲⌡ Veja sua posição na chunk atual',
        //             "ru": '⌠🎲⌡ Посмотрите свою позицию в текущем фрагменте',
        //         })
        //         .addIntegerOption(option =>
        //             option.setName("x")
        //                 .setDescription("The x position")
        //                 .setDescriptionLocalizations({
        //                     "de": 'Die x-Position',
        //                     "es-ES": 'La posición de x',
        //                     "fr": 'La position de x',
        //                     "it": 'La posizione di x',
        //                     "pt-BR": 'A posição x',
        //                     "ru": 'Позиция х'
        //                 })
        //                 .setRequired(true))
        //         .addIntegerOption(option =>
        //             option.setName("z")
        //                 .setDescription("The z position in the current dimension")
        //                 .setDescriptionLocalizations({
        //                     "de": 'Die z-Position',
        //                     "es-ES": 'La posición de z',
        //                     "fr": 'La position de z',
        //                     "it": 'La posizione di z',
        //                     "pt-BR": 'A posição z',
        //                     "ru": 'Положение z'
        //                 })
        //                 .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName("portal")
                .setDescription("⌠🎲⌡ View the coordinate for a portal")
                .setDescriptionLocalizations({
                    "de": '⌠🎲⌡ Sehen Sie sich die Koordinaten eines Portals an',
                    "es-ES": '⌠🎲⌡ Ver las coordenadas de un portal',
                    "fr": '⌠🎲⌡ Voir les coordonnées d\'un portail',
                    "it": '⌠🎲⌡ Vedi le coordinate di un portale',
                    "pt-BR": '⌠🎲⌡ Veja a coordenada para um portal',
                    "ru": '⌠🎲⌡ Посмотреть координаты портала',
                })
                .addIntegerOption(option =>
                    option.setName("x")
                        .setDescription("The x position in the current dimension")
                        .setDescriptionLocalizations({
                            "de": 'Die Position von x in der aktuellen Dimension',
                            "es-ES": 'La posición de x en la dimensión actual',
                            "fr": 'La position de x dans la dimension actuelle',
                            "it": 'La posizione di x nella dimensione corrente',
                            "pt-BR": 'A posição x na dimensão atual',
                            "ru": 'Положение x в текущем измерении'
                        })
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName("z")
                        .setDescription("The z position in the current dimension")
                        .setDescriptionLocalizations({
                            "de": 'Die Position von z in der aktuellen Dimension',
                            "es-ES": 'La posición de z en la dimensión actual',
                            "fr": 'La position de z dans la dimension actuelle',
                            "it": 'La posizione di z nella dimensione corrente',
                            "pt-BR": 'A posição z na dimensão atual',
                            "ru": 'Положение z в текущем измерении'
                        })
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName("destiny")
                        .setNameLocalizations({
                            "de": 'ziel',
                            "es-ES": 'destino',
                            "fr": 'destin',
                            "it": 'destino',
                            "pt-BR": 'destino',
                            "ru": 'судьба',
                        })
                        .setDescription("Where do you want to go?")
                        .setDescriptionLocalizations({
                            "de": 'Wohin willst du gehen?',
                            "es-ES": '¿A donde quieres ir?',
                            "fr": 'Où veux-tu aller?',
                            "it": 'Dove vuoi andare?',
                            "pt-BR": 'Para onde deseja ir?',
                            "ru": 'Куда ты хочешь пойти?'
                        })
                        .addChoices(
                            { name: '🍀 Overworld', value: '0' },
                            { name: '🔥 Nether', value: '1' }
                        ))),
    async execute({ client, interaction }) {

        // Redirecionando o evento
        if (interaction.options.getSubcommand() === "item")
            return require('../../core/formatters/chunks/model_mine')(client, interaction)

        require(`./subcommands/mine_${interaction.options.getSubcommand()}`)({ client, interaction })
    }
}