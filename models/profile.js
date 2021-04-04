const mongoose = require("mongoose")

const profile = new mongoose.Schema({

    userID: {type: String, default: ""}, 
    collectedItems: {type: Array, default: []}

})

module.exports = mongoose.model("profile", profile)