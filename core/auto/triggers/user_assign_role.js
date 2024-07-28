const { EmbedBuilder, PermissionsBitField } = require("discord.js")

const { atualiza_roles } = require("./user_roles")
const { getUserRole } = require("../../database/schemas/User_roles")
const { getRoleAssigner } = require("../../database/schemas/Guild_role_assigner")

const { defaultRoleTimes } = require("../../formatters/patterns/timeout")

module.exports = async ({ client, guild, interaction, dados, acionador, indice_warn }) => {

    if (acionador === "join") {

        // Concedendo cargos para novos membros que entram no servidor
        const cargos = await getRoleAssigner(client, interaction.guild.id, "join")
        const membro_guild = await client.getMemberGuild(interaction, interaction.user.id)

        // Checking bot permissions on the server
        if (!await client.permissions(interaction, client.id(), [PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.ModerateMembers])) return

        cargos.attribute.split(".").forEach(async cargo => {

            // Verificando se o membro ainda não possui o cargo
            if (!await client.hasRole(interaction, cargo, interaction.user.id)) {

                // Assigning the role to the user who received the strike
                const role = client.getGuildRole(interaction, cargo)

                if (role.editable) // Checking if the role is editable
                    await membro_guild.roles.add(role).catch(console.error)
            }
        })

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

                    const cargo = await getUserRole(interaction.author.id, guild.sid, client.timestamp() + defaultRoleTimes[dados.timed_role.timeout])

                    cargo.nick = membro_guild.user.username
                    cargo.rid = dados.role
                    cargo.valid = true

                    cargo.assigner = client.id()
                    cargo.assigner_nick = client.username()

                    cargo.relatory = acionador === "spam" ? client.tls.phrase(guild, "mode.timed_roles.rodape_spam", null, dados.rank + 1) : client.tls.phrase(guild, "mode.timed_roles.rodape_warn", null, indice_warn + 1)
                    cargo.save()

                    const motivo = `\n\`\`\`fix\n💂‍♂️ ${client.tls.phrase(guild, "mode.timed_roles.nota_moderador")}\n\n${cargo.relatory}\`\`\``

                    const embed_timed_role = new EmbedBuilder()
                        .setTitle(client.tls.phrase(guild, "mode.timed_roles.titulo_cargo_concedido"))
                        .setColor(0x29BB8E)
                        .setDescription(client.tls.phrase(guild, acionador === "spam" ? "mode.timed_roles.aplicado_spam" : "mode.timed_roles.aplicado_warn", [43, client.defaultEmoji("guard")], [membro_guild, motivo]))
                        .addFields(
                            {
                                name: `${client.defaultEmoji("playing")} **${client.tls.phrase(guild, "mode.anuncio.cargo")}**`,
                                value: `${client.emoji("mc_name_tag")} \`${role.name}\`\n<@&${cargo.rid}>`,
                                inline: true
                            },
                            {
                                name: `${client.defaultEmoji("time")} **${client.tls.phrase(guild, "mode.warn.validade")}**`,
                                value: `**${client.tls.phrase(guild, "mode.timed_roles.valida_por")} \`${client.tls.phrase(guild, `menu.times.${defaultRoleTimes[dados.timed_role.timeout]}`)}\`**\n( <t:${cargo.timestamp}:f> )`,
                                inline: true
                            },
                            {
                                name: `${client.emoji("icon_integration")} **${client.tls.phrase(guild, "mode.warn.moderador")} ( ${client.tls.phrase(guild, "util.user.alonsal")} )**`,
                                value: `${client.emoji("icon_id")} \`${cargo.assigner}\`\n${client.emoji("mc_name_tag")} \`${cargo.assigner_nick}\`\n( <@${cargo.assigner}> )`,
                                inline: true
                            }
                        )

                    // Enviando o aviso ao canal do servidor
                    client.notify(acionador === "spam" ? guild.spam.channel : guild.warn.channel, { embeds: [embed_timed_role] })
                    atualiza_roles()
                }
            }
        } else
            client.notify(guild.spam.channel || guild.logger.channel, { // No permission to manage roles
                content: client.tls.phrase(guild, acionador === "spam" ? "mode.spam.sem_permissao_cargos" : "mode.warn.sem_permissao_cargos", 7),
            })
    }
}