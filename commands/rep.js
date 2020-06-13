const { COMMANDS, ROLES } = require('../constants')
const { repStorage } = require('../storage')
const { findRoleByName } = require('../utils')

// !addrep @jack he rocks
const addRep = async function (message, command, request) {
  const author = message.author.id
  if (!message.mentions.members.size) return 'Add rep to who?'

  let msg = ''
  if (request.indexOf(' ') >= 0) {
    msg = request.substr(request.indexOf(' ') + 1) // strip the mention
  }

  const mentioned = message.mentions.members.first().id
  const newRep = {
    from: author,
    msg,
    at: Date.now(),
  }
  const rep = (await repStorage.get(mentioned)) || []
  rep.push(newRep)
  const saved = await repStorage.set(mentioned, rep)
  if (saved) {
    const reason = msg || 'No reason given'
    return `<@${author}> gave rep to <@${mentioned}> because _${reason}_`
  } else {
    return 'Could not save rep'
  }
}

const badRep = async function (message, command, request) {
  const author = message.author.id
  if (!message.mentions.members.size) return 'Rip whose rep?'

  const roles = message.guild.roles.cache
  const adminRoleId = findRoleByName(roles, ROLES.ADMINISTRATOR).id

  const mentioned = message.mentions.members.first().id
  const newRep = {
    from: author,
    msg: request.substr(request.indexOf(' ') + 1), // strip the mention
    at: Date.now(),
    neg: true,
  }
  const rep = (await repStorage.get(mentioned)) || []
  rep.push(newRep)
  const saved = await repStorage.set(mentioned, rep)
  if (saved) {
    let msg = `<@${author}> gave **bad** rep `
    msg += `to <@${mentioned}> because _${newRep.msg}_\n`
    msg += `Check it out <@&${adminRoleId}>`
    return msg
  } else {
    return 'Could not save rep'
  }
}

const rep = async function (message, command, request) {
  const user = message.mentions.members.size
    ? message.mentions.members.first().id
    : message.author.id

  const rep = await repStorage.get(user)
  if (!rep || !rep.length) return `<@${user}> has no rep`

  let p = []
  let n = []
  rep.forEach((r) => {
    if (r.neg) n.push(r)
    if (!r.neg) p.push(r)
  })
  let msg = ''
  msg += `<@${user}> Rep Report\n`
  msg += `**Positive Rep: ${p.length}**\n`
  msg += `**Negative Rep: ${n.length}**\n`
  rep.forEach((r) => {
    if (!r.msg) return
    msg += r.neg ? ' - ' : ' + '
    msg += ` "${r.msg}"\n`
  })
  return msg
}

module.exports = async function (message, command, request) {
  const logChannel = message.guild.channels.cache.find((c) => {
    if (c.name === 'rep-logs') return c
  })
  let msg

  switch (command) {
    case COMMANDS.ADDREP:
      msg = await addRep(message, command, request)
      logChannel.send(msg)
      break
    case COMMANDS.BADREP:
      msg = await badRep(message, command, request)
      logChannel.send(msg)
      break
    case COMMANDS.REP:
      msg = await rep(message, command, request)
      break
  }

  message.channel.send(msg)
}
