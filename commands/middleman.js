const { ROLES } = require('../constants')
const { findRoleByName } = require('../utils')

module.exports = function (message) {
  const roles = message.guild.roles.cache
  const mmRoleId = findRoleByName(roles, ROLES.MIDDLEMAN).id

  let msg = ''
  msg += `<@${message.author.id}> needs a middleman, who's available?`
  msg += ` <@&${mmRoleId}>`
  return msg
}
