const { MongoClient } = require('mongodb')
const { COMMANDS, ROLES } = require('../constants')
const { repStorage } = require('../storage')
const { findRoleByName } = require('../utils')

// !addrep @jack he rocks
const addRep = async function (message, command, request) {
  const author = message.author.id
  if (!message.mentions.members.size) return 'Add rep to who?'

  const [_, ...msg] = request.split(' ')
  if (!msg.length) {
    return 'Rep can only be given for a reason.'
  }

  const mentioned = message.mentions.members.first().id
  if (author === mentioned) {
    return 'Nice try, your mother would be so proud.'
  }
  const newRep = {
    from: author,
    msg: msg.join(' '),
    at: Date.now(),
    messageId: message.id,
  }
  const rep = (await repStorage.get(mentioned)) || []
  rep.push(newRep)
  const saved = await repStorage.set(mentioned, rep)
  if (saved) {
    return `<@${author}> gave rep to <@${mentioned}> because "_${newRep.msg}_"`
  } else {
    return 'Could not save rep'
  }
}

const badRep = async function (message, command, request) {
  const author = message.author.id
  if (!message.mentions.members.size) return 'Rip whose rep?'

  const [_, ...msg] = request.split(' ')
  if (!msg.length) {
    return 'Reputation can only be given for a reason.'
  }

  const roles = message.guild.roles.cache
  const adminRoleId = findRoleByName(roles, ROLES.ADMINISTRATOR).id

  const mentioned = message.mentions.members.first().id
  const newRep = {
    from: author,
    msg: msg.join(' '),
    at: Date.now(),
    neg: true,
    messageId: message.id,
  }
  const rep = (await repStorage.get(mentioned)) || []
  rep.push(newRep)
  const saved = await repStorage.set(mentioned, rep)
  if (saved) {
    let msg = `<@${author}> gave **bad** rep `
    msg += `to <@${mentioned}> because "_${newRep.msg}_"\n`
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
  rep.slice(-5).forEach((r) => {
    if (!r.msg) return
    msg += r.neg ? ' - ' : ' + '
    msg += ` "${r.msg}"\n`
  })
  return msg
}

const topRep = async function (message, command, request) {
  const client = await MongoClient.connect(process.env.MONGODB_URI)
  const db = client.db(process.env.DATABASE_NAME)
  const coll = db.collection('keyv')
  const results = await coll.find({ key: { $regex: '^rep:' } }).toArray()
  let leaders = []
  for (let i = 0; i < results.length; i++) {
    const entry = {
      ...JSON.parse(results[i].value),
      key: results[i].key,
    }
    leaders.push(entry)
  }
  leaders = leaders.sort((a, b) => {
    return b.value.length - a.value.length
  })
  let msg = '**Leaderboard**\n\n'
  leaders.slice(0, 10).forEach((leader, i) => {
    const member = message.guild.members.cache.get(leader.key.substr('4'))
    const id = member ? member.user.username : leader.key.substr('4')
    msg += `${i + 1}. ${id} **[${leader.value.length}]**\n`
  })
  return msg
}

module.exports = async function (message, command, request) {

if (message.channel.name !== 'reputation') {
    const channelId = message.guild.channels.cache.find((c) => {
      if (c.name === 'reputation') return c.id
    })
    return `This command can only be used in ${channelId}`
  }

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
    case COMMANDS.TOPREP:
      msg = await topRep(message, command, request)
      break
  }

  message.channel.send(msg)
}
