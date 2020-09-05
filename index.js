require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client({ partials: ['MESSAGE', 'REACTION'] })
const pkg = require('./package.json')
const { COMMANDS, ROLES } = require('./constants')
const { muteStorage, repStorage } = require('./storage')
const { findRoleByName } = require('./utils')

const prefix = '!'
const ban = require('./commands/ban')
const fc = require('./commands/fc')
const price = require('./commands/price')
const middleman = require('./commands/middleman')
const mute = require('./commands/mute')
const rep = require('./commands/rep')

const unmute = async () => {
  client.guilds.cache.forEach((g) => {
    const online = g.members.cache.filter((m) => m.presence.status === 'online')
    const muted = online.filter((m) => {
      const roleNames = Array.from(
        m.roles.cache.mapValues((r) => r.name).values(),
      )
      return roleNames.includes(ROLES.MUTED)
    })
    if (muted.size) {
      const guildRoles = g.roles.cache
      muted.forEach(async (m) => {
        const muteRecord = await muteStorage.get(m.id)
        if (!muteRecord) {
          m.roles.remove(findRoleByName(guildRoles, ROLES.MUTED))
        }
      })
    }
    console.log(`${g.name}: ${online.size} online, ${muted.size} muted`)
  })
}

// on startup, announce ourselves in each text channel
client.once('ready', async () => {
  setInterval(unmute, 1000 * 30)

  if (process.env.LOCAL) return
  client.guilds.cache.forEach((g) => {
    g.channels.cache.forEach((c) => {
      if (c.name !== 'bot-operations') return
      c.send(`${pkg.name} v${pkg.version} connected and ready!`)
    })
  })
})

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch()
    } catch (error) {
      reaction.message.channel.send('Could not record reaction.')
      return
    }
  }

  const { message } = reaction
  const { channel, content } = message

  if (channel.name !== 'rep-logs' || reaction.emoji.name !== '👎') return

  const reactor = message.guild.members.cache.get(user.id)
  const isReactorOwner = reactor.roles.cache.some((r) => {
    return r.name === ROLES.OWNER
  })
  if (!isReactorOwner) return

  const repOf = message.mentions.members.array()[1]
  const rep = await repStorage.get(repOf.id)
  const repMsg = content.split('"')[1]
  const filtered = rep.filter((r) => `_${r.msg}_` !== repMsg)
  const saved = await repStorage.set(repOf.id, filtered)
  if (saved && filtered.length + 1 === rep.length) {
    channel.send('Rep entry removed.')
  } else {
    channel.send('Rep could not be edited.')
  }
})

// each time a message is sent
client.on('message', (message) => {
  if (!message.content.startsWith(prefix)) return
  if (process.env.LOCAL && message.guild.name !== 'Lab Assistant Lab') return
  if (!process.env.LOCAL && message.guild.name === 'Lab Assistant Lab') return

  // parse command name and everything that follows into
  // command and request, respectively
  const [command, ...msg] = message.content.substr(1).split(' ')
  const request = msg.join(' ').trim()

  let reply = ''

  // every command handler should have the same signature
  // accepting `message`, `command`, and `request` arguments
  switch (command) {
    case COMMANDS.ADDREP:
    case COMMANDS.BADREP:
    case COMMANDS.REP:
    case COMMANDS.TOPREP:
      rep(message, command, request)
      // async so we bail
      return
    case COMMANDS.BAN:
    case COMMANDS.UNBAN:
      reply = ban(message, command, request)
      break
    case COMMANDS.FC:
    case COMMANDS.SETFC:
      fc(message, command, request)
      // async so we bail
      return
    case COMMANDS.PRICE:
    case COMMANDS.PRICENP:
      reply = price(message, command, request)
      break
    case COMMANDS.MIDDLEMAN:
      reply = middleman(message)
      break
    case COMMANDS.MUTE:
    case COMMANDS.UNMUTE:
      mute(message, command, request)
      return
    default:
      return
  }

  message.channel.send(reply)
})

client.login(process.env.BOT_TOKEN)
