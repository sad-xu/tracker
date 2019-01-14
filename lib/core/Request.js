'use strict';

/*
	{
		url: '',
		method: 'get',			//
		headers: {},				// 自定义请求头
		params: {},					// url参数
		data: {},						// 主体数据 put/post/patch
		timeout: 1000,			// 超时时间
		responseType: ??,   // 响应类型
	}
*/

function encode(val) {
	return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

// 序列化params 查询字符串参数
function buildURL(url, params) {
	if (!params) return url
	let serializedParams,
			parts = []
	for (let key in params) {
		let val = params[key]
		if (val === null || typeof val === 'undefined') return
		if (toString.call(val) !== '[object Array]') {
			val = [val]
		}
		for (let k in val) {
			let v = val[k]
			if (toString.call(val) === '[object Date]') {
				v = v.toISOString()
			} else if (v !== null && typeof v === 'object') {
				v = JSON.stringify(v)
			}
			parts.push(`${encode(key)}=${encode(v)}`)
		}
	}
	serializedParams = parts.join('&')
	if (serializedParams) {
		let hashmarkIndex = url.indexOf('#')
		if (hashmarkIndex !== -1) {  // 去除hash影响
			url = url.slice(0, hashmarkIndex)
		}
		url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
	}
	return url
}


function Request({url, method, params, timeout = 0}) {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest()
		xhr.open(method.toUperCase(), buildURL(url, params), true)
		xhr.timeout = timeout
		xhr.onreadystatechange = () => {
			if (!xhr || xhr.readyState !== 4) return
			// TODO: 响应
			let response = {
				data: 'response data'
			}		
			if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
				resolve(response)
			} else {
				reject({
					err: 'err'
				})
			}
			xhr = null
		}
		xhr.onabort = () => {

		}
		xhr.onerror = () => {

		}
		xhr.ontimeout = () => {
			
		}
	})
}


