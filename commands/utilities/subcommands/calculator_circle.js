const { EmbedBuilder } = require('discord.js')

const math = require('mathjs')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, { misc: true })
    await interaction.deferReply({ ephemeral: true })

    const operacao = interaction.options.getString("input")
    let raio = interaction.options.getNumber("value"), descricao = ''

    if (operacao === "1") { // Diâmetro

        descricao = `html\n${client.defaultEmoji("metrics")} ${client.tls.phrase(user, "util.calc.etapas_entrada")} 🚫 ${client.tls.phrase(user, "util.calc.diametro")} = ${client.locale(raio)}\n${client.tls.phrase(user, "util.calc.ajustar_diametro")}\n\n${client.tls.phrase(user, "util.calc.formula_diametro")}: d = r * 2\n${client.tls.phrase(user, "util.calc.formula_ajustada")}: r = d / 2 (${client.tls.phrase(user, "util.calc.isolase_raio")})\n${client.tls.phrase(user, "util.calc.na_conta")}: r = ${client.locale(raio)} / 2`

        raio = raio / 2
        descricao += `\n↳ r = ${client.locale(raio)}`
    }

    if (operacao === "2") { // Perímetro

        descricao = `html\n${client.defaultEmoji("metrics")} ${client.tls.phrase(user, "util.calc.etapas_entrada")} ⭕ ${client.tls.phrase(user, "util.calc.perimetro")} = ${client.locale(raio)}\n${client.tls.phrase(user, "util.calc.ajustar_perimetro")}\n\n${client.tls.phrase(user, "util.calc.formula_perimetro")}: p = r * π * 2\n${client.tls.phrase(user, "util.calc.formula_ajustada")}: r = p / (2 * π) (${client.tls.phrase(user, "util.calc.isolase_raio")})\n${client.tls.phrase(user, "util.calc.na_conta")}: r = ${client.locale(raio)} / (2 * π)`

        raio = raio / (2 * math.pi)
        descricao += `\n↳ r = ${client.locale(raio)}`
    }

    if (operacao === "3") { // Área

        descricao = `html\n${client.defaultEmoji("metrics")} ${client.tls.phrase(user, "util.calc.etapas_entrada")} ⚪ ${client.tls.phrase(user, "util.calc.area")} = ${client.locale(raio)}\n${client.tls.phrase(user, "util.calc.ajustar_area")}\n\n${client.tls.phrase(user, "util.calc.formula_area")}: a = π * r²\n${client.tls.phrase(user, "util.calc.formula_ajustada")}: r² = a / π (${client.tls.phrase(user, "util.calc.isolase_raio")})\n${client.tls.phrase(user, "util.calc.na_conta")}: r² = ${client.locale(raio)} / π`

        raio = raio / math.pi
        descricao += `\n↳ r² = ${client.locale(raio)}\n\n${client.tls.phrase(user, "util.calc.tirar_raiz")}: r = √${client.locale(raio)}`
        raio = math.sqrt(raio)

        descricao += `\n↳ r = ${client.locale(raio)}`
    }

    if (descricao !== "")
        descricao = `\`\`\`${descricao}\n\n${client.tls.phrase(user, "util.calc.formulas_abaixo")}\`\`\`\n`

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "util.calc.resultados"))
        .setColor(client.embed_color(user.misc.color))
        .setDescription(`${descricao}🕛 **${client.tls.phrase(user, "util.calc.raio")}:** \`${client.locale(raio)}\`\n\n🚫 **${client.tls.phrase(user, "util.calc.diametro")}:** \`${client.locale(raio * 2)}\`\n${client.tls.phrase(user, "util.calc.formula")}: \`d = r * 2\`\n\n⭕ **${client.tls.phrase(user, "util.calc.perimetro")}:** \`${client.locale(raio * math.pi * 2)}\`\n${client.tls.phrase(user, "util.calc.formula")}: \`p = r * π * 2\`\n\n⚪ **${client.tls.phrase(user, "util.calc.area")}:** \`${client.locale(math.pi * raio * raio)}\`\n${client.tls.phrase(user, "util.calc.formula")}: \`a = π * r²\``)
        .setFooter({
            text: (`π = 3,1415...; r = ${client.tls.phrase(user, "util.calc.raio")}; d = ${client.tls.phrase(user, "util.calc.diametro")}; p = ${client.tls.phrase(user, "util.calc.perimetro")}; a = ${client.tls.phrase(user, "util.calc.area")}`).toLowerCase(),
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    interaction.editReply({
        embeds: [embed],
        ephemeral: true
    })
}