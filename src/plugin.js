import videojs from 'video.js';
import {version as VERSION} from '../package.json';

/* global ActiveXObject */
/* eslint no-undef: "error" */
/* eslint-env browser */

// Default options for the plugin.
const defaults = {};

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;

const PREFETCH_QS_URL_PARAM = 'pr_url';
const PREFETCH_QS_REQUEST_INDICATOR = 'pf=1';

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 *           A Video.js player object.
 *
 * @param    {Object} [options={}]
 *           A plain object containing options for the plugin.
 */
const onPlayerReady = (player, options) => {
  player.addClass('vjs-cdn-prefetch');
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function cdnPrefetch
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const cdnPrefetch = function(options) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(defaults, options));
  });

  this.on('loadedmetadata', function() {

    const tech = this.tech(true);

    // Check if hls is loaded. This plugin is only useful for HLS
    if ('hls' in tech) {
      tech.hls.xhr.beforeRequest = function(chunkReqOptions) {

        // Before each request check the QS
        const qs = parseQueryString(chunkReqOptions.uri);

        for (const elem in qs) {
          // If QS contains pr_url param compose the URL based on the current
          // chunk and send the prefecth request
          if (PREFETCH_QS_URL_PARAM === elem) {
            // Compose prefetch URL
            // Single var could contain several files
            const filesStr = qs[PREFETCH_QS_URL_PARAM];

            if (typeof (filesStr) === 'string') {
              const files = filesStr.split(',');

              videojs.log('files: ' + JSON.stringify(files));

              for (let i = 0; i < files.length; i++) {
                const urlBase = parseBaseUrl(chunkReqOptions.uri);
                const prefetchUrl = urlBase + '/' + files[i];

                // Send prefetch request
                getAjaxPrefetch(prefetchUrl);
              }
            }
          }
        }

        return chunkReqOptions;
      };
    }
  });

  function parseBaseUrl(url) {
    const posQs = url.indexOf('?');

    const urlHostPath = url.substring(0, posQs);

    return urlHostPath.substring(0, urlHostPath.lastIndexOf('/'));
  }

  function parseQueryString(url) {
    const qs = {};
    const posQs = url.indexOf('?');

    if (posQs < 0) {
      return qs;
    }

    const queryString = url.substring(posQs);

    const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split('=');

      qs[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }

    return qs;
  }

  function getAjaxPrefetch(url) {
    const xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

    xhr.open('GET', url + '?' + PREFETCH_QS_REQUEST_INDICATOR);
    xhr.onreadystatechange = function() {
      if (xhr.readyState > 3 && xhr.status === 200) {
        videojs.log('Prefetch successful for: ' + url);
      }
    };

    xhr.send();

    return xhr;
  }
};

// Register the plugin with video.jeslintConfigs.
registerPlugin('cdnPrefetch', cdnPrefetch);

// Include the version number.
cdnPrefetch.VERSION = VERSION;

export default cdnPrefetch;
