const { Command } = require("discord.js-commando")
const { MessageEmbed } = require("discord.js")
const { stripIndents } = require("common-tags")
 
module.exports = class additem extends Command {
    constructor(client) {
        super(client, {
            name: "additem",
            description: "Add an item to the database",
            group: "owner",
            memberName: "additem",
            aliases: ["ai"],
            ownerOnly: true,
            args: [{
                type: "string",
                prompt: "What is the YouTube link to this item?",
                key: "link"
            },{
                type: "string",
                prompt: "What's the item name?",
                key: "name",
                parse: n => n.toUpperCase()
            }]
        })
    }

    async run(msg, { link, name }) {

        const vidData = await this.client.functions.getMeta.getMetaData(link)
        const thumbnail = vidData.thumbnails.high.url
        const title = vidData.title

        const addedEmbed = new MessageEmbed()
        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL({ dynamic: true }))
        .setTitle(`New item added!`)
        .setDescription(stripIndents`
            Item Name: ${name}
            Link: [${title}](${link})`)
        .setColor("RANDOM")
        .setTimestamp()
        .setFooter(`Added By: ${msg.author.username}`, msg.author.displayAvatarURL({ dynamic: true }))
        thumbnail ? addedEmbed.setImage(thumbnail) : null

        const ITEMS = await this.client.dbs.items.findOne({ DB_ID: process.env.DB_ID })
        if (!ITEMS) {
            new this.client.dbs.items({
                DB_ID: process.env.DB_ID,
                items: [{ name, link, title, thumbnail }]
            }).save().catch(err => console.log(err))
            return msg.say(addedEmbed).catch(err => console.log(err))
        }

        const itemExists = ITEMS.items.find(i => i.name === name)
        if (itemExists) {
            return msg.say(new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL({ dynamic: true }))
                .setTitle(`An item named: \`${name}\` already exists in the database`)
                .setTimestamp())
        } else {
            ITEMS.items.push({ name, link, name, thumbnail })

            ITEMS.save().catch(err => console.log(err))
            return msg.say(addedEmbed).catch(err => console.log(err))
        }
    }
}