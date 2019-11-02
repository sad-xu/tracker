'use strict'

const { version } = require('../../package.json')
const Request = require('./core/Request')
const Storage = require('./core/Storage') 

/**
 * Create a new instance of Tracker
 * {
 *		requestConfig: {},  // 请求配置  
 *		storageConfig: {},	// 存储配置
 * }
 *
 */
function Tracker({requestConfig = {}, storageConfig = {}}) {
	this.version = version

	let defaultConfig = {  // 默认配置 + 初始化配置
		method: 'get', 
		timeout: 0, 
		headers: {}, 
		responseType: 'json',
		...requestConfig
	}
	this.request = function(config = {}) {  // 每个请求的配置
		return Request({defaultConfig, ...config})
	}

	
	this.storage = new Storage(storageConfig)
}


module.exports = tracker


