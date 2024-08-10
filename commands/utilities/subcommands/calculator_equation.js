const math = require('mathjs')
const { isInteger } = require('mathjs')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, { conf: true })
    const expressao = interaction.options.getString("equation")

    await interaction.deferReply({ ephemeral: client.decider(user?.conf.ghost_mode, 0) })

    if (expressao.length < 2)
        return client.tls.editReply(interaction, user, "util.calc.aviso_1")

    try {
        let resultado = math.evaluate(expressao)
        let emoji_res = "📈"

        if (resultado < 0)
            emoji_res = "📉"

        if (!isInteger(resultado))
            resultado = resultado.toFixed(6)

        return interaction.editReply({
            content: `${client.tls.phrase(user, "util.calc.resultado", emoji_res)}: \`${client.locale(resultado)}\``,
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    } catch {
        return interaction.editReply({
            content: `${client.tls.phrase(user, "util.calc.error", client.emoji(0))}: \`${expressao}\``,
            ephemeral: true
        })
    }
}