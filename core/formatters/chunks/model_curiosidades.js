const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { AttachmentBuilder } = require('discord.js')

module.exports = async (client, user, interaction) => {

    fetch(`${process.env.url_apisal}/curiosidades`)
        .then(response => response.json())
        .then(async res => {

            let descricao_curio = res.texto

            if (res.data_curio) // Imagem da curiosidade
                if (res.data_curio.includes("youtu.be"))
                    descricao_curio = `${res.texto}\n${res.data_curio}`
                else {
                    if (!res.data_curio.includes("tenor.com")) { // Imagens em anexo
                        const file = new AttachmentBuilder(res.data_curio, `image.jpeg`)

                        if (interaction)
                            interaction.reply({
                                content: `〽️ | ${descricao_curio}`,
                                files: [file],
                                ephemeral: client.decider(user?.conf.ghost_mode, 0)
                            })
                        else client.sendDM(user.id, { content: `〽️ | ${descricao_curio}`, files: [file] }, true)
                    } else // Gifs
                        if (interaction)
                            interaction.reply({
                                content: `〽️ | ${descricao_curio}\n${res.data_curio}`,
                                ephemeral: client.decider(user?.conf.ghost_mode, 0)
                            })
                        else client.sendDM(user.id, { content: `〽️ | ${descricao_curio}\n${res.data_curio}` }, true)

                    return
                }

            if (interaction) // Enviando um texto normal sem arquivos anexados
                interaction.reply({
                    content: `〽️ | ${descricao_curio}`,
                    ephemeral: client.decider(user?.conf.ghost_mode, 0)
                })
            else client.sendDM(user.id, { content: `〽️ | ${descricao_curio}` }, true)
        })
}