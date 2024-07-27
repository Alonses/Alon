const { SlashCommandBuilder } = require('discord.js')

const { getTicket } = require('../../core/database/schemas/User_tickets')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("complaint")
        .setNameLocalizations({
            "de": 'beschwerde',
            "es-ES": 'queja',
            "fr": 'plainte',
            "it": 'rimostranza',
            "pt-BR": 'denuncia',
            "ru": 'жалоба'
        })
        .setDescription("⌠💂⌡ Report something!")
        .addSubcommand(subcommand =>
            subcommand
                .setName("start")
                .setNameLocalizations({
                    "es-ES": 'comenzar',
                    "fr": 'commencer',
                    "it": 'iniziare',
                    "pt-BR": 'iniciar',
                    "ru": 'начать'
                })
                .setDescription("⌠💂⌡ Start a report chat")
                .setDescriptionLocalizations({
                    "de": '⌠💂⌡ Starten Sie Ihren Meldechat',
                    "es-ES": '⌠💂⌡ Iniciar un chat de informe',
                    "fr": '⌠💂⌡ Démarrer un canal de signalement',
                    "it": '⌠💂⌡ Avvia una chat di report',
                    "pt-BR": '⌠💂⌡ Inicie um chat de denúncia',
                    "ru": '⌠💂⌡ Начать канал жалоб'
                }))
        .addSubcommand(subcommand =>
            subcommand
                .setName("close")
                .setNameLocalizations({
                    "es-ES": 'cerrar',
                    "fr": 'fermer',
                    "it": 'chiudere',
                    "pt-BR": 'fechar',
                    "ru": 'закрывать'
                })
                .setDescription("⌠💂⌡ Close your report chat")
                .setDescriptionLocalizations({
                    "de": '⌠💂⌡ Beenden Sie Ihren Meldechat',
                    "es-ES": '⌠💂⌡ Termina tu chat de informe',
                    "fr": '⌠💂⌡ Terminer le chat de signalement',
                    "it": '⌠💂⌡ Termina la chat di segnalazione',
                    "pt-BR": '⌠💂⌡ Encerre seu chat de denúncia',
                    "ru": '⌠💂⌡ Закрыть чат жалоб'
                })),
    async execute({ client, user, interaction }) {

        const guild = await client.getGuild(interaction.guild.id)

        // Verificando se as denúncias em canais privados estão ativas no servidor
        if (!guild.conf_tickets)
            return client.tls.reply(interaction, user, "mode.denuncia.desativado", true, 3)

        const channel = await getTicket(interaction.guild.id, interaction.user.id)
        const solicitante = await client.getMemberGuild(interaction, interaction.user.id)

        // Buscando os dados do canal no servidor
        const canal_servidor = interaction.guild.channels.cache.find(c => c.id === channel.cid)

        // Solicitando a função e executando
        require(`./subcommands/complaint_${interaction.options.getSubcommand()}`)({ client, user, interaction, channel, solicitante, canal_servidor })
    }
}