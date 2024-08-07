const { EmbedBuilder, PermissionsBitField } = require("discord.js")

const { atualiza_roles } = require("./user_roles")
const { getUserRole, updateUserRole} = require("../../database/schemas/User_roles")
const { getRoleAssigner } = require("../../database/schemas/Guild_role_assigner")

const { defaultRoleTimes } = require("../../formatters/patterns/timeout")

module.exports = async ({ client, guild, interaction, dados, acionador, indice_warn }) => {

    if (acionador === "join") {

        // Concedendo cargos para novos membros que entram no servidor
        const cargos = await getRoleAssigner(client, interaction.guild.id, "join")
        const membro_guild = await client.getMemberGuild(interaction, interaction.user.id)

        // Checking bot permissions on the server
        if (!await client.permissions(interaction, client.id(), [PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.ModerateMembers])) return

        for (const cargo of cargos.attribute.split(".")) {

            // Verificando se o membro ainda não possui o cargo
            if (!await client.hasRole(interaction, cargo, interaction.user.id)) {

                // Assigning the role to the user who received the strike
                const role = client.getGuildRole(interaction, cargo)

                if (role.editable) // Checking if the role is editable
                    await membro_guild.roles.add(role).catch(console.error)
            }
        }

        return
    }

    // Verificando se o membro ainda não possui o cargo
    if (!await client.hasRole(interaction, dados.role, interaction.author.id)) {

        // Checking bot permissions on the server
        if (await client.permissions(interaction, client.id(), [PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.Administrator])) {

            // Assigning the role to the user who received the strike
            const role = client.getGuildRole(interaction, dados.role)

            if (role.editable) { // Checking if the role is editable

                const membro_guild = await client.getMemberGuild(interaction, interaction.author.id)
                membro_guild.roles.add(role).catch(console.error)

                // Strike com um cargo temporário vinculado
                if (dados.timed_role.status) {
                    const cargo = await getUserRole(client, interaction.author.id, guild.sid, client.timestamp() + defaultRoleTimes[dados.timed_role.timeout])
                    const relatory = acionador === "spam" ? client.tls.phrase(guild, "mode.timed_roles.rodape_spam", null, dados.rank + 1) : client.tls.phrase(guild, "mode.timed_roles.rodape_warn", null, indice_warn + 1)

                    await updateUserRole(client, cargo.id, {
                        nick: membro_guild.user.username,
                        role_id: dados.role,
                        valid: true,
                        assigner: client.id(),
                        assigner_nick: client.username(),
                        relatory: relatory
                    })

                    const motivo = `\n\`\`\`fix\n💂‍♂️ ${client.tls.phrase(guild, "mode.timed_roles.nota_moderador")}\n\n${relatory}\`\`\``

                    const embed_timed_role = new EmbedBuilder()
                        .setTitle(client.tls.phrase(guild, "mode.timed_roles.titulo_cargo_concedido"))
                        .setColor(0x29BB8E)
                        .setDescription(client.tls.phrase(guild, acionador === "spam" ? "mode.timed_roles.aplicado_spam" : "mode.timed_roles.aplicado_warn", [43, client.defaultEmoji("guard")], [membro_guild, motivo]))
                        .addFields(
                            {
                                name: `${client.defaultEmoji("playing")} **${client.tls.phrase(guild, "mode.anuncio.cargo")}**`,
                                value: `${client.emoji("mc_name_tag")} \`${role.name}\`\n<@&${dados.role}>`,
                                inline: true
                            },
                            {
                                name: `${client.defaultEmoji("time")} **${client.tls.phrase(guild, "mode.warn.validade")}**`,
                                value: `**${client.tls.phrase(guild, "mode.timed_roles.valida_por")} \`${client.tls.phrase(guild, `menu.times.${defaultRoleTimes[dados.timed_role.timeout]}`)}\`**\n( <t:${cargo.timestamp}:f> )`,
                                inline: true
                            },
                            {
                                name: `${client.emoji("icon_integration")} **${client.tls.phrase(guild, "mode.warn.moderador")} ( ${client.tls.phrase(guild, "util.user.alonsal")} )**`,
                                value: `${client.emoji("icon_id")} \`${client.id()}\`\n${client.emoji("mc_name_tag")} \`${client.username()}\`\n( <@${client.id()}> )`,
                                inline: true
                            }
                        )

                    // Enviando o aviso ao canal do servidor
                    client.notify(acionador === "spam" ? guild.spam.channel : guild.warn.channel, { embeds: [embed_timed_role] })
                    await atualiza_roles(client)
                }
            }
        } else
            client.notify(guild.spam.channel || guild.logger.channel, { // No permission to manage roles
                content: client.tls.phrase(guild, acionador === "spam" ? "mode.spam.sem_permissao_cargos" : "mode.warn.sem_permissao_cargos", 7),
            })
    }
}