"use strict";
(function () {
  var BaseController = require("BaseController");
  var sk_log = require("../modules/SKLog.js");

  var CURRENT_AUDIO_ATTR = "data-streamkeys-wa-current-audio";
  var CURRENT_AUDIO_TS_ATTR = "data-streamkeys-wa-current-audio-ts";
  var WA_PLAY_SELECTOR = "[aria-label='Sprachnachricht abspielen']";
  var WA_PAUSE_SELECTOR = "[aria-label='Sprachnachricht pausieren']";
  var HELPER_READY_ATTR = "data-streamkeys-wa-helper-ready";
  var HELPER_HAS_AUDIO_ATTR = "data-streamkeys-wa-helper-has-audio";
  var HELPER_CMD_EVENT = "streamkeys-wa-cmd";

  var currentVoiceButtonIndex = -1;

  var controller = new BaseController({
    siteName: "Web WhatsApp",
    canGetMedia: true,
    overridePlayPause: true,
    overridePlayPrev: true,
    overridePlayNext: true
  });

  function dedupeButtons(buttons) {
    var unique = [];
    var i;
    for (i = 0; i < buttons.length; i++) {
      if (unique.indexOf(buttons[i]) === -1) unique.push(buttons[i]);
    }
    return unique;
  }

  function collectVoiceButtons() {
    var buttons = [];
    var i;

    var waPlayButtons = document.querySelectorAll(WA_PLAY_SELECTOR);
    for (i = 0; i < waPlayButtons.length; i++) buttons.push(waPlayButtons[i]);

    var waPauseButtons = document.querySelectorAll(WA_PAUSE_SELECTOR);
    for (i = 0; i < waPauseButtons.length; i++) buttons.push(waPauseButtons[i]);

    buttons = dedupeButtons(buttons);
    sk_log("WebWhatsApp: found voice buttons: " + buttons.length);
    return buttons;
  }

  function getCurrentAudio() {
    var current = document.querySelector("audio[" + CURRENT_AUDIO_ATTR + "='1']");
    if (current) return current;

    var audios = document.getElementsByTagName("audio");
    if (!audios.length) return null;

    var i;
    for (i = 0; i < audios.length; i++) {
      if (!audios[i].paused && !audios[i].ended) return audios[i];
    }

    var newest = audios[0];
    var newestTs = parseInt(newest.getAttribute(CURRENT_AUDIO_TS_ATTR) || "0", 10);
    for (i = 1; i < audios.length; i++) {
      var ts = parseInt(audios[i].getAttribute(CURRENT_AUDIO_TS_ATTR) || "0", 10);
      if (ts > newestTs) {
        newest = audios[i];
        newestTs = ts;
      }
    }

    return newest;
  }

  function installPageHelper() {
    controller.injectScript({ url: "/js/inject/webwhatsapp_inject.js" });
    sk_log("WebWhatsApp: injected helper /js/inject/webwhatsapp_inject.js");
  }

  function isHelperReady() {
    return document.documentElement.getAttribute(HELPER_READY_ATTR) === "1";
  }

  function helperHasCurrentAudio() {
    return document.documentElement.getAttribute(HELPER_HAS_AUDIO_ATTR) === "1";
  }

  function dispatchPageHelper(cmd, seconds) {
    if (!isHelperReady()) return false;

    document.dispatchEvent(new CustomEvent(HELPER_CMD_EVENT, {
      detail: {
        cmd: cmd,
        seconds: (typeof seconds === "number" ? seconds : 0)
      }
    }));
    return true;
  }

  function clickVoiceButton(button, reason) {
    if (!button) {
      sk_log("WebWhatsApp: no voice button for " + reason, null, true);
      return false;
    }

    var label = button.getAttribute("aria-label") || "(no aria-label)";
    sk_log("WebWhatsApp: click " + reason + " label=" + label);
    button.click();
    return true;
  }

  function getFirstPauseButtonIndex(buttons) {
    var i;
    for (i = 0; i < buttons.length; i++) {
      if (buttons[i].matches(WA_PAUSE_SELECTOR)) return i;
    }
    return -1;
  }

  controller.getMedia = function () {
    return getCurrentAudio();
  };

  controller.isPlaying = function () {
    if (document.querySelector(WA_PAUSE_SELECTOR)) return true;

    var audio = getCurrentAudio();
    return !!(audio && !audio.paused && !audio.ended);
  };

  controller.playPause = function () {
    var buttons = collectVoiceButtons();
    if (!buttons.length) {
      sk_log("WebWhatsApp: playPause skipped, no voice buttons found", null, true);
      return;
    }

    // Deterministic fallback: pause active message first, then resume last selected one.
    var pauseIndex = getFirstPauseButtonIndex(buttons);
    if (pauseIndex >= 0) {
      currentVoiceButtonIndex = pauseIndex;
      clickVoiceButton(buttons[pauseIndex], "playPause.pauseActive");
      return;
    }

    if (currentVoiceButtonIndex >= 0 && currentVoiceButtonIndex < buttons.length) {
      clickVoiceButton(buttons[currentVoiceButtonIndex], "playPause.resumeSelected");
      return;
    }

    currentVoiceButtonIndex = 0;
    clickVoiceButton(buttons[0], "playPause.startFirst");
  };

  controller.seek = function (seconds) {
    if (dispatchPageHelper("seek", seconds) && helperHasCurrentAudio()) {
      sk_log("WebWhatsApp: seek via page helper " + seconds + "s");
      return;
    }

    var audio = getCurrentAudio();
    if (!audio || !isFinite(audio.duration)) {
      sk_log("WebWhatsApp: seek skipped, helper not ready and no seekable audio", null, true);
      return;
    }

    var nextTime = audio.currentTime + seconds;
    if (nextTime < 0) nextTime = 0;
    if (nextTime > audio.duration) nextTime = audio.duration;

    sk_log("WebWhatsApp: seek fallback " + seconds + "s -> " + nextTime.toFixed(2) + "s");
    audio.currentTime = nextTime;
  };

  controller.playNext = function () {
    var buttons = collectVoiceButtons();
    if (!buttons.length) {
      sk_log("WebWhatsApp: playNext skipped, no voice buttons found", null, true);
      return;
    }

    if (currentVoiceButtonIndex < 0) {
      var pauseIndex = getFirstPauseButtonIndex(buttons);
      currentVoiceButtonIndex = pauseIndex >= 0 ? pauseIndex : 0;
    }

    var nextIndex = Math.min(currentVoiceButtonIndex + 1, buttons.length - 1);
    sk_log("WebWhatsApp: playNext index " + currentVoiceButtonIndex + " -> " + nextIndex);
    currentVoiceButtonIndex = nextIndex;
    clickVoiceButton(buttons[nextIndex], "playNext");
  };

  controller.playPrev = function () {
    var buttons = collectVoiceButtons();
    if (!buttons.length) {
      sk_log("WebWhatsApp: playPrev skipped, no voice buttons found", null, true);
      return;
    }

    if (currentVoiceButtonIndex < 0) {
      var pauseIndex = getFirstPauseButtonIndex(buttons);
      currentVoiceButtonIndex = pauseIndex >= 0 ? pauseIndex : 0;
    }

    var prevIndex = Math.max(currentVoiceButtonIndex - 1, 0);
    sk_log("WebWhatsApp: playPrev index " + currentVoiceButtonIndex + " -> " + prevIndex);
    currentVoiceButtonIndex = prevIndex;
    clickVoiceButton(buttons[prevIndex], "playPrev");
  };

  controller.checkPlayer = function () {
    var buttons = collectVoiceButtons();
    if (!buttons.length) {
      currentVoiceButtonIndex = -1;
      return;
    }

    if (currentVoiceButtonIndex >= buttons.length) {
      currentVoiceButtonIndex = buttons.length - 1;
    }
  };

  installPageHelper();
})();
