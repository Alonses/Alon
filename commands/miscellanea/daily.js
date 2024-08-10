const { SlashCommandBuilder } = require('discord.js')
const {updateUser} = require("../../core/database/schemas/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("⌠💸⌡ Receive your daily bufunfa")
        .setDescriptionLocalizations({
            "de": '⌠💸⌡ Holen Sie sich Ihr tägliches Bufunfa',
            "es-ES": '⌠💸⌡ Recibe tu bufunfa diario',
            "fr": '⌠💸⌡ Recevez votre bufunfa quotidien',
            "it": '⌠💸⌡ Ottieni la tua bufunfa quotidiana',
            "pt-BR": '⌠💸⌡ Pegue sua bufunfa diária',
            "ru": '⌠💸⌡ Получай свой ежедневный Bufunfa'
        }),
    async execute({ client, interaction }) {
        const user = await client.getUser(interaction.user.id, { misc: true })
        const date1 = new Date()
        let data_atual = date1.toDateString('pt-BR')

        if (data_atual === user.misc.daily) {
            const tempo_restante = Math.floor((date1.getTime() + (((23 - date1.getHours()) * 3600000) + ((60 - date1.getMinutes()) * 60000) + ((60 - date1.getSeconds()) * 1000))) / 1000)

            return client.tls.reply(interaction, user, "misc.daily.error", true, 9, tempo_restante)
        }

        const bufunfa = client.random(600, 1200)

        await client.prisma.userOptionsMisc.update({
            where: { id: user.misc_id },
            data: {
                money: { increment: bufunfa },
                daily: data_atual
            }
        })

        // Registrando as movimentações de bufunfas para o usuário
        await client.registryStatement(user.id, "misc.b_historico.daily", true, bufunfa)
        await client.journal("gerado", bufunfa)

        interaction.reply({
            content: `${client.tls.phrase(user, "misc.daily.daily", 14, client.locale(bufunfa))} ${client.emoji("emojis_dancantes")}`,
            ephemeral: true
        })
    }
}