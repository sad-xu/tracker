'use strict';

/*
	{
		url: '',
		method: 'get',			//
		headers: {},				// 自定义请求头
		params: {},					// url参数
		data: {},						// 主体数据 put/post/patch
		timeout: 1000,			// 超时时间
		responseType: json /暂定,   // 响应类型
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


function Request({ url, method = 'get', params, timeout = 0, 
	headers = {}, data, responseType = 'json' }) {
	return new Promise((resolve, reject) => {
		// FormData 类型
		if ((typeof FormData !== 'undefined') && (data instanceof FormData)) {
			delete headers['Content-Type']
		}

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
			if (!xhr) return
			reject({
				request: xhr,
				errmsg: 'request abort'
			})
			xhr = null
		}
		xhr.onerror = () => {
			reject({
				request: xhr,
				errmsg: 'request error'
			})
			xhr = null
		}
		xhr.ontimeout = () => {
			reject({
				request: xhr,
				errmsg: 'request timeout'
			})
			xhr = null
		}
		// 设置请求头
		if ('setRequestHeader' in xhr) {  
			for (let key in headers) {
				if (typeof data === 'undefined' && key.toLowerCase() === 'content-type') {
					delete headers[key]
				} else {
					xhr.setRequestHeader(key, headers[key0])
				}
			}
		}
		// 响应类型
		if (responseType) {
			try {
				xhr.responseType = responseType
			} catch(e) {
				if (responseType !== 'json') throw e
			}
		}
		if (data === undefined) data = null
		xhr.send(data)
	})
}


