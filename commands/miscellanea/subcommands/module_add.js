const { EmbedBuilder } = require('discord.js')

const { verifyUserModules, createModule, updateModule} = require('../../../core/database/schemas/User_modules')
const { getModulesPrice } = require('../../../core/database/schemas/User_modules')

const { modulePrices } = require('../../../core/formatters/patterns/user')

const formata_horas = require('../../../core/formatters/formata_horas')

module.exports = async ({ client, user, interaction }) => {

    if (user.misc.money < 20)
        return client.tls.reply(interaction, user, "misc.modulo.sem_bufunfa", true, client.emoji(0))

    const type = parseInt(interaction.options.getString("choice"))

    // Verificando quantos módulos de um tipo existem para o usuário
    const modulos_semelhantes = await verifyUserModules(interaction.user.id, type)

    if (modulos_semelhantes.length > 2)
        return client.tls.reply(interaction, user, "misc.modulo.limite_modulos", true, 4)

    // Prevenção de erros
    if (type == 0 && !user.misc.locale)
        return client.tls.reply(interaction, user, "misc.modulo.sem_locale", true, client.emoji(0))

    const corpo_modulo = await createModule(client, interaction.user.id, type)
    const timestamp = client.timestamp()

    if (modulePrices[type]) // Módulos com preços diferentes
        corpo_modulo.price = modulePrices[type]

    corpo_modulo.days = interaction.options.getString("when")
    corpo_modulo.hour = formata_horas(interaction.options.getInteger("hour") || '0', interaction.options.getInteger("minute") || '0')
    corpo_modulo.timestamp = timestamp

    await updateModule(client, corpo_modulo.id, corpo_modulo)

    const ativacao_modulo = `${client.tls.phrase(user, `misc.modulo.ativacao_${corpo_modulo.days}`)} ${corpo_modulo.hour}`
    const montante = await getModulesPrice(client, interaction.user.id)

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "misc.modulo.cabecalho_menu"))
        .setColor(client.embed_color(user.misc.color))
        .setDescription(client.tls.phrase(user, "misc.modulo.descricao", null, [corpo_modulo.price, montante]))
        .addFields(
            {
                name: `${client.defaultEmoji("types")} **${client.tls.phrase(user, "misc.modulo.tipo")}**`,
                value: `\`${client.tls.phrase(user, `misc.modulo.modulo_${corpo_modulo.type}`)}\``,
                inline: true
            },
            {
                name: `${client.defaultEmoji("time")} **${client.tls.phrase(user, "misc.modulo.ativacao")}**`,
                value: `\`${ativacao_modulo}\``,
                inline: true
            },
            {
                name: `${client.defaultEmoji("money")} **${client.tls.phrase(user, "misc.modulo.valor")}**`,
                value: `\`B$ ${corpo_modulo.price}\``,
                inline: true
            }
        )
        .setFooter({
            text: client.tls.phrase(user, "menu.botoes.selecionar_operacao"),
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    // Criando os botões para o menu de badges
    const row = client.create_buttons([
        { id: "module", name: client.tls.phrase(user, "menu.botoes.confirmar"), type: 2, emoji: client.emoji(10), data: `1|${timestamp}` },
        { id: "module", name: client.tls.phrase(user, "menu.botoes.cancelar"), type: 3, emoji: client.emoji(0), data: `0|${timestamp}` }
    ], interaction)

    return interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
    })
}