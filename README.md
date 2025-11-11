# GeoLite for client-side use
This is free and unencumbered software released into the public domain.

## Import library
```html
<script src="geoLite.js" defer></script>
<script src="geoLite.datav5-20251025.js" defer></script>
```
As always, data file is loaded after `geoLite.js` along with attribute `defer` to allow page to render.<br>
### Important
Due `geoLite` needing to "decompress" data it can take half a second upto a second of delay before user can interact with the page.<br>

## Features
Basic features
- Fast lookup (~900k op/sec)
- Country code and name (even emoji)
- Continent name and code
- ASO (you may also call it "ISP")

# Usage examples

## Lookup (works locally)
Internet connection is not required after database is loaded - it works locally.<br>
```js
var info = geoLite.lookup(ipAddr.value);
ipaResult.innerHTML = (
	"Country: " + info.CN + " " + info.emoji + " " + info.CC + "\r\n" +
	"Continent: " + info.contName + " (" + info.contCode + ")\r\n" +
	"ASO: " + info.ASO
);
```

## Fetch my IP (internet required)
Please avoid using this feature even though it works.<br>
```js
// it will attempt to fetch ip from multiple sources until one is retrieved
geoLite.fetchPubIPv4(function(arr, xhr, url, elapsed) {
  console.log("Result", arr, "from", u, "; elapsed:", elapsed, "[ms]");
});
```

## Fetch my IP (config properties)
Note: `geoLite` already has these as default.<br>
```js
// code should be executed before fetchPubIPv4 is called.
geoLite.ipFetchTimeout = 3000; // 3000 is default
geoLite.ipFetchMaxTimeout = 6000; // 6000 is default
geoLite.ipFetchURLs = ["https://icanhazip.com", "https://httpbin.org/ip"];
```
