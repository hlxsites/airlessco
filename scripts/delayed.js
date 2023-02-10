// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

const loadScript = (url, attrs) => {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  if (attrs) {
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const attr in attrs) {
      script.setAttribute(attr, attrs[attr]);
    }
  }
  head.append(script);
  return script;
};

loadScript('/scripts/sortable.min.js', {
  type: 'text/javascript',
  charset: 'UTF-8',
});

loadScript('https://www.google-analytics.com/analytics.js', {
  type: 'text/javascript',
  charset: 'UTF-8',
});

// Google Analytics Tracking
const func = 'ga';
window.GoogleAnalyticsObject = func;
// eslint-disable-next-line no-unused-expressions
window[func] = window[func] || function () {
  // eslint-disable-next-line prefer-rest-params
  (window[func].q = window[func].q || []).push(arguments);
}, window[func].l = 1 * new Date();
// eslint-disable-next-line no-undef
ga('create', 'UA-81622380-1', 'auto');
// eslint-disable-next-line no-undef
ga('send', 'pageview');
