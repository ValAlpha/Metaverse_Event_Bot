const mongoose = require("mongoose")

const items = new mongoose.Schema({
    DB_ID: {type: String, default: process.env.DB_ID}, 
    items: {type: Array, default: []}
})

module.exports = mongoose.model("items", items)