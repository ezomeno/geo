/* This is free and unencumbered software released into the public domain.
 * License: Unlicense
 * For more information, please refer to <http://unlicense.org/>
 */

// Usage command: node geoLite-dev
// Usage command: ~/.bun/bin/bun geoLite-dev.js
// bun should be >27% faster

/* Fun facts (about data file):
 * 20241017: 5.9 MiB (6_168_683)
 * 20251025: 6.4 MiB (6_665_431 diff 497K) (373days after 2024-oct-17)
 * 20260401: 6.5 MiB (6_792_669 diff 127K) (158days after 2025-oct-25)
 */
var fs = require('fs');
var MMDBReader = require('mmdb-reader');
var geoLiteConfig = {
	scriptAct: 2, //0=csv2data, 1=mmdb2csv, 2=mmdb2csv+csv2data, 3=unitTest, 4=makeDetailedCSV
	defaultDbDate: "20260410", // 20230107,20241017,20251025,20260401
	knownSpeed: 1341255, // 1341255
	numberBase: 96, // use 66 instead if encoding issues (max base: 96)
	addASN: true, // ASN is similar to ISP, if false then ~19% less data.
	mmdbPath: "./mmdb/",
	xsvSavePath: "./csv/",
	geoCSVName: "geoip-", // followed by defaultDbDate
	detailedCSVName: "geoipEtc-", // followed by defaultDbDate
	IP: {
		// usually never configured
		startNum: 16777216, // 16777216 = start of public IPs
		endNum: 4294967295, // default: 4294967295(max) when endNum=0
	},
	dataName: "geoLite.datav5-", // followed by defaultDbDate
	ebCC: (
		// reconfigure this manually if need be
		// format: {countryCode}{emoji}
		"Z🏳️AD🇦🇩AE🇦🇪AF🇦🇫AG🇦🇬AI🇦🇮AL🇦🇱AM🇦🇲AO🇦🇴AQ🇦🇶AR🇦🇷AS🇦🇸AT🇦🇹AU🇦🇺AW🇦🇼AX🇦🇽AZ🇦🇿BA🇧🇦BB🇧🇧BD🇧🇩BE🇧🇪BF🇧🇫BG🇧🇬BH🇧🇭BI🇧🇮BJ🇧🇯BL🇧🇱BM🇧🇲BN🇧🇳BO🇧🇴BQ🇧🇶BR🇧🇷BS🇧🇸BT🇧🇹BV🇧🇻BW🇧🇼BY🇧🇾BZ🇧🇿CA🇨🇦CC🇨🇨CD🇨🇩CF🇨🇫CG🇨🇬CH🇨🇭CI🇨🇮CK🇨🇰CL🇨🇱CM🇨🇲CN🇨🇳CO🇨🇴CR🇨🇷CU🇨🇺CV🇨🇻CW🇨🇼CX🇨🇽CY🇨🇾CZ🇨🇿DE🇩🇪DJ🇩🇯DK🇩🇰DM🇩🇲DO🇩🇴DZ🇩🇿EC🇪🇨EE🇪🇪EG🇪🇬EH🇪🇭ER🇪🇷ES🇪🇸ET🇪🇹FI🇫🇮FJ🇫🇯FK🇫🇰FM🇫🇲FO🇫🇴FR🇫🇷GA🇬🇦GB🇬🇧GD🇬🇩GE🇬🇪GF🇬🇫GG🇬🇬GH🇬🇭GI🇬🇮GL🇬🇱GM🇬🇲GN🇬🇳GP🇬🇵GQ🇬🇶GR🇬🇷GS🇬🇸GT🇬🇹GU🇬🇺GW🇬🇼GY🇬🇾HK🇭🇰HM🇭🇲HN🇭🇳HR🇭🇷HT🇭🇹HU🇭🇺ID🇮🇩IE🇮🇪IL🇮🇱IM🇮🇲IN🇮🇳IO🇮🇴IQ🇮🇶IR🇮🇷IS🇮🇸IT🇮🇹JE🇯🇪JM🇯🇲JO🇯🇴JP🇯🇵KE🇰🇪KG🇰🇬KH🇰🇭KI🇰🇮KM🇰🇲KN🇰🇳KP🇰🇵KR🇰🇷KW🇰🇼KY🇰🇾KZ🇰🇿LA🇱🇦LB🇱🇧LC🇱🇨LI🇱🇮LK🇱🇰LR🇱🇷LS🇱🇸LT🇱🇹LU🇱🇺LV🇱🇻LY🇱🇾MA🇲🇦MC🇲🇨MD🇲🇩ME🇲🇪MF🇲🇫MG🇲🇬MH🇲🇭MK🇲🇰ML🇲🇱MM🇲🇲MN🇲🇳MO🇲🇴MP🇲🇵MQ🇲🇶MR🇲🇷MS🇲🇸MT🇲🇹MU🇲🇺MV🇲🇻MW🇲🇼MX🇲🇽MY🇲🇾MZ🇲🇿NA🇳🇦NC🇳🇨NE🇳🇪NF🇳🇫NG🇳🇬NI🇳🇮NL🇳🇱NO🇳🇴NP🇳🇵NR🇳🇷NU🇳🇺NZ🇳🇿OM🇴🇲PA🇵🇦PE🇵🇪PF🇵🇫PG🇵🇬PH🇵🇭PK🇵🇰PL🇵🇱PM🇵🇲PN🇵🇳PR🇵🇷PS🇵🇸PT🇵🇹PW🇵🇼PY🇵🇾QA🇶🇦RE🇷🇪RO🇷🇴RS🇷🇸RU🇷🇺RW🇷🇼SA🇸🇦SB🇸🇧SC🇸🇨SD🇸🇩SE🇸🇪SG🇸🇬SH🇸🇭SI🇸🇮SJ🇸🇯SK🇸🇰SL🇸🇱SM🇸🇲SN🇸🇳SO🇸🇴SR🇸🇷SS🇸🇸ST🇸🇹SV🇸🇻SX🇸🇽SY🇸🇾SZ🇸🇿TC🇹🇨TD🇹🇩TF🇹🇫TG🇹🇬TH🇹🇭TJ🇹🇯TK🇹🇰TL🇹🇱TM🇹🇲TN🇹🇳TO🇹🇴TR🇹🇷TT🇹🇹TV🇹🇻TW🇹🇼TZ🇹🇿UA🇺🇦UG🇺🇬UM🇺🇲US🇺🇸UY🇺🇾UZ🇺🇿VA🇻🇦VC🇻🇨VE🇻🇪VG🇻🇬VI🇻🇮VN🇻🇳VU🇻🇺WF🇼🇫WS🇼🇸YE🇾🇪YT🇾🇹ZA🇿🇦ZM🇿🇲ZW🇿🇼"
	),
	translations: {
		ukCN: "(Unknown)",
		ukASO: "(Unknown)",
		ukContName: "(Unknown)",
		ukContCode: "Unknown"
	},
	lang: "en", // refers to mmdb only (eg: obj.country.names.en)
	langFallback: "en" // refers to mmdb only (eg: obj.country.names.en)
}, licenseStr = "/*License: Unlicense*/\n";

// to configure translations further edit function: getCountryInfo
// File name format: GeoLite2-City-[yearMonthDate].mmdb
// Example: GeoLite2-City-20230107.mmdb
var args = process.argv.slice(2), dbDate = args[0] || geoLiteConfig.defaultDbDate;
var cityReader = new MMDBReader(mmdbPath("GeoLite2-City-" + year(dbDate)));
var asnReader = new MMDBReader(mmdbPath("GeoLite2-ASN-" + year(dbDate)));
// city.mmdb usually contains enough info THUS country.mmdb not needed.
// asn.mmdb usually contains ASO only.
var doTask = {
	"0": makeData, "1": makeCSV,
	"2": function () { makeCSV(); makeData(); },
	"3": unittestDbg, "4": makeDetailedCSV
};

//return unittestDbg()
function unittestDbg() {
	var unittest = JSON.parse(fs.readFileSync("unittest.json"));
	var asoFailed = [], failed = 0;
	for (var i in unittest) {
		var item = unittest[i].split(";"),
			r1 = getCountryInfo(cityReader.lookup(item[0])),
			aso = asnReader.lookup(item[0]);
		// only ignore backslashes in ASO
		aso = (aso && aso.autonomous_system_organization || "(Unknown)").replace(/\\/g, "").trim();
		item[2] = item[2].replace(/\\/g, "").trim();
		// item[0=ip,1=ccode,2=aso]
		if (("" + item[1]) !== (r1[0] || "Z")) failed++, console.log("HALT; country code;", "ip:", item[0], "index:", i, ";", "expected code:", item[1], "; but got:", r1[0], ";");
		if (geoLiteConfig.addASN && item[2] != aso) {
			failed++;
			console.log("FATAL; ", "ip:", item[0], "index:", i, ";", "expected ASO:", aso, "; got ASO:", item[2], ";");
			asoFailed.push([item[0], aso, item[2]]);
		}
	}
	if (failed < 1) console.log("No failed tests.");
}

function getCountryInfo(r) {
	var t, lang = geoLiteConfig.lang,
		dLang = geoLiteConfig.langFallback,
		ccode = "", cname = "", contName = "", contCode = "";
	if (r && (t = r.country || r.registered_country))
		ccode = t.iso_code || ccode,
		cname = (t.names[lang] || t.names[dLang]) || cname;
	if (r && r.continent)
		contCode = r.continent.code || contCode,
		contName = (r.continent.names[lang] || r.continent.names[dLang]) || contName;
	return [ccode, cname, contCode, contName];
}
function size2str(size, decimals) {
	return (size / 1048576).toFixed(decimals || 5) + "MiB (" + (size / 1e6).toFixed(decimals || 5) + "MB; " + size + "B)";
}
function mmdbPath(name) { return geoLiteConfig.mmdbPath + name + ".mmdb"; }
function xsvPath(name, ext) { return geoLiteConfig.xsvSavePath + name + "." + (ext || "csv"); }
function dataPath(name) { return geoLiteConfig.dataName + name + ".js"; }
function geoipCSVFilePath() { return xsvPath(geoLiteConfig.geoCSVName + dbDate); }
function year(x) { return x || new Date().getFullYear(); }
function basedNum(n, y) { return num2cb(n, y); }
function filesize(filePath) { return fs.statSync(filePath).size; }
function sortByCharCode(aStr) { return aStr.split("").sort(function (a, b) { return a.charCodeAt(0) - b.charCodeAt(0); }).join(''); }

// num2cb is compatible with: Number.toString(n)
var num2cb = function () {
	// without: [\t\n\r;\\"]
	var chars = "0123456789abcdefghijklmnopqrstuvwxyz!#$%&'()*+,-./:<=>@[]^_`{|}~? \u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u000b\u000c\u000e\u000f\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f\u007f",
		base = chars.length;
	return function (aNumber, aMaxBase) {
		for (var retVal = "", b = aMaxBase || base, charIdx, remain = Math.floor(aNumber); ;) {
			charIdx = remain % b;
			retVal = chars.charAt(charIdx) + retVal;
			remain = Math.floor(remain / b);
			if (!remain) break;
		}
		return retVal;
	};
}();
function rankByCount(aMap, aMaxItemCount, aNoBlankKey) {
	var array = [], retArray = [], byNumber = {}, byData = {}, fullArray = [];
	for (var key in aMap)
		if (aMap.hasOwnProperty(key))
			if (aNoBlankKey && "" != key)
				array.push([key, aMap[key]]);
			else if (!aNoBlankKey)
				array.push([key, aMap[key]]);
	// sort descending
	array.sort(function (a, b) { return b[1] - a[1]; });
	// mapping
	for (var i = 0, mc = aMaxItemCount || array.length; i < mc; i++) {
		// item[0=data, 1=dataCount]
		var item = array[i], data = item[0], count = item[1];
		byNumber[i] = { key: data, count: count };
		byData[data] = { key: i, count: count };
		fullArray.push({ i: i, data: data, count: count });
		retArray.push(array[i][0]);
	}
	retArray.byNum = byNumber;
	retArray.byData = byData;
	retArray.array = fullArray;
	return retArray;
}

