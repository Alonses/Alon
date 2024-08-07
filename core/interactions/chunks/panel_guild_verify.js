const { EmbedBuilder } = require('discord.js')

const { getReportedUsers } = require('../../database/schemas/User_reports')

module.exports = async ({ client, user, interaction }) => {

    // Deferindo a interação
    await client.deferedResponse({ interaction })

    const users = [], users_ids = [], id_membros_guild = []
    const usuarios_reportados = await getReportedUsers(client)
    const warned_users = await client.getSingleWarnedGuildUser(interaction.guild.id, "warn")
    const user_notes = await client.getSingleWarnedGuildUser(interaction.guild.id, "pre_warn")

    interaction.guild.members.fetch()
        .then(async membros => {

            // Salvando os dados no formato apropriado
            usuarios_reportados.forEach(valor => { users.push(valor) })

            // Listando todos os usuários do servidor para comparação
            membros.forEach(membro => { id_membros_guild.push(membro.user.id) })

            for (const user of usuarios_reportados) // Listando os usuários que possuem denúncias e estão no servidor
                if (id_membros_guild.includes(user.user_id)) users_ids.push(user.user_id)

            const embed = new EmbedBuilder()
                .setTitle(`> ${interaction.guild.name}`)
                .setColor(client.embed_color(user.misc.color))
                .setThumbnail(interaction.guild.iconURL({ size: 2048 }))
                .setDescription(client.tls.phrase(user, "mode.warn.descricao_painel_visualizacao"))
                .addFields(
                    {
                        name: `${client.emoji(0)} **${client.tls.phrase(user, "mode.warn.advertidos")}: \`${warned_users.length}\`**`,
                        value: "⠀",
                        inline: true
                    },
                    {
                        name: `${client.defaultEmoji("pen")} **${client.tls.phrase(user, "menu.botoes.anotacoes")}: \`${user_notes.length}\`**`,
                        value: "⠀",
                        inline: true
                    },
                    {
                        name: `${client.defaultEmoji("guard")} **${client.tls.phrase(user, "mode.report.reportados")}: \`${users_ids.length}\`**`,
                        value: "⠀",
                        inline: true
                    }
                )
                .setFooter({
                    text: client.tls.phrase(user, "mode.warn.verificar_warn"),
                    iconURL: interaction.user.avatarURL({ dynamic: true })
                })

            const b_disabled = [false, false, false]

            // Sem membros que receberam advertências no servidor
            if (warned_users.length < 1)
                b_disabled[0] = true

            // Sem membros reportados externamente presentes no servidor
            if (users_ids.length < 1)
                b_disabled[1] = true

            // Sem membros com anotações ativas no servidor
            if (user_notes.length < 1)
                b_disabled[3] = true

            const botoes = [
                { id: "guild_verify_button", name: client.tls.phrase(user, "menu.botoes.atualizar"), type: 1, emoji: client.emoji(42), data: "3" },
                { id: "guild_verify_button", name: client.tls.phrase(user, "mode.warn.advertencias"), type: 1, emoji: client.emoji(0), data: "1", disabled: b_disabled[0] },
                { id: "guild_verify_button", name: client.tls.phrase(user, "menu.botoes.anotacoes"), type: 1, emoji: client.defaultEmoji("pen"), data: "4", disabled: b_disabled[3] },
                { id: "guild_verify_button", name: client.tls.phrase(user, "mode.report.reportados"), type: 1, emoji: client.defaultEmoji("guard"), data: "2", disabled: b_disabled[1] }
            ]

            return interaction.editReply({
                embeds: [embed],
                components: [client.create_buttons(botoes, interaction)],
                ephemeral: true
            })
        })
}