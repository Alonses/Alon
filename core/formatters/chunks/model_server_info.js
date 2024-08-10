const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js')

module.exports = async ({ client, interaction, dados, autor_original }) => {

    // Códigos de operação
    // 0 -> Geral
    // 1 -> Cargos
    // 2 -> Estatísticas

    const user = await client.getUser(interaction.user.id, {
        conf: true,
        misc: true
    })

    let operador = dados ? parseInt(dados.split(".")[1]) : 0
    const guild = await client.getGuild(interaction.guild.id)

    const infos_sv = new EmbedBuilder()
        .setTitle(interaction.guild.name)
        .setColor(client.embed_color(user.misc.color))
        .addFields(
            {
                name: `${client.emoji("icon_id")} **${client.tls.phrase(user, "mode.report.identificador")}**`,
                value: `\`${interaction.guild.id}\``,
                inline: true
            }
        )

    // Dados gerais do servidor
    if (operador === 0) {

        let dono_sv = interaction.guild.ownerId
        const dono_membro = await client.getMemberGuild(interaction, dono_sv)

        dono_sv = `\`${dono_membro.user.username.replace(/ /g, "")}#${dono_membro.user.discriminator}\``

        if (dono_membro.user.discriminator === 0)
            dono_sv = `\`@${dono_membro.user.username.replace(/ /g, "")}\``

        const data_entrada = `<t:${Math.floor(interaction.guild.joinedTimestamp / 1000)}:f>` // Entrada do bot no server
        const diferenca_entrada = `<t:${Math.floor(interaction.guild.joinedTimestamp / 1000)}:R>`

        const data_criacao = `<t:${Math.floor(interaction.guild.createdAt / 1000)}:f>` // Criação do servidor
        const diferenca_criacao = `<t:${Math.floor(interaction.guild.createdAt / 1000)}:R>`

        infos_sv.addFields(
            {
                name: `:unicorn: **${client.tls.phrase(user, "util.server.dono")}**`,
                value: dono_sv,
                inline: true
            },
            {
                name: "⠀",
                value: `( ${dono_membro} )`,
                inline: true
            }
        ).addFields(
            {
                name: `:birthday: **${client.tls.phrase(user, "util.server.criacao")}**`,
                value: `${data_criacao}\n[ ${diferenca_criacao} ]`,
                inline: true
            },
            {
                name: `:vulcan: **${client.tls.phrase(user, "util.server.entrada")}**`,
                value: `${data_entrada}\n[ ${diferenca_entrada} ]`,
                inline: true
            }
        )

        // Exibindo o usuário que adicionou o bot ao servidor
        if (guild.inviter) {

            const inviter_membro = await client.getMemberGuild(interaction, guild.inviter)

            if (inviter_membro) {
                let inviter = `\`${inviter_membro.user.username.replace(/ /g, "")}#${inviter_membro.user.discriminator}\``

                if (inviter_membro.user.discriminator === 0)
                    inviter = `\`@${inviter_membro.user.username.replace(/ /g, "")}\``

                infos_sv.addFields(
                    {
                        name: `${client.emoji("aln_hoster")} **${client.tls.phrase(user, "util.server.convidado")}**`,
                        value: `${inviter}\n( <@${guild.inviter}> )`,
                        inline: true
                    }
                )
            }
        }
    }

    // Cargos e moderação
    if (operador === 1) {

        const niveis_verificacao = ["NONE", "LOW", "MEDIUM", "HIGH", "HIGHEST"]
        let verificacao = interaction.guild.verificationLevel > 0 ? client.tls.phrase(user, `util.server.desc_${niveis_verificacao[1]}`) : client.tls.phrase(user, "util.server.sem_verificacao", 4)

        if (interaction.guild.verificationLevel > 1)
            verificacao += `\n\n${client.tls.phrase(user, `util.server.desc_${niveis_verificacao[interaction.guild.verificationLevel]}`)}`

        const cargos = {
            moderativos: [],
            normais: []
        }

        // Listando todos os cargos do servidor
        interaction.guild.roles.cache.map(r => {
            if (r.permissions.has(PermissionsBitField.Flags.ModerateMembers || PermissionsBitField.Flags.ManageChannels || PermissionsBitField.Flags.ManageMessages)) {
                if (cargos.moderativos.join(" ").length < 1024 && `<@&${r}>`.length + cargos.moderativos.join(" ").length < 1024)
                    cargos.moderativos.push(r)
            } else // Cargos sem permissões moderativas
                if (cargos.normais.join(" ").length < 1024 && `<@&${r}>`.length + cargos.normais.join(" ").length < 1024 && r.id !== interaction.guild.id)
                    cargos.normais.push(r)
        })

        infos_sv.addFields(
            {
                name: `:shield: **${client.tls.phrase(user, "util.server.verificacao")}**`,
                value: `**${client.tls.phrase(user, `util.server.${niveis_verificacao[interaction.guild.verificationLevel]}`)}**`,
                inline: true
            },
            {
                name: `:passport_control: **${client.tls.phrase(user, "util.server.cargos")} ( ${interaction.guild.roles.cache.size - 1} )**`,
                value: "⠀",
                inline: true
            },
            {
                name: `:passport_control: **${client.tls.phrase(user, "util.server.cargos_moderativos")}:**`,
                value: `${cargos.moderativos.join(" ")}`,
                inline: false
            },
            {
                name: `${client.defaultEmoji("person")} **${client.tls.phrase(user, "util.server.outros_cargos")}:**`,
                value: `${cargos.normais.join(" ")}`,
                inline: false
            }
        )

        if (verificacao !== "") // Niveis de verificação ativos no servidor
            infos_sv.setDescription(`\`\`\`fix\n💂‍♂️ ${client.tls.phrase(user, "util.server.descricao_verificacao")}\n\n${verificacao}\`\`\``)

    }

    // Estatísticas do servidor
    if (operador === 2) {

        const canais_texto = interaction.guild.channels.cache.filter((c) => c.type === ChannelType.GuildText).size
        const canais_voz = interaction.guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size
        const canais_foruns = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildForum).size
        const categorias = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size
        const qtd_canais = canais_texto + canais_voz + canais_foruns

        const qtd_membros = interaction.guild.memberCount

        infos_sv.addFields(
            {
                name: `${client.emoji("emojis_dancantes")} **Emojis ( ${interaction.guild.emojis.cache.size} )**`,
                value: "⠀",
                inline: true
            },
            {
                name: `${client.emoji("gigachad")} **${client.tls.phrase(user, "util.server.figurinhas")} ( ${interaction.guild.stickers.cache.size} )**`,
                value: interaction.guild.premiumSubscriptionCount > 0 ? `${client.emoji("boost")} **Boosts ( ${interaction.guild.premiumSubscriptionCount} )**` : "⠀",
                inline: true // Servidor sendo impulsionado /\
            }
        ).addFields(
            {
                name: `:busts_in_silhouette: **${client.tls.phrase(user, "util.server.membros")}**`,
                value: `:bust_in_silhouette: **${client.tls.phrase(user, "util.server.atual")}:** \`${client.locale(qtd_membros)}\`\n:arrow_up: **Max: **\`${client.locale(interaction.guild.maximumMembers)}\``,
                inline: true
            },
            {
                name: `:placard: **${client.tls.phrase(user, "util.server.canais")} ( ${qtd_canais} )**`,
                value: `:card_box: **${client.tls.phrase(user, "util.server.categorias")}:** \`${categorias}\`\n:notepad_spiral: **${client.tls.phrase(user, "util.server.texto")}:** \`${canais_texto}\``,
                inline: true
            },
            {
                name: "⠀",
                value: `:speaking_head: **${client.tls.phrase(user, "util.server.voz")}:** \`${canais_voz}\`\n:mega: **${client.tls.phrase(user, "util.server.foruns")}:** \`${canais_foruns}\``,
                inline: true
            }
        )
    }

    // Liga e desliga os botões conforme a página que o usuário se encontra
    const b_disabled = [false, false, false, false]
    const c_buttons = [1, 1, 1, 1]
    b_disabled[operador] = true
    c_buttons[operador] = 2

    const row = client.create_buttons([
        { id: "server_info_button", name: client.tls.phrase(user, "util.lastfm.geral"), type: c_buttons[0], emoji: '🌐', data: "0", disabled: b_disabled[0] },
        { id: "server_info_button", name: client.tls.phrase(user, "menu.botoes.moderacao"), type: c_buttons[1], emoji: client.emoji("aln_reporter"), data: "1", disabled: b_disabled[1] },
        { id: "server_info_button", name: client.tls.phrase(user, "menu.botoes.estatisticas"), type: c_buttons[2], emoji: client.defaultEmoji("metrics"), data: "2", disabled: b_disabled[2] }
    ], interaction)

    // Servidor com imagem personalizada
    if (interaction.guild.iconURL({ size: 2048 }))
        infos_sv.setThumbnail(interaction.guild.iconURL({ size: 2048 }))

    if (!autor_original) interaction.customId = null

    client.reply(interaction, {
        embeds: [infos_sv],
        components: [row],
        ephemeral: autor_original ? client.decider(user?.conf.ghost_mode, 0) : true
    })
}