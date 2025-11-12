# GeoLite (for client-side use)
This is free and unencumbered software released into the public domain.<br>
<img src="https://api.visitorbadge.io/api/visitors?path=ezomeno.geodatav5&countColor=%2337d67a&style=flat-square&labelStyle=upper"><br>
<a href="https://ezomeno.github.io/geo/">Demo</a>, enjoy!

## Import library
```html
<script src="geoLite.js" defer></script>
<script src="geoLite.datav5-20251025.js" defer></script>
```
As always, data file is loaded after `geoLite.js` along with attribute `defer` to allow page to render.<br>
Alternatively see <a href="https://github.com/ezomeno/geo/blob/main/dist/geoLite.html">geoLite.html</a>.
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
**Can fail if using ipv6** (VPN/Tor or similar).<br>
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
// if using IPv6 then fetch will FAIL to parse
geoLite.ipFetchTimeout = 7000; // 7000 is default
geoLite.ipFetchMaxTimeout = 12000; // 12000 is default
geoLite.ipFetchURLs = ["https://icanhazip.com", "https://httpbin.org/ip"];
```

## GZipped size?
*(fyi: MiB = 1024 * 1024)*<br>
Database `20251025` is **3.31MiB** (3481164 bytes; CSV size: **20.32750MiB**)<br>
Database `20241017` is **3.06MiB** (3204748 bytes; CSV size: **18.45380MiB**)<br>
JS Databases: <a href="https://github.com/ezomeno/ezomeno.github.io/tree/main/geo">Link</a><br>

## Build own database.js

**Requirements**:
1. NodeJS or BunJS or anything that runs nodejs code.
2. Install dependency: `mmdb-reader` (BunJS auto installs it?)
3. Downloaded file `devtools/geoLite-dev.js`

**Steps**:
1. Download both ASN and City mmdb from anywhere.
    - Example: <a href="https://github.com/P3TERX/GeoLite.mmdb/releases">P3TERX/GeoLite.mmdb</a>
3. Ensure to rename it in this format: `GeoLite2-City-{YYYYMMDD}.mmdb`
    - Example: `GeoLite2-ASN-20230107.mmdb`
5. Create folders `mmdb` and `csv` in the same folder of the file `devtools/geoLite-dev.js`
6. Put `.mmdb` files in folder `mmdb`
	- Example 1: `mmdb/GeoLite2-ASN-20230107.mmdb` (for ASN)
    - Example 2: `mmdb/GeoLite2-City-20230107.mmdb` (for City)
7. Edit file `devtools/geoLite-dev.js`
    1. (All below is about variable `geoLiteConfig`)
    2. Set `defaultDbDate` use this format `YYYYMMDD` (example: `20250930`)
    3. Set `scriptAct` to `2` to build csv and data file.
8. Save and Run the script
    ```
    node geoLite-dev
    ```
9. Wait, usually can take upto an hour or more.
10. Make sure to reset `scriptAct` to `0` once done.
11. Enjoy (data is built in same dir as `geoLite-dev.js`)

## Future plans
None at all, unless someone suggests `public domain` licensed library that can be used to further compress data file.
