const { COMMANDS, ROLES } = require('../constants')

function findRoleIdByName(roles, roleName) {
  return roles.find((r) => r.name === roleName).id
}

module.exports = function (message, command, request) {
  const roles = message.guild.roles.cache
  const pricerRoleId = findRoleIdByName(roles, ROLES.PRICER)
  const pitRoleId = findRoleIdByName(roles, ROLES.PRICER_IN_TRAINING)

  let msg = ''
  msg += `Price request! <@${message.author.id}> wants to know `
  msg += `the price of **${request}** for Nintendo Switch.`
  if (command === COMMANDS.PRICE) {
    msg += ` <@&${pricerRoleId}> <@&${pitRoleId}>`
  }
  return msg
}
