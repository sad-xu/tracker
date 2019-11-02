// 重写浏览器自带方法

/**
 * Date.prototype.toJSON
 * Boolean.prototype.toJSON 
 * Number.prototype.toJSON
 * String.prototype.toJSON
 * JSON.stringify
 * JSON.parse
 */

"use strict";

function f(n)) {
  return n < 10 ? "0" + n : n
}
function this_value() {
  return this.valueOf()
}
function quote(e) {
  return rx_escapable.lastIndex = 0,
  rx_escapable.test(e) ? '"' + e.replace(rx_escapable,
  function(e) {
    var t = meta[e];
    return "string" == typeof t ? t: "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice( - 4)
  }) + '"': '"' + e + '"'
}
function str(e, t) {
  var r, s, n, a, i, o = gap,
  c = t[e];
  switch (c && "object" == typeof c && "function" == typeof c.toJSON && (c = c.toJSON(e)), "function" == typeof rep && (c = rep.call(t, e, c)), typeof c) {
  case "string":
    return quote(c);
  case "number":
    return isFinite(c) ? String(c) : "null";
  case "boolean":
  case "null":
    return String(c);
  case "object":
    if (!c) return "null";
    if (gap += indent, i = [], "[object Array]" === Object.prototype.toString.apply(c)) {
      for (a = c.length, r = 0; r < a; r += 1) i[r] = str(r, c) || "null";
      return n = 0 === i.length ? "[]": gap ? "[\n" + gap + i.join(",\n" + gap) + "\n" + o + "]": "[" + i.join(",") + "]",
      gap = o,
      n
    }
    if (rep && "object" == typeof rep) for (a = rep.length, r = 0; r < a; r += 1)"string" == typeof rep[r] && (s = rep[r], n = str(s, c), n && i.push(quote(s) + (gap ? ": ": ":") + n));
    else for (s in c) Object.prototype.hasOwnProperty.call(c, s) && (n = str(s, c), n && i.push(quote(s) + (gap ? ": ": ":") + n));
    return n = 0 === i.length ? "{}": gap ? "{\n" + gap + i.join(",\n" + gap) + "\n" + o + "}": "{" + i.join(",") + "}",
    gap = o,
    n
  }
}
var rx_one = /^[\],:{}\s]*$/,
rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
rx_four = /(?:^|:|,)(?:\s*\[)+/g,
rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;


"function" != typeof Date.prototype.toJSON && 
(
  Date.prototype.toJSON = function() {
    return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z": null
  },
  Boolean.prototype.toJSON = this_value
  Number.prototype.toJSON = this_value
  String.prototype.toJSON = this_value
);


var gap, indent, meta, rep;
"function" != typeof JSON.stringify && (
  meta = {
    "\b": "\\b",
    "\t": "\\t",
    "\n": "\\n",
    "\f": "\\f",
    "\r": "\\r",
    '"': '\\"',
    "\\": "\\\\"
  },
  JSON.stringify = function(e, t, r) {
    var s;
    if (gap = "", indent = "", "number" == typeof r) for (s = 0; s < r; s += 1) indent += " ";
    else "string" == typeof r && (indent = r);
    if (rep = t, t && "function" != typeof t && ("object" != typeof t || "number" != typeof t.length)) throw new Error("JSON.stringify");
    return str("", {
      "": e
    })
  }
),

"function" != typeof JSON.parse && (
  JSON.parse = function(text, reviver) {
    function walk(e, t) {
      var r, s, n = e[t];
      if (n && "object" == typeof n) for (r in n) Object.prototype.hasOwnProperty.call(n, r) && (s = walk(n, r), void 0 !== s ? n[r] = s: delete n[r]);
      return reviver.call(e, t, n)
    }
    var j;
    if (text = String(text), rx_dangerous.lastIndex = 0, rx_dangerous.test(text) && (text = text.replace(rx_dangerous,
    function(e) {
      return "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice( - 4)
    })), rx_one.test(text.replace(rx_two, "@").replace(rx_three, "]").replace(rx_four, ""))) return j = eval("(" + text + ")"),
    "function" == typeof reviver ? walk({
      "": j
    },
    "") : j;
    throw new SyntaxError("JSON.parse")
  }
)
