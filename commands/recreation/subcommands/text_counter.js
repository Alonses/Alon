const { EmbedBuilder } = require('discord.js')

module.exports = async ({ client, interaction, texto_entrada }) => {
    const user = await client.getUser(interaction.user.id, {
        conf: true,
        misc: true
    })
    // Contador de caracteres e palavras
    const palavras = texto_entrada.split(" ").length
    const caracteres_c = texto_entrada.length
    const caracteres_s = texto_entrada.replaceAll(" ", "").length

    const vogais = contarVogais(texto_entrada)

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(user, "dive.counter.titulo"))
        .setColor(client.embed_color(user.misc.color))
        .setDescription(`${client.tls.phrase(user, "dive.counter.entrada")} \`\`\`fix\n${texto_entrada.length > 300 ? `${texto_entrada.slice(0, 295)}...` : texto_entrada}\`\`\``)
        .addFields(
            {
                name: `${client.defaultEmoji("types")} **${client.tls.phrase(user, "dive.counter.caracteres")}**`,
                value: `:milky_way: **${client.tls.phrase(user, "dive.counter.com_espaco")}** \`${caracteres_c}\`\n:newspaper: **${client.tls.phrase(user, "dive.counter.sem_espaco")}** \`${caracteres_s}\``,
                inline: true
            },
            {
                name: `:speech_balloon: **${client.tls.phrase(user, "dive.counter.curiosidades")}**`,
                value: `${client.defaultEmoji("vowels")} **${client.tls.phrase(user, "dive.counter.vogais")}** \`${vogais[0]}\`\n${client.defaultEmoji("consonants")} **${client.tls.phrase(user, "dive.counter.consoantes")}** \`${vogais[1]}\``,
                inline: true
            },
            {
                name: `${client.defaultEmoji("metrics")} **${client.tls.phrase(user, "dive.counter.palavras")}**`,
                value: `:scales: **${client.tls.phrase(user, "dive.counter.quantidade")}** \`${palavras}\`\n${client.defaultEmoji("numbers")} **${client.tls.phrase(user, "dive.counter.numeros")}** \`${vogais[2]}\``,
                inline: true
            }
        )

    interaction.reply({
        embeds: [embed],
        ephemeral: client.decider(user?.conf.ghost_mode, 0)
    })
}

const contarVogais = (palavra) => {
    let totalVogal = 0, totalConsoantes = 0, totalNumeros = 0
    const vogais = ['a', 'e', 'i', 'o', 'u']

    for (let i = 0; i < palavra.length; i++)
        if (vogais.indexOf(palavra[i]) !== -1) {
            totalVogal++
        } else if (!isNaN(parseInt(palavra[i]))) {
            totalNumeros++
        } else if (palavra[i] !== " ")
            totalConsoantes++

    return [totalVogal, totalConsoantes, totalNumeros]
}