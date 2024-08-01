const { EmbedBuilder, AttachmentBuilder } = require('discord.js')

const Canvas = require('@napi-rs/canvas')

const usersmap = new Map()

module.exports = async ({ client, guild, user, dados }) => {

    const user_alvo = dados[0].user
    let foto_antiga, foto_nova, attachment, canvas

    try { // Tentando gerar um canvas com as fotos alteradas
        canvas = Canvas.createCanvas(680, 340)
        const context = canvas.getContext('2d')

        // Carregando as imagens de perfil do usuário
        foto_antiga = await Canvas.loadImage(user.profile.avatar)
        foto_nova = await Canvas.loadImage(user_alvo.displayAvatarURL())

        context.strokeStyle = '#29BB8E';
        context.strokeRect(0, 0, canvas.width, canvas.height);

        // Desenhando no canvas
        context.drawImage(foto_antiga, 0, 0, 340, 340)
        context.drawImage(foto_nova, 340, 0, 340, 340)

        // Gerando a imagem para poder anexar ao canvas
        attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'new_avatar.png' })
    } catch { }

    user.profile.avatar = user_alvo.avatarURL({ dynamic: true })
    await user.save() // Atualizando a foto de perfil do usuário

    envia_logger(client, user_alvo, attachment)
}

envia_logger = (client, user_alvo, attachment) => {

    if (!usersmap.has(user_alvo.id)) {

        usersmap.set(user_alvo.id, { cached: true })
        const guilds = client.guilds()

        guilds.forEach(async guild => {

            // Buscando as guilds com o evento do logger de avatar alterado
            const internal_guild = await client.getGuild(guild.id, { logger: true })

            // Notificando a guild sobre a alteração do avatar de um membro
            if (internal_guild.logger.member_image && internal_guild.logger.enabled) {
                const user = await guild.members.fetch(user_alvo.id)
                    .catch(() => { return null })

                if (user) {

                    const embed = new EmbedBuilder()
                        .setTitle(client.tls.phrase(internal_guild, "mode.logger.titulo_avatar"))
                        .setColor(0x29BB8E)
                        .setDescription(client.tls.phrase(internal_guild, "mode.logger.novo_avatar", 35))
                        .setFields(
                            {
                                name: client.user_title(user_alvo, internal_guild, "util.server.membro"),
                                value: `${client.emoji("icon_id")} \`${user_alvo.id}\`\n${client.emoji("mc_name_tag")} \`${user_alvo.username}\`\n( <@${user_alvo.id}> )`,
                                inline: true
                            }
                        )
                        .setTimestamp()

                    const objeto = {
                        embeds: [embed]
                    }

                    if (attachment) { // Enviando o embed com a comparação entre imagens

                        embed.setImage("attachment://new_avatar.png")
                        objeto.files = [attachment]

                    } else // Enviando apenas a nova foto de perfil do usuário
                        if (user_alvo.avatarURL({ dynamic: true }))
                            embed.setImage(user_alvo.avatarURL({ dynamic: true }))

                    client.notify(internal_guild.logger.channel, objeto)
                }
            }
        })

        setTimeout(() => {
            usersmap.delete(user_alvo.id)
        }, 10000)
    }
}