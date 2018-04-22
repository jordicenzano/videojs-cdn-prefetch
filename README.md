Note: This plugin is useless without the CDN prefetching code, that has to run on the CDN.

# videojs-cdn-prefetch

Prefecth media segments to the CDN point of presence (POP) used by the player, this improves the viewer experience (basically reduces the chances of buffering). This feature is specially interesting when your origin is very far from that viewer and the stream is not very popular on that CDN POP. 

This plugin also needs CDN code to interpret the prefechting requests. That code could be implemented in VCL [Fastly](http://fastly.com/) or inside Lambda edge [CloudFront](https://aws.amazon.com/cloudfront/)

This code detects the parameters `pr_url` inside the querystring of the HLS media chunks requests and sends a GET request to those URL adding few params that allows the CDN POP to prefect that data. Example:

```
Chunk URL: 
Test_00028.ts?pr_url=Test_00029.ts,Test_00030.ts&foo=bar
```

In the previous example, before fetching the segment `Test_00028.ts` this plugin will send 2 GET requests (to: `Test_00029.ts`, and `Test_00030.ts`) with the following QS parameter `?pf=1`, in the CDN side we need to interpret this code and execute the prefecthing.

## Installation

```sh
npm install --save videojs-cdn-prefetch
```

## Usage

To include videojs-cdn-prefetch on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-cdn-prefetch.min.js"></script>
<script>
  var player = videojs('my-video');

  player.cdnPrefetch();
</script>
```

### Browserify/CommonJS

When using with Browserify, install videojs-cdn-prefetch via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-cdn-prefetch');

var player = videojs('my-video');

player.cdnPrefetch();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-cdn-prefetch'], function(videojs) {
  var player = videojs('my-video');

  player.cdnPrefetch();
});
```

## License

GPL-3.0. Copyright (c) Jordi Cenzano &lt;jordi.cenzano@gmail.com&gt;


[videojs]: http://videojs.com/
