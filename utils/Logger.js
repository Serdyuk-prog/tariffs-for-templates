const crypto = require("crypto")

class Logger {

    static getUniqueId() {
        return crypto.randomUUID()
    }

    constructor() {
        this.id = Logger.getUniqueId()
    }

    getString(message) {
        return `[${new Date().toLocaleString()}] [${this.id}] ${message}`
    }

    log(message) {
        console.log(this.getString(message))
    }

    warn(message) {
        console.warn(this.getString(message))
    }

    error(message) {
        console.error(this.getString(message))
    }
}

module.exports = Logger
