"use strict";
(function () {
  var sk_log = require("../modules/SKLog.js");

  var CURRENT_AUDIO_ATTR = "data-streamkeys-wa-current-audio";
  var CURRENT_AUDIO_TS_ATTR = "data-streamkeys-wa-current-audio-ts";
  var HELPER_READY_ATTR = "data-streamkeys-wa-helper-ready";
  var HELPER_CMD_EVENT = "streamkeys-wa-cmd";

  function markCurrentAudio(audio) {
    var current;
    var i;

    if (!audio) return;

    window._waCurrentAudio = audio;
    current = document.querySelectorAll("audio[" + CURRENT_AUDIO_ATTR + "='1']");
    for (i = 0; i < current.length; i++) {
      current[i].removeAttribute(CURRENT_AUDIO_ATTR);
    }

    audio.setAttribute(CURRENT_AUDIO_ATTR, "1");
    audio.setAttribute(CURRENT_AUDIO_TS_ATTR, String(Date.now()));
  }

  function installPlayTrap() {
    var originalPlay;

    if (window._waAudioTrapInstalled) return;
    window._waAudioTrapInstalled = true;

    originalPlay = window.HTMLAudioElement && window.HTMLAudioElement.prototype && window.HTMLAudioElement.prototype.play;
    if (!originalPlay) {
      sk_log("WebWhatsApp inject: HTMLAudioElement.play not available", null, true);
      return;
    }

    window.HTMLAudioElement.prototype.play = function () {
      try {
        markCurrentAudio(this);
      } catch (e) {
        sk_log("WebWhatsApp inject: failed to mark current audio", e, true);
      }
      return originalPlay.apply(this, arguments);
    };

    sk_log("WebWhatsApp inject: audio play trap installed");
  }

  function withCurrentAudio(callback) {
    var audio = window._waCurrentAudio;
    if (!audio) return false;

    try {
      callback(audio);
      return true;
    } catch (e) {
      sk_log("WebWhatsApp inject: helper command failed", e, true);
      return false;
    }
  }

  function onCommand(e) {
    var detail = e && e.detail ? e.detail : {};
    var cmd = detail.cmd;
    var seconds;

    if (cmd === "toggle") {
      withCurrentAudio(function (audio) {
        if (audio.paused || audio.ended) audio.play();
        else audio.pause();
      });
      return;
    }

    if (cmd === "seek") {
      seconds = Number(detail.seconds) || 0;
      withCurrentAudio(function (audio) {
        audio.currentTime += seconds;
      });
      return;
    }
  }

  if (window.__streamkeysWaHelperInstalled) {
    document.documentElement.setAttribute(HELPER_READY_ATTR, "1");
    return;
  }

  window.__streamkeysWaHelperInstalled = true;
  installPlayTrap();
  document.addEventListener(HELPER_CMD_EVENT, onCommand);
  document.documentElement.setAttribute(HELPER_READY_ATTR, "1");
  sk_log("WebWhatsApp inject: helper ready");
})();
