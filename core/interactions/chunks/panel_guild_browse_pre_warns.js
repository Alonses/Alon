const { EmbedBuilder } = require('discord.js')

const { listAllUserPreWarns } = require('../../database/schemas/User_pre_warns')

module.exports = async ({ client, interaction, dados, pagina_guia }) => {
    const user = await client.getUser(interaction.user.id, { misc: true })

    let member = interaction.options?.getUser("user") || dados
    const user_notes = await listAllUserPreWarns(client, member.id, interaction.guild.id)

    pagina_guia = pagina_guia || 0

    if (user_notes.length < 1)
        return interaction.reply({
            content: client.tls.phrase(user, "mode.warn.sem_advertencia", 1),
            ephemeral: true
        })

    const embed = new EmbedBuilder()
        .setTitle(`${client.tls.phrase(user, "mode.anotacoes.titulo", null, user_notes[0].nick)} ${client.defaultEmoji("pen")}`)
        .setColor(client.embed_color(user.misc.color))
        .setFooter({
            text: client.tls.phrase(user, "mode.anotacoes.descricao_rodape_selecao"),
            iconURL: interaction.user.avatarURL({ dynamic: true })
        })

    let botoes = []
    let indice_start = pagina_guia * 4 || 0

    // Acrescenta um indice para evitar duplicatas
    if (pagina_guia > 0) indice_start++

    if (user_notes[indice_start + 6])
        botoes = botoes.concat({ id: "pre_warn_user_verify", name: client.tls.phrase(user, "status.proxima"), emoji: client.emoji(41), type: 0, data: `10|${user_notes[0].user_id}.${pagina_guia}` })
    else if (user_notes.length > 5)
        botoes = botoes.concat({ id: "pre_warn_user_verify", name: client.tls.phrase(user, "menu.botoes.retornar"), emoji: client.emoji(57), type: 0, data: `11|${user_notes[0].user_id}` })

    for (let x = indice_start; x < user_notes.length; x++) {

        botoes = botoes.concat({ id: "pre_warn_user_verify", name: `${x + 1}°`, emoji: client.defaultEmoji("guard"), type: 1, data: `9|${user_notes[x].user_id}.${user_notes[x].timestamp}` })

        if (x === (indice_start + 3)) break
    }

    client.reply(interaction, {
        content: "",
        embeds: [embed],
        components: [client.create_buttons(botoes, interaction)],
        ephemeral: true
    })
}