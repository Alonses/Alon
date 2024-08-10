const { EmbedBuilder } = require('discord.js')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id, {
        conf: true,
        misc: true
    })
    const x = interaction.options.getInteger("x")
    const z = interaction.options.getInteger("z")

    const x_chunk = Math.abs(x % 16)
    const z_chunk = Math.abs(z % 16)

    const chunk = []

    let i = x < 0 ? 15 : 0
    let final = i === 15 ? 0 : 16

    while (i < final) {

        let linha = ""
        k = z < 0 ? 15 : 0

        while (k < final) {
            if (x_chunk === i && z_chunk === k)
                linha += "x "
            else
                linha += "- "

            k++
        }

        chunk.push(linha)
        i++
    }

    const embed = new EmbedBuilder()
        .setTitle("> Sua posição na chunk")
        .setColor(client.embed_color(user.misc.color))
        .setDescription(`${client.defaultEmoji("earth")} **Coordenadas:** X: \`${x}\`, Z: \`${z}\`\n\n**Dentro da chunk:** X: \`${x_chunk}\`, Z: \`${z_chunk}\`\n\`\`\`${chunk.join("\n")}\`\`\``)

    interaction.reply({
        embeds: [embed],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}