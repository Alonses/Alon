const { EmbedBuilder, PermissionsBitField } = require('discord.js')

const { getRoleAssigner } = require('../../database/schemas/Guild_role_assigner')

module.exports = async ({ client, interaction, caso }) => {
    const user = await client.getUser(interaction.user.id, { misc: true })
    if (!caso) return interaction.reply({ content: "Ixi! Os dados dessa interação sumiram! Por gentileza, use o comando novamente", ephemeral: true })

    const embed = new EmbedBuilder()
        .setTitle(`${client.tls.phrase(user, "mode.roles.titulo_atribuidor")} :passport_control:`)
        .setColor(client.embed_color(user.misc.color))
        .setDescription(client.tls.phrase(user, caso === "global" ? "mode.roles.descricao_atribuidor" : "mode.roles.descricao_atribuidor_join"))

    const cargos = await getRoleAssigner(client, interaction.guild.id, caso)

    if (!cargos.attribute)
        embed.addFields(
            {
                name: `${client.emoji("mc_name_tag")} **${client.tls.phrase(user, "mode.roles.cargo_selecionado")}**`,
                value: `\`${client.tls.phrase(user, "mode.roles.nenhum")}\``
            }
        )
    else
        embed.addFields(
            {
                name: `${client.emoji("mc_name_tag")} **${client.tls.phrase(user, "mode.roles.atribuir_selecionados")}**`,
                value: listar_cargos(client, user, cargos.attribute)
            }
        )

    if (caso === "global") {
        if (!cargos.ignore)
            embed.addFields(
                {
                    name: `${client.emoji(4)} **${client.tls.phrase(user, "mode.roles.ignorar_membros")}**`,
                    value: `\`${client.tls.phrase(user, "mode.roles.ignorando_nenhum")}\``
                }
            )
        else
            embed.addFields(
                {
                    name: `${client.emoji(4)} **${client.tls.phrase(user, "mode.roles.ignorar_membros")}**`,
                    value: listar_cargos(client, user, cargos.ignore)
                }
            )
    }

    // Permissões do bot no servidor
    const bot_member = await client.getMemberGuild(interaction, client.id())

    embed.addFields(
        { name: "⠀", value: "⠀", inline: false },
        {
            name: `${client.emoji(7)} **${client.tls.phrase(user, "mode.network.permissoes_no_servidor")}**`,
            value: `${client.execute("functions", "emoji_button.emoji_button", bot_member.permissions.has(PermissionsBitField.Flags.ModerateMembers))} **${client.tls.phrase(user, "mode.network.moderar_membros")}**`,
            inline: true
        },
        {
            name: "⠀",
            value: `${client.execute("functions", "emoji_button.emoji_button", bot_member.permissions.has(PermissionsBitField.Flags.ManageRoles))} **${client.tls.phrase(user, "mode.network.gerenciar_cargos")}**`,
            inline: true
        }
    )

    const row = [{ id: "role_assigner", name: client.tls.phrase(user, "menu.botoes.cargos_atribuidos"), type: 1, emoji: client.emoji("mc_name_tag"), data: `2.${caso}` }]

    if (caso === "global") {
        row.push({ id: "role_assigner", name: client.tls.phrase(user, "menu.botoes.ignorar_cargos"), type: 1, emoji: client.emoji(4), data: "3.global" })

        row.push({ id: "role_assigner", name: client.tls.phrase(user, "menu.botoes.iniciar_atribuicao"), type: 2, emoji: client.emoji(10), data: `1.${caso}`, disabled: !cargos.atribute || !bot_member.permissions.has(PermissionsBitField.Flags.ManageRoles) })
    } else // Botão para ativar ou desativar a atribuição de cargos na entrada de novos membros
        row.push({ id: "role_assigner", name: client.tls.phrase(user, "menu.botoes.atribuir"), type: client.execute("functions", "emoji_button.type_button", cargos.status), emoji: client.execute("functions", "emoji_button.emoji_button", cargos.status), data: "20.join", disabled: !cargos.atribute || !bot_member.permissions.has(PermissionsBitField.Flags.ManageRoles) })

    client.reply(interaction, {
        embeds: [embed],
        components: [client.create_buttons(row, interaction)],
        ephemeral: true
    })
}

function listar_cargos(client, user, cargos) {

    const lista = []

    cargos.split(".").forEach(cargo => {
        if (cargo === "all") lista.push(client.tls.phrase(user, "mode.roles.ignorar_membros_com_cargos"))
        else lista.push(`<@&${cargo}>`)
    })

    return lista.join(", ")
}