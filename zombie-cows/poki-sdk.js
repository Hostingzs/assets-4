// Standalone adapter for exports whose original advertising SDK is missing.
// No ad service is configured on this host; never report a rewarded ad as watched.
(function () {
  'use strict';
  if (window.PokiSDK) return;
  const noop = function () {};
  window.PokiSDK = {
    init: () => Promise.resolve(),
    setDebug: noop,
    gameLoadingStart: noop,
    gameLoadingProgress: noop,
    gameLoadingFinished: noop,
    gameplayStart: noop,
    gameplayStop: noop,
    happyTime: noop,
    customEvent: noop,
    captureError: noop,
    commercialBreak: () => Promise.resolve(),
    rewardedBreak: () => Promise.resolve(false),
    isAdBlocked: () => true,
    getURLParam: name => new URLSearchParams(location.search).get(name),
    shareableURL: () => Promise.resolve(location.href)
  };
}());
window.PokiSDK = new Proxy(window.PokiSDK, { get: (t, k) => k in t ? t[k] : () => Promise.resolve() });
