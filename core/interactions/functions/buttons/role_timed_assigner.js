const { PermissionsBitField, EmbedBuilder } = require('discord.js')

const { getTimedRoleAssigner, removeCachedUserRole, updateUserRole} = require('../../../database/schemas/User_roles')
const { atualiza_roles } = require('../../../auto/triggers/user_roles')

const { defaultRoleTimes } = require('../../../formatters/patterns/timeout')

module.exports = async ({ client, user, interaction, dados, pagina }) => {

    let operacao = parseInt(dados.split(".")[1]), reback = "role_timed_assigner"
    let user_alvo = dados.split(".")[2]

    // Operações
    // 0 -> Remove a configuração salva em cache
    // 1 -> Iniciar atribuição

    // 2 -> Escolher cargos
    // 3 -> Escolher tempo de expiração

    // 10 -> Confirmar a atribuição de cargo para o membro

    const cargo = await getTimedRoleAssigner(client, user_alvo, interaction.guild.id)

    if (operacao === 0) {

        // Excluindo o cargo salvo em cache para configuração
        await removeCachedUserRole(client, user_alvo, interaction.guild.id)

        return client.reply(interaction, {
            content: client.tls.phrase(user, "menu.botoes.operacao_cancelada", 11),
            components: []
        })

    } else if (operacao === 1) {

        let botoes = [
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `${reback}|${user_alvo}` },
            { id: "role_timed_assigner", name: client.tls.phrase(user, "menu.botoes.confirmar"), type: 2, emoji: client.emoji(10), data: `10.${user_alvo}` }
        ]

        return client.reply(interaction, {
            components: [client.create_buttons(botoes, interaction)]
        })

    } else if (operacao === 2) {

        // Permissão para atualizar os cargos de membros do servidor
        if (!await client.permissions(interaction, client.id(), PermissionsBitField.Flags.ManageRoles))
            return interaction.update({
                content: client.tls.phrase(user, "mode.anuncio.permissao_cargos", 7),
                ephemeral: true
            })

        // Menu para escolher o cargo que será concedido ao membro
        const data = {
            title: { tls: "menu.menus.escolher_cargo" },
            pattern: "choose_role",
            alvo: "role_timed_assigner_give#role",
            reback: "browse_button.role_timed_assigner",
            operation: operacao,
            submenu: `${user_alvo}.${operacao}`,
            values: await client.getGuildRoles(interaction, cargo.role_id)
        }

        // Subtrai uma página do total ( em casos de exclusão de itens e pagina em cache )
        if (data.values.length < pagina * 24) pagina--

        let botoes = [
            { id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `${reback}|${user_alvo}` },
            { id: "role_timed_assigner", name: client.tls.phrase(user, "menu.botoes.atualizar"), type: 1, emoji: client.emoji(42), data: `2.${user_alvo}` }
        ]

        let row = client.menu_navigation(user, data, pagina || 0)

        if (row.length > 0) // Botões de navegação
            botoes = botoes.concat(row)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data, pagina }), client.create_buttons(botoes, interaction)],
            ephemeral: true
        })

    } else if (operacao === 3) {

        // Submenu para escolher o tempo de expiração do cargo
        const valores = []
        Object.keys(defaultRoleTimes).forEach(key => { if (parseInt(key) !== cargo.timeout) valores.push(`${key}.${defaultRoleTimes[key]}`) })

        const data = {
            title: { tls: "menu.menus.escolher_tempo_remocao" },
            pattern: "numbers",
            alvo: "role_timed_assigner_timeout",
            submenu: `${user_alvo}.${operacao}`,
            values: valores
        }

        let row = client.create_buttons([{
            id: "return_button", name: client.tls.phrase(user, "menu.botoes.retornar"), type: 0, emoji: client.emoji(19), data: `${reback}|${user_alvo}`
        }], interaction)

        return interaction.update({
            components: [client.create_menus({ client, interaction, user, data }), row],
            ephemeral: true
        })
    }

    if (operacao === 10) { // Atribuindo o cargo selecionado ao membro

        // Cargo informado possui permissões moderativas
        if (!await client.rolePermissions(interaction, cargo.rid, [PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.Administrator]))
            return interaction.update({
                content: client.tls.phrase(user, "mode.timed_roles.cargo_moderativo", 7),
                ephemeral: true
            })

        // Membro já possui o cargo mencionado
        if (await client.hasRole(interaction, cargo.role_id, cargo.user_id))
            return interaction.update({
                content: client.tls.phrase(user, "mode.timed_roles.cargo_ja_concedido", 7),
                ephemeral: true
            })

        const role = client.getGuildRole(interaction, cargo.role_id)
        const bot_member = await client.getMemberGuild(interaction.guild.id, client.id())

        if (role.position > bot_member.roles.highest.position)
            return interaction.update({
                content: client.tls.phrase(user, "mode.timed_roles.cargo_superior", 7),
                ephemeral: true
            })

        // Adicionado o cargo temporário ao membro
        const membro_guild = await client.getMemberGuild(interaction, cargo.user_id)
        membro_guild.roles.add(role).then(async () => {

            // Atualizando os status do cargo para poder cronometrar
            const timestamp = client.timestamp() + defaultRoleTimes[cargo.timeout]
            await updateUserRole(client, cargo.id, {
                valid: true,
                timestamp: timestamp
            })

            let motivo = ""

            if (cargo.relatory)
                motivo = `\n\`\`\`fix\n💂‍♂️ ${client.tls.phrase(guild, "mode.timed_roles.nota_moderador")}\n\n${cargo.relatory}\`\`\``

            const embed = new EmbedBuilder()
                .setTitle(client.tls.phrase(guild, "mode.timed_roles.titulo_cargo_concedido"))
                .setColor(0x29BB8E)
                .setDescription(client.tls.phrase(guild, "mode.timed_roles.descricao_cargo_concedido", 43, [membro_guild, motivo]))
                .addFields(
                    {
                        name: `${client.defaultEmoji("playing")} **${client.tls.phrase(guild, "mode.anuncio.cargo")}**`,
                        value: `${client.emoji("mc_name_tag")} \`${role.name}\`\n<@&${cargo.role_id}>`,
                        inline: true
                    },
                    {
                        name: `${client.defaultEmoji("time")} **${client.tls.phrase(guild, "mode.warn.validade")}**`,
                        value: `<t:${timestamp}:f>\n( <t:${timestamp}:R> )`,
                        inline: true
                    },
                    {
                        name: `${client.defaultEmoji("person")} **${client.tls.phrase(guild, "mode.warn.moderador")}**`,
                        value: `${client.emoji("icon_id")} \`${cargo.assigner}\`\n${client.emoji("mc_name_tag")} \`${cargo.assigner_nick}\`\n( <@${cargo.assigner}> )`,
                        inline: true
                    }
                )

            const guild = await client.getGuild(interaction.guild.id)

            // Enviando o aviso ao canal do servidor
            client.notify(guild.timed_roles_channel, { content: `${membro_guild}`, embeds: [embed] })
            await atualiza_roles(client)

            return interaction.update({
                content: client.tls.phrase(user, "mode.timed_role.cargo_concedido", 10, [cargo.role_id, cargo.user_id, cargo.timestamp]),
                embeds: [],
                components: [],
                ephemeral: true
            })
        }).catch(console.error)

    } else {
        await require('../../chunks/role_assigner')({client, user, interaction})
    }
}