/* This is free and unencumbered software released into the public domain.
 * License: Unlicense
 * For more information, please refer to <http://unlicense.org/>
 */
function geoLite(nBase, dbBuf, asnBuf, contCC, contCCCN, topCC, cccn, ebCC, translations) {
	"use strict";
	var me = geoLite, byMM = {}, cc2cont = {}, tro = translations,
		cont2cn = {}, o122 = {}, a122 = "ABCDEFGHIJKLMNOPQRSTUVWXY".split("");
	me.byCC = {}, me.ebCC = {}, me.byASNCode = asnBuf.split(";");
	// alloc o122
	for (var i in (topCC = topCC.match(/([A-Z]{2})/g))) o122[a122[i]] = topCC[i];
	// alloc ebCC
	for (var i = 1, arr = ebCC.split(/([A-Z]{1,2})/), c = arr.length; i < c; i += 2)
		me.ebCC[arr[0 + i]] = arr[1 + i];
	// alloc cont2cn
	for (i = 1, arr = contCCCN.split(/([A-Z]{2};)/), c = arr.length; i < c; i += 2)
		cont2cn[arr[0 + i].slice(0, 2)] = arr[1 + i];
	// alloc byCC
	for (i = 1, arr = cccn.split(/([A-Z]{2};)/), c = arr.length; i < c; i += 2)
		me.byCC[arr[0 + i].slice(0, 2)] = arr[1 + i];
	// alloc cc2cont
	for (i = 1, arr = contCC.split(/([A-Z]{2};)/), c = arr.length; i < c; i += 2)
		for (var i2 = 0, arr2 = arr[1 + i].match(/([A-Z]{2})/g), c2 = arr2.length; i2 < c2; i2++)
			cc2cont[arr2[i2]] = arr[0 + i].slice(0, 2);
	// cbToNum func def
	var cbToNum = (function () {
		var chr = "0123456789abcdefghijklmnopqrstuvwxyz!#$%&'()*+,-./:<=>@[]^_`{|}~? \u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u000b\u000c\u000e\u000f\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f\u007f",
			tbl = {}, base = chr.length;
		for (var i = 0; i < base; i++) tbl[chr.charAt(i)] = i;
		return function (str, maxBase) {
			for (var retVal = 0, b = maxBase||base, table = tbl, i = 0, c = str.length; i < c; i++)
				retVal = (retVal * b) + (table[str[i]] || 0);
			return retVal;
		};
	})();
	// allocate buffer
	for (i in (dbBuf = dbBuf.split("\t"))) {
		var item = dbBuf[i],
			parts = item.split(";"),
			mainVal = parts[0],
			starts = parts.slice(1),
			// iCc[0=ipCount,1=countryCode,2=asosi]
			iCc = mainVal.split(/([A-Z]{1,2})/),
			countryCode = iCc[1],
			ipCount = cbToNum(iCc[0], nBase),
			asosi = "" != iCc[2] ? cbToNum("" + iCc[2], nBase) : -1;
		// skip empty items
		if (!parts[1]) continue;
		// alloc partial ip
		for (var a = 0, c = starts.length; a < c; a++) {
			var ipStart = cbToNum(starts[a], nBase),
				sv = 16777216 + ipStart, ev = sv + ipCount,
				val = [countryCode, sv, ev, asosi];
			// Loop through all major values between sv and ev
			for (var sP1 = sv >>> 24 & 0xFF, sP2 = sv >>> 16 & 0xFF, eP1 = ev >>> 24 & 0xFF, eP2 = ev >>> 16 & 0xFF, p1 = sP1; p1 <= eP1; p1++)
				for (var key, p2start = (p1 === sP1) ? sP2 : 0, p2end = (p1 === eP1) ? eP2 : 255, p2 = p2start; p2 <= p2end; p2++)
					// allocate ip part1.part2
					(byMM[key = p1 + '.' + p2] = byMM[key] || []).push(val);
		}
	}
	me.lookup = function (ipAddr) {
		var parts = ipAddr.trim().split("."),
			nIP = parts[0] * 16777216 + parts[1] * 65536 + parts[2] * 256 + +parts[3],
			key = parts[0] + "." + parts[1],
			byMMVal = byMM[key];
		// fast enough
		for (var i = 0, c = byMMVal.length; i < c; i++)
			if (nIP >= byMMVal[i][1] && nIP < byMMVal[i][2]) {
				var ccode = byMMVal[i][0] || "Z";
				ccode = 1 === ccode.length && o122[ccode] || ccode; 
				return {
					IP: ipAddr, CC: ccode || "Z", CN: me.byCC[ccode] || tro && tro.ukCN || "",
					emoji: me.ebCC[ccode],
					ASO: me.byASNCode[byMMVal[i][3]] || tro && tro.ukASO || "",
					sr: byMMVal[i][1], er: byMMVal[i][2],
					n: nIP,
					debugInfo: byMMVal,
					contCode: cc2cont[ccode] || tro && tro.ukContCode || "",
					contName: cont2cn[cc2cont[ccode]] || tro && tro.ukContName || ""
				};
			}
	};
	me.getIPv4n = me.ipv4n = function (ip) {
		var parts = ip.split(".");
		return parts[0] * 16777216 + parts[1] * 65536 + parts[2] * 256 + +parts[3];
	};
	me.getIPv4 = me.ipv4 = function (num) {
		return [num >>> 24 & 0xFF, num >>> 16 & 0xFF, num >>> 8 & 0xFF, num & 0xFF].join(".");
	};
	me.fetchPubIPv4 = function (callback) {
		var ac, conf = (me.ipFetchURLs || (me.ipFetchURLs = [
			"https://icanhazip.com", "https://httpbin.org/ip"
		]));
		~function fetchIp(ci){
			var x = new XMLHttpRequest, u = conf[ci];
			if (ac || !u) return ac || callback(null);
			x.timeout = Math.min(me.ipFetchTimeout || 5000, me.ipFetchMaxTimeout || 9000);
			x.open("GET", u, true);
			x.onreadystatechange = function () {
				if (200 != x.status || 4 > x.readyState) return;
				(ac = x.responseText.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g)) && callback(ac, x, u, new Date - x._time);
			}, x.send(), x._time = +new Date;
			setTimeout(fetchIp, x.timeout += 500, ++ci);
		}(0);
	};
	me.pubIpFromRange = function (start, count) { return me.getIPv4((Math.max(start, 16777216) + Math.floor(Math.random() * Math.min(count || 4294967295, 4294967295 - Math.max(start, 16777216)))) >>> 0); };
}