function makeData() {
	var addASN = geoLiteConfig.addASN,
		baseN = geoLiteConfig.numberBase,
		newdata = [], ndbuffer = {}, c2continent = {}, continentCodeNameMap = {}, topCCode = {}, countryMap = {},
		asosByCount = {}, lines = fs.readFileSync(geoipCSVFilePath());
	lines = lines.toString().split("\n").slice(1);
	console.log("Stage 1: Reduce size by base10 to base" + geoLiteConfig.numberBase + " number.");
	for (var i = 0, lineCount = lines.length; i < lineCount; i++) {
		// cols[0=IPStart,1=IPCount,2=CountryCode,3=ASO]
		var sv, cols = lines[i].split(",");
		if (cols.length < 3) continue;
		// find/add ASN index (ISP related)
		var aso = cols.slice(3).join(",").trim().replace(/;/g, "\\x3B").replace(/"/g, "");
		asosByCount[aso] && asosByCount[aso]++ || (asosByCount[aso] = 1);
		// for ranking the country codes
		topCCode[cols[2]] = topCCode[cols[2]] || 0;
		topCCode[cols[2]]++;
		// assign basedness
		// engine bug: bunjs can hang on: +cols[0] - 16777216 results in negative value somehow, using parseFloat
		cols[0] = basedNum(sv = parseFloat(cols[0]) - 16777216, baseN);
		cols[1] = basedNum(sLen = parseFloat(cols[1]), baseN);
		cols[2] = cols[2] || "Z";
		cols[3] = aso;
		newdata.push(cols.slice(0, 4));
		// alloc continent if any
		var ip = nipv4(16777216 + sv), cc, r1 = cityReader.lookup(ip),
			cinfo = getCountryInfo(r1);
		// cinfo[0=ccode, 1=cname, 2=contCode, 3=contName]
		if ("" != cinfo[0] && "" != cinfo[1])
			countryMap[cinfo[0]] = cinfo[1];
		if ("" != cinfo[2] && "" != cinfo[0])
			c2continent[cinfo[0]] = cinfo[2],
			continentCodeNameMap[cinfo[2]] = cinfo[3];
	}
	// grouping country codes by continent
	var continentsBuf = "", tmp, continentMap = {};
	for (var cc in c2continent)
		(continentMap[tmp = c2continent[cc]] = continentMap[tmp] || []).push(cc);
	// dissolve continentMap to save bytes
	for (var contC in continentMap)
		continentsBuf += contC + ";" + continentMap[contC].join("");
	// rank ASOs
	var rankedASOs = rankByCount(asosByCount), byASO = rankedASOs.byData;
	// etc
	if (addASN) console.log("Stage 2: Reduce size by ASO ranking...");
	else console.log("Stage 2: SKIPPED; No ASO ranking due config.");
	if (addASN) for (var i in newdata) {
		// newdata[i][3] = aso
		var aso = newdata[i][3], asn = byASO[aso];
		newdata[i][3] = asn.key;
	}
	console.log("Stage 3: Reduce size by object key combo, CountryCode ranking.");
	// no Z in ccReplacers, as intended
	var ccReplacers = "ABCDEFGHIJKLMNOPQRSTUVWXY".split(""),
		rankedCCs = rankByCount(topCCode, ccReplacers.length, true),
		byCC = rankedCCs.byData,
		CCarr = rankedCCs.slice();
	// polishing data further
	for (var i in newdata) {
		// item[0=IPStart,1=IPCount,2=CountryCode,3=ASN]
		var item = newdata[i],
			asn = item[3], cc = item[2], ipCount = item[1],
			ri = byCC[cc] && byCC[cc].key,
			ccode = (ri > -1 ? ccReplacers[ri] : cc) || "Z",
			asnStr = (addASN && asn ? basedNum(asn, baseN) : ""),
			key = ipCount + ccode + asnStr;
		ndbuffer[key] = ndbuffer[key] || [];
		ndbuffer[key].push(item[0]);
	}
	// dissolve ndbuffer to save bytes
	var ndbuf = "";
	for (var n in ndbuffer) ndbuf += n + ";" + ndbuffer[n].join(";") + "\t";
	var tmp, asos = Array.apply(0, rankedASOs), asosPChr = {};
	// handle asn if specified in config
	if (addASN) {
		for (var i in asos) for (var i2 in (tmp = asos[i].split(""))) asosPChr[tmp[i2]] = 1;
		// print ASO's possible chars
		console.log("ASO chars:", sortByCharCode(Object.keys(asosPChr).join('')));
	}
	// continent code and name buffer
	var continentCodeNameBuf = "";
	for (var code in continentCodeNameMap)
		continentCodeNameBuf += code + ";" + continentCodeNameMap[code];
	// country code and name buffer
	var countryBuf = "";
	for (var code in countryMap)
		countryBuf += code + ";" + countryMap[code];
	// consolidating all buffers
	var byteBuf = '"' + ndbuf + '"',
		asosBuf = '"' + asos.join(";") + '"',
		contCCBuf = '"' + continentsBuf + '"',
		contCCCNBuf = '"' + continentCodeNameBuf + '"',
		CCarrBuf = '"' + CCarr.join("") + '"',
		cccnBuf = '"' + countryBuf + '"',
		ebCCBuf = '"' + geoLiteConfig.ebCC + '"',
		transBuf = JSON.stringify(geoLiteConfig.translations),
		fileBuf = (
			licenseStr + "geoLite(" 
			+ geoLiteConfig.numberBase.toString()
			+ "," + (byteBuf)
			+ "," + (asosBuf)
			+ "," + (contCCBuf)
			+ "," + (contCCCNBuf)
			+ "," + (CCarrBuf)
			+ "," + (cccnBuf)
			+ "," + (ebCCBuf)
			+ "," + (transBuf)
			+ ");"
		),
		dataFilename = dataPath(dbDate);
	console.log("------ Buffers ------");
	console.log("GeoIP:", size2str(byteBuf.length));
	console.log("ASOs:", size2str(asosBuf.length));
	fs.writeFileSync(dataFilename, (fileBuf));
	console.log("------ Files ------")
	console.log("DB Date:", dbDate);
	console.log("Data File Size:", size2str(filesize(dataFilename)));
	console.log("Data File Name:", dataFilename);
	console.log("PROTIP: Serve data.js with gzip server-side compression! Reduces size further.");
}

function makeDetailedCSV() {
	var newdata = [], lines = fs.readFileSync(geoipCSVFilePath()), cc2cc = {};
	lines = lines.toString().split("\n").slice(1);
	var startLine = "IPStart,IPCount,CountryCode,CountryName,ContinentCode,ContinentName,ASO";
	console.log("Stage 1: Allocate rough data.");
	for (var i = 0, lineCount = lines.length; i < lineCount; i++) {
		// cols[0=IPStart,1=IPCount,2=CountryCode,3=ASO]
		var cols = lines[i].split(",");
		if (cols.length < 3) continue;
		// find/add ASN index (ISP related)
		var aso = cols.slice(3).join(",").trim().replace(/;/g, "\\x3B");
		// alloc continent if any
		var ip = nipv4(cols[0]), r1 = cityReader.lookup(ip),
			cinfo = getCountryInfo(r1);
		// cinfo[0=ccode, 1=cname, 2=contCode, 3=contName]
		if ("" != cinfo[3] && "" != cinfo[0])
			cc2cc[cinfo[0]] = [cinfo[2], cinfo[3]];
		// newdata[0=IPStart,1=IPCount,2=CountryCode,3=CountryName,4=ContinentCode,5=ContinentName,6=ASO]
		newdata.push([cols[0], cols[1], cinfo[0], cinfo[1], cinfo[2], cinfo[3], aso]);
	}
	console.log("Stage 2: Fill missing spots.");
	for (var i in newdata) {
		var cols = newdata[i], contCodeNameArr = cc2cc[cols[2]];
		// cols[0=IPStart,1=IPCount,2=CountryCode,3=CountryName,4=ContinentCode,5=ContinentName,6=ASO]
		// contCodeNameArr[0=contCode,1=contName]
		cols[4] = contCodeNameArr ? contCodeNameArr[0] : cols[4];
		cols[5] = contCodeNameArr ? contCodeNameArr[1] : cols[5];
	}
	var dataFilename = xsvPath(geoLiteConfig.detailedCSVName + dbDate);
	fs.writeFileSync(dataFilename, startLine + "\r\n" + newdata.join("\r\n"));
	console.log("CSV File Size:", size2str(filesize(dataFilename)));
	console.log("Done.");
}

function makeCSV() {
	var addASN = geoLiteConfig.addASN,
		startAddr = geoLiteConfig.IP.startNum,
		maxIPNum = geoLiteConfig.IP.endNum || 4294967295,
		skipto = startAddr,
		knownSpeed = geoLiteConfig.knownSpeed,
		csvStartLine = "IPStart,IPCount,CountryCode" + (addASN ? ",ASO" : "") + "\r\n";
	fs.writeFileSync(geoipCSVFilePath(), csvStartLine);
	var startDate = Date.now(), lastElapsed, lastSpeed;
	for (var dc = 0, ipCount = 0, lcc, laso, i = skipto, startIdx = i; i < maxIPNum; i++) {
		var ipv4 = nipv4(i),
			r = cityReader.lookup(ipv4),
			r2 = addASN && asnReader.lookup(ipv4),
			caso = (r2 && r2.autonomous_system_organization || ""),
			info = getCountryInfo(r);
		// info[0=ccode, 1=cname, 2=contCode, 3=contName]
		var cc = info[0] || "";
		// prealloc lasts
		if (void 0 === lcc || void 0 === laso) lcc = cc, laso = caso;
		// check if the country code has changed
		if ((lcc !== cc) || (laso !== caso)) {
			csvAppend([startIdx, ipCount, lcc].concat(addASN ? [laso] : []));
			startIdx = i; ipCount = 1; lcc = cc; laso = caso;
		} else ipCount++;
		// display eta, speed and etc
		var fracSpeed = 0 | lastSpeed / 3 || knownSpeed || 1;
		if (++dc && !lastSpeed || 0 === dc % fracSpeed) {
			var elapsedSeconds = (Date.now() - startDate) / 1000,
				speedNow = dc / elapsedSeconds, // Elapsed time in seconds
				speed = 0 | (speedNow < knownSpeed ? speedNow : knownSpeed); // Speed in IPs per second
			if (!lastElapsed) lastElapsed = elapsedSeconds - 1;
			if (1 + i >= maxIPNum || 1/3 <= elapsedSeconds - lastElapsed) {
				var remainingIPs = maxIPNum - dc; // Remaining IPs
				var etaSeconds = remainingIPs / speed; // ETA in seconds
				var etaFormatted = formatTime(etaSeconds); // Format ETA
				var elapsedFormatted = formatTime(elapsedSeconds); // Format elapsed time
				var perc = (100 * i / maxIPNum).toFixed(2) + "% |";
				console.log(perc, dc, "; i:", i, "; ETA:", etaFormatted, "; Elapsed:", elapsedFormatted, "; Speed:", speed + "/s");
				lastElapsed = elapsedSeconds;
			}
			lastSpeed = speed;
		}
	}
	if (ipCount > 0) csvAppend([startIdx, ipCount, lcc].concat(addASN ? [1 + laso.indexOf(',') ? '"' + laso + '"' : laso] : []));
	function csvAppend(aParams) {
		// not really a best way to export csv due ASO possibly having commas
		fs.appendFileSync(geoipCSVFilePath(), aParams + "\n");
	}
	console.log("CSV File Size:", size2str(filesize(geoipCSVFilePath())));
}


function formatTime(aSeconds) {
	var hours = Math.floor(aSeconds / 3600),
		minutes = Math.floor((aSeconds % 3600) / 60),
		secs = Math.floor(aSeconds % 60),
		formattedTime = '';
	if (hours > 0) formattedTime += (hours < 10 ? '0' + hours : hours) + 'h';
	if (minutes > 0 || hours > 0) formattedTime += (minutes < 10 ? '0' + minutes : minutes) + 'm';
	formattedTime += (secs < 10 ? '0' + secs : secs) + 's';
	return formattedTime;
}

function ipv4n(aIP) {
	var parts = aIP.split(".");
	return parts[0] * 16777216 + parts[1] * 65536 + parts[2] * 256 + +parts[3];
}
function nipv4(aNum) {
	return (aNum >>> 24 & 0xFF) + '.' +
		(aNum >>> 16 & 0xFF) + '.' +
		(aNum >>> 8 & 0xFF) + '.' +
		(aNum & 0xFF);
}

doTask[geoLiteConfig.scriptAct]();
