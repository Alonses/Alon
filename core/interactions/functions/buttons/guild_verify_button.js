const { EmbedBuilder } = require('discord.js')

const { getReportedUsers, checkUserGuildReported } = require('../../../database/schemas/User_reports')

module.exports = async ({ client, user, interaction, dados, pagina }) => {

    let operacao = parseInt(dados.split(".")[1])
    pagina = pagina || 0

    // Tratamento dos cliques
    // 1 -> Lista de usuários com advertência no servidor
    // 2 -> Lista de usuários reportados presentes no servidor
    // 3 -> Atualiza o card principal
    // 4 -> Lista de usuários com anotações de advertência no servidor

    // Navegando pelos usuários que foram advertidos no servidor
    if (operacao !== 3) await client.deferedResponse({ interaction })

    if (operacao === 1 || operacao === 4) {

        const warned_users = await client.getSingleWarnedGuildUser(interaction.guild.id, operacao === 4 ? "pre_warn" : "warn")

        const obj = {
            content: warned_users.length > 0 ? client.tls.phrase(user, "mode.report.escolher_usuario") : client.tls.phrase(user, "mode.warn.sem_usuarios", 1),
            ephemeral: true
        }

        if (warned_users.length > 0) {

            // Subtrai uma página do total ( em casos de exclusão de itens e pagina em cache )
            if (warned_users.length < pagina * 24) pagina--

            const embed = new EmbedBuilder()
                .setTitle(`${client.tls.phrase(user, "mode.warn.usuarios_advertidos_titulo")} 🛑`)
                .setColor(client.embed_color(user.misc.color))
                .setThumbnail(interaction.guild.iconURL({ size: 2048 }))
                .setDescription(client.tls.phrase(user, "mode.warn.usuarios_advertidos_descricao"))
                .setFooter({
                    text: client.tls.phrase(user, "mode.warn.selecionar_usuario_advertido"),
                    iconURL: interaction.user.avatarURL({ dynamic: true })
                })

            let alvo = "warn_browse", reback = "warn_browse_user"

            if (operacao === 4) {
                alvo = "pre_warn_browse"
                reback = "pre_warn_browse_user"

                embed.setTitle(`${client.tls.phrase(user, "mode.anotacoes.titulo_selecao")} ${client.defaultEmoji("pen")}`)
                    .setDescription(client.tls.phrase(user, "mode.anotacoes.descricao_selecionar_membro"))
                    .setFooter({
                        text: client.tls.phrase(user, "mode.anotacoes.selecionar_usuario"),
                        iconURL: interaction.user.avatarURL({ dynamic: true })
                    })
            }

            // Menu para navegar entre os usuários com advertências do servidor
            const data = {
                title: { tls: "menu.menus.escolher_usuario" },
                pattern: "reports",
                alvo: alvo,
                reback: `browse_button.${reback}`,
                operation: 0,
                values: warned_users
            }

            obj.embeds = [embed]
            obj.components = [client.create_menus({ client, interaction, user, data, pagina }), client.create_buttons([{ id: "chunks_panel_guild_verify", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19) }], interaction)]
            let row = client.menu_navigation(user, data, pagina)

            if (row.length > 0) // Botões de navegação
                obj.components.push(client.create_buttons(row, interaction))
        }

        return interaction.editReply(obj)

    } else if (operacao === 2) {

        const users = [], users_ids = [], id_membros_guild = []
        const usuarios_reportados = await getReportedUsers(client)

        interaction.guild.members.fetch()
            .then(async membros => {

                // Salvando os dados no formato apropriado
                usuarios_reportados.forEach(valor => { users.push(valor) })

                // Listando todos os usuários do servidor para comparação
                membros.forEach(membro => { id_membros_guild.push(membro.user.id) })

                for (const user of usuarios_reportados) // Listando os usuários que possuem denúncias e estão no servidor
                    if (id_membros_guild.includes(user.user_id)) users_ids.push(user.user_id)

                const obj = {
                    content: users_ids.length > 0 ? client.tls.phrase(user, "mode.report.escolher_usuario") : client.tls.phrase(user, "mode.report.sem_usuarios_report", 1),
                    ephemeral: true
                }

                if (users_ids.length > 0) { // Menu para navegar entre os usuários reportados
                    let reportes_guild

                    if (interaction.guild.id !== process.env.guild_id)
                        reportes_guild = await checkUserGuildReported(client, interaction.guild.id)
                    else if (process.env.owner_id.includes(interaction.user.id))
                        reportes_guild = await getReportedUsers(client) // Lista todos os usuários reportados salvos no Alonsal

                    if (reportes_guild.length > 0) {

                        // Subtrai uma página do total ( em casos de remoção de usuários e página em cache )
                        if (reportes_guild.length < pagina * 24) pagina--

                        const embed = new EmbedBuilder()
                            .setTitle(`${client.tls.phrase(user, "mode.report.usuarios_reportados_titulo")} 💂‍♂️`)
                            .setColor(client.embed_color(user.misc.color))
                            .setThumbnail(interaction.guild.iconURL({ size: 2048 }))
                            .setDescription(client.tls.phrase(user, "mode.report.descricao_busca_reporte"))
                            .setFooter({
                                text: client.tls.phrase(user, "mode.report.selecionar_membro"),
                                iconURL: interaction.user.avatarURL({ dynamic: true })
                            })

                        const data = {
                            title: { tls: "menu.menus.escolher_usuario" },
                            pattern: "reports",
                            alvo: "report_browse",
                            reback: "browse_button.report_browse_user",
                            operation: 0,
                            values: usuarios_reportados
                        }

                        pagina = parseInt(pagina)

                        obj.embeds = [embed]
                        obj.components = [client.create_menus({ client, interaction, user, data, pagina })]

                        let row = client.menu_navigation(user, data, pagina)

                        if (row.length > 0) // Botões de navegação
                            obj.components.push(client.create_buttons(row, interaction))
                    }
                }

                return interaction.editReply(obj)
            })
    } else
        await require('../../chunks/panel_guild_verify')({client, user, interaction})
}