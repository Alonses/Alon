const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("color")
        .setDescription("⌠🎉⌡ Change your color")
        .setNameLocalizations({
            "de": 'farbe',
            "es-ES": 'color',
            "fr": 'couleur',
            "it": 'colore',
            "pt-BR": 'color',
            "ru": 'цвет'
        })
        .addSubcommand(subcommand =>
            subcommand
                .setName("static")
                .setDescription("⌠🎉⌡ Pre-defined colors")
                .setDescriptionLocalizations({
                    "de": '⌠🎉⌡ Vordefinierte Farben',
                    "es-ES": '⌠🎉⌡ Colores preestablecidos',
                    "fr": '⌠🎉⌡ Couleurs prédéfinies',
                    "it": '⌠🎉⌡ Colori preimpostati',
                    "pt-BR": '⌠🎉⌡ Cores pré-definidas',
                    "ru": '⌠🎉⌡ Предопределенные цвета'
                })
                .addStringOption(option =>
                    option.setName("color")
                        .setDescription("Change your profile color")
                        .setDescriptionLocalizations({
                            "de": 'Ändern Sie Ihre Profilfarbe',
                            "es-ES": 'Cambia el color de tu perfil',
                            "fr": 'Changer la couleur de votre profil',
                            "it": 'Cambia il colore del tuo profilo',
                            "pt-BR": 'Alterar a cor do seu perfil',
                            "ru": 'Изменить цвет профиля'
                        })
                        .addChoices(
                            { name: '🎈 Red B$ 300', value: 'red' },
                            { name: '🐶 Brown B$ 300', value: 'brown' },
                            { name: '🎃 Orange B$ 300', value: 'orange' },
                            { name: '🎁 Yellow B$ 300', value: 'yellow' },
                            { name: '🎄 Green B$ 300', value: 'green' },
                            { name: '🧪 Cyan B$ 300', value: 'cyan' },
                            { name: '💎 Blue B$ 300', value: 'blue' },
                            { name: '🔮 Purple B$ 300', value: 'purple' },
                            { name: '🌸 Magenta B$ 300', value: 'magenta' },
                            { name: '🧻 White B$ 400', value: 'white' },
                            { name: '🛒 Gray B$ 400', value: 'gray' },
                            { name: '🎮 Black B$ 400', value: 'black' },
                            { name: '💥 Random B$ 500', value: 'random' }
                        )
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("custom")
                .setDescription("⌠🎉⌡ Choose your color!")
                .setDescriptionLocalizations({
                    "de": '⌠🎉⌡ Wähle deine Farbe!',
                    "es-ES": '⌠🎉⌡ ¡Elige tu color!',
                    "fr": '⌠🎉⌡ Choisissez votre couleur!',
                    "it": '⌠🎉⌡ Scegli il tuo colore!',
                    "pt-BR": '⌠🎉⌡ Escolha sua cor!',
                    "ru": '⌠🎉⌡ Выбери свой цвет!'
                })
                .addIntegerOption(option => option.setName("r").setDescription("R").setRequired(true).setMaxValue(255).setMinValue(0))
                .addIntegerOption(option => option.setName("g").setDescription("G").setRequired(true).setMaxValue(255).setMinValue(0))
                .addIntegerOption(option => option.setName("b").setDescription("B").setRequired(true).setMaxValue(255).setMinValue(0))),
    async execute({ client, interaction }) {

        // Redirecionando o evento
        require(`./subcommands/color_${interaction.options.getSubcommand()}`)({ client, interaction })
    }
}