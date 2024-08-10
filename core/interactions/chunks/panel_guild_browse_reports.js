const { EmbedBuilder } = require('discord.js')

const { getReportedUsers, checkUserGuildReported } = require('../../database/schemas/User_reports')

module.exports = async ({ client, interaction, pagina }) => {
    const user = await client.getUser(interaction.user.id, { misc: true })
    pagina = pagina || 0

    await client.deferedResponse({ interaction })

    const users = [], users_ids = []
    const usuarios_reportados = await getReportedUsers(client)

    const id_membros_guild = []

    interaction.guild.members.fetch()
        .then(async membros => {

            // Salvando os dados no formato apropriado
            usuarios_reportados.forEach(valor => { users.push(valor) })

            // Listando todos os usuários do servidor para comparação
            membros.forEach(membro => { id_membros_guild.push(membro.user.id) })

            for (const user of usuarios_reportados) // Listando os usuários que possuem denúncias e estão no servidor
                if (id_membros_guild.includes(user.user_id)) users_ids.push(user.user_id)

            // Verificando a quantidade de entradas e estimando o número de páginas
            const pages = users_ids.length / 6
            let paginas = pages - Math.floor(pages) > 0.5 ? Math.floor(pages) + 1 : Math.floor(pages)
            let rodape = ""

            if (users_ids.length / 6 < 1)
                paginas = 1

            if (users_ids.length > 6)
                rodape = `${paginas + 1} ${client.tls.phrase(user, "mode.report.varias_paginas")}`
            else
                rodape = client.tls.phrase(user, "mode.report.uma_pagina")

            if (pagina > paginas) // Número de página escolhida maior que as disponíveis
                return client.tls.editReply(interaction, user, "dive.rank.error_1", client.decider(user?.conf.ghost_mode, 0), 1)

            const embed = new EmbedBuilder()
                .setTitle(`> ${interaction.guild.name}`)
                .setColor(client.embed_color(user.misc.color))
                .setThumbnail(interaction.guild.iconURL({ size: 2048 }))

            if (users_ids.length > 0)
                embed.setDescription(`\`\`\`${client.tls.phrase(user, "mode.report.com_reportes_guild", 48)}\`\`\``)
                    .addFields(
                        {
                            name: `${client.defaultEmoji("guard")} **${client.tls.phrase(user, "mode.report.reportados")}: ${users_ids.length}**`,
                            value: "⠀",
                            inline: true
                        }
                    )
                    .setFooter({
                        text: rodape,
                        iconURL: interaction.user.avatarURL({ dynamic: true })
                    })
            else
                embed.setDescription(`\`\`\`✅ | ${client.tls.phrase(user, "mode.report.sem_reportes_guild")}\`\`\``)

            const obj = {
                content: users_ids.length > 0 ? client.tls.phrase(user, "mode.report.escolher_usuario") : "",
                embeds: [embed],
                ephemeral: true
            }

            if (users_ids.length > 0) {
                // Menu para navegar entre os usuários reportados
                const reportes_guild = await checkUserGuildReported(client, interaction.guild.id)

                if (reportes_guild.length > 0) {
                    // Subtrai uma página do total ( em casos de exclusão de itens e pagina em cache )
                    if (reportes_guild.length < pagina * 24) pagina--

                    const data = {
                        title: { tls: "menu.menus.escolher_usuario" },
                        pattern: "reports",
                        alvo: "report_browse",
                        reback: "browse_button.report_browse_user",
                        operation: 0,
                        values: reportes_guild
                    }

                    obj.components = [client.create_menus({ client, interaction, user, data, pagina })]

                    let row = client.menu_navigation(user, data, pagina)

                    if (row.length > 0) // Botões de navegação
                        obj.components.push(client.create_buttons(row, interaction))
                }
            }

            interaction.editReply(obj)
        })
}