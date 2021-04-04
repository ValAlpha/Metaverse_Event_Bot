const { Command } = require("discord.js-commando")
const { MessageEmbed } = require("discord.js")
const { stripIndents } = require("common-tags")
const { RichDisplay } = require("great-commando")
const Discord = require("discord.js")

module.exports = class items extends Command {
    constructor(client) {
        super(client, {
            name: "items",
            description: "List all items",
            group: "owner",
            memberName: "items"
        })
    }

    async run(msg) {

        const ITEMS = await this.client.dbs.items.findOne({ DB_ID: process.env.DB_ID })

        const dbErrMsg = `Error finding item database. The developers are aware and are currently working on a fix. There is no need to report this to them.`

        if (!ITEMS) {

            if (this.client.missingDBErrorSent === false) {
                this.client.missingDBErrorSent = true
                msg.say(dbErrMsg).catch(err => console.log(err))
                this.client.owners.forEach(o => {
                    this.client.users.cache.get(o.id).send(`[Database missing] - CMD: \`items\``).catch(() => { })
                    return
                })
            } else if (this.client.missingDBErrorSent === true) {
                return msg.say(dbErrMsg).catch(err => console.log(err))
            }

        } else {

            const items = Array.from(ITEMS.items).map(i => `${i.name} - [Video](${i.link})`)
            const itemsPerPage = 10
            const chunks = new Array(Math.ceil(items.length / itemsPerPage)).fill().map(_ => items
                .splice(0, itemsPerPage).map(item => `• ${item}`))

            if (chunks.length > 0) {
                let e = new Discord.MessageEmbed().setAuthor(this.client.user.tag, this.client.user.displayAvatarURL({ dynamic: true })).setColor("#228B22")

                let display = new RichDisplay(e)
                chunks.forEach(chunk => display.addPage(e => e.setDescription(stripIndents`${chunk.join('\n')}`)))
                display.setFooterPrefix(`Total Items: ${ITEMS.items.length}\nPage: `)

                display.run(await msg.channel.send(`Loading...`), { filter: (reaction, user) => user.id === msg.author.id })
            } else {
                return msg.say(new MessageEmbed()
                .setAuthor(msg.author.username, msg.author.displayAvatarURL({dynamic: true}))
                .setTitle(`There are no items saved to the database yet!`)
                .setColor("RED")
                .setTimestamp()
                .setFooter(this.client.user.username, this.client.user.displayAvatarURL({dynamic: true}))
                ).catch(err => console.log(err))

            }
        }
    }
}