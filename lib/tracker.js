'use strict'

const { version } = require('../../package.json')
const Request = require('./core/Request')
const Storage = require('./core/Storage') 

/**
 * Create a new instance of Tracker
 *
 *
 */
function Tracker({request = {}, storage = {}}) {
	this.version = version
	this.request = new Request(request)
	this.storage = new Storage(storage)
}


module.exports = tracker


