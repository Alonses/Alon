const { PermissionsBitField } = require("discord.js")

const loggerMap = {
    "none": "📝",
    "message_edit": "📝",
    "message_delete": "🚮",
    "member_nick": "🔖",
    "member_image": "👤",
    "member_role": "🔖",
    "member_join": "🆕",
    "member_left": "🛫",
    "channel_created": "🆕",
    "channel_delete": "🚮",
    "member_ban_add": "🔨",
    "member_ban_remove": "✅",
    "member_punishment": "🔇",
    "member_kick": "👟",
    "member_kick_2": "👟",
    "member_mute": "🔇",
    "member_ban": "🔨",
    "member_voice_status": "📻",
    "invite_created": "🔗",
    "invite_deleted": "🔗"
}

const channelTypes = {
    0: "💬",
    2: "🔊",
    4: "📂",
    5: "📣",
    10: "📣",
    11: "💬",
    12: "💬",
    13: "📣",
    15: "📯"
}

const guildPermissions = {
    "member_mute": [PermissionsBitField.Flags.ModerateMembers],
    "member_ban": [PermissionsBitField.Flags.BanMembers],
    "member_kick_2": [PermissionsBitField.Flags.KickMembers]
}

const guildActions = {
    "member_mute": 0,
    "member_kick_2": 1,
    "member_ban": 2
}

const operation_codes = {
    "free_games": 2,
    "tickets": 3,
    "external_reports": 4,
    "logger": 5,
    "anti_spam": 6,
    "network": 8,
    "warns": 9,
    "tracked_invites": 10,
    "hierarchy_warns": 11,
    "timed_roles": 12
}

const networkCases = {
    "ban_add": "member_ban_add",
    "ban_del": "member_ban_add",
    "kick": "member_kick",
    "mute": "member_punishment"
}

module.exports = {
    loggerMap,
    channelTypes,
    guildPermissions,
    guildActions,
    operation_codes,
    networkCases
}