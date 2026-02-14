"use strict";
(function () {
  var BaseController = require("BaseController");
  var sk_log = require("../modules/SKLog.js");

  var CURRENT_AUDIO_ATTR = "data-streamkeys-wa-current-audio";
  var CURRENT_AUDIO_TS_ATTR = "data-streamkeys-wa-current-audio-ts";
  var WA_PLAY_SELECTOR = "[aria-label='Sprachnachricht abspielen']";
  var WA_PAUSE_SELECTOR = "[aria-label='Sprachnachricht pausieren']";
  var WA_VOICE_SELECTOR = WA_PLAY_SELECTOR + "," + WA_PAUSE_SELECTOR;
  var HELPER_READY_ATTR = "data-streamkeys-wa-helper-ready";
  var HELPER_HAS_AUDIO_ATTR = "data-streamkeys-wa-helper-has-audio";
  var HELPER_ENDED_TS_ATTR = "data-streamkeys-wa-audio-ended-ts";
  var HELPER_CURRENT_KEY_ATTR = "data-streamkeys-wa-current-key";
  var HELPER_CMD_EVENT = "streamkeys-wa-cmd";

  var currentVoiceButtonIndex = -1;
  var currentVoiceKey = null;
  var lastHandledEndedTs = null;

  var controller = new BaseController({
    siteName: "Web WhatsApp",
    canGetMedia: true,
    overridePlayPause: true,
    overridePlayPrev: true,
    overridePlayNext: true
  });

  function getVoiceMessageKey(button, fallbackIndex) {
    var row;
    var msgId;
    var dataId;

    if (!button) return "";

    row = button.closest("[data-id], [data-testid='msg-container'], [role='row']");
    if (row) {
      msgId = row.getAttribute("data-id") || row.getAttribute("data-testid");
      if (msgId) return "msg:" + msgId;
    }

    dataId = button.getAttribute("data-id");
    if (dataId) return "btn:" + dataId;

    return "idx:" + String(fallbackIndex);
  }

  function collectVoiceEntries() {
    var buttons = document.querySelectorAll(WA_VOICE_SELECTOR);
    var entries = [];
    var i;

    for (i = 0; i < buttons.length; i++) {
      entries.push({
        button: buttons[i],
        key: getVoiceMessageKey(buttons[i], i),
        isPause: buttons[i].matches(WA_PAUSE_SELECTOR)
      });
    }

    sk_log("WebWhatsApp: found voice buttons: " + entries.length);
    return entries;
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

  function getHelperEndedTs() {
    return document.documentElement.getAttribute(HELPER_ENDED_TS_ATTR) || "";
  }

  function getHelperCurrentKey() {
    return document.documentElement.getAttribute(HELPER_CURRENT_KEY_ATTR) || "";
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

  function clickVoiceEntry(entry, reason, index) {
    var label;

    if (!entry || !entry.button) {
      sk_log("WebWhatsApp: no voice button for " + reason, null, true);
      return false;
    }

    label = entry.button.getAttribute("aria-label") || "(no aria-label)";
    sk_log("WebWhatsApp: click " + reason + " label=" + label + " key=" + entry.key + " index=" + index);
    entry.button.click();

    currentVoiceButtonIndex = index;
    currentVoiceKey = entry.key;
    return true;
  }

  function getFirstPauseEntryIndex(entries) {
    var i;
    for (i = 0; i < entries.length; i++) {
      if (entries[i].isPause) return i;
    }
    return -1;
  }

  function getEntryIndexByKey(entries, key) {
    var i;
    if (!key) return -1;
    for (i = 0; i < entries.length; i++) {
      if (entries[i].key === key) return i;
    }
    return -1;
  }

  function resolveCurrentEntryIndex(entries) {
    var helperKey = getHelperCurrentKey();
    var helperKeyIndex = getEntryIndexByKey(entries, helperKey);
    if (helperKeyIndex >= 0) return helperKeyIndex;

    var pauseIndex = getFirstPauseEntryIndex(entries);
    if (pauseIndex >= 0) return pauseIndex;

    var keyIndex = getEntryIndexByKey(entries, currentVoiceKey);
    if (keyIndex >= 0) return keyIndex;

    if (currentVoiceButtonIndex >= 0 && currentVoiceButtonIndex < entries.length) {
      return currentVoiceButtonIndex;
    }

    return entries.length ? 0 : -1;
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
    // Once we have a trapped audio element, toggle it directly to avoid button list drift.
    if (helperHasCurrentAudio() && dispatchPageHelper("toggle")) {
      sk_log("WebWhatsApp: playPause via helper toggle");
      return;
    }

    var entries = collectVoiceEntries();
    if (!entries.length) {
      sk_log("WebWhatsApp: playPause skipped, no voice buttons found", null, true);
      return;
    }

    var index = resolveCurrentEntryIndex(entries);
    if (index < 0) {
      sk_log("WebWhatsApp: playPause skipped, no current entry", null, true);
      return;
    }

    clickVoiceEntry(entries[index], "playPause", index);
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
    var entries = collectVoiceEntries();
    if (!entries.length) {
      sk_log("WebWhatsApp: playNext skipped, no voice buttons found", null, true);
      return;
    }

    var index = resolveCurrentEntryIndex(entries);
    if (index < 0) index = 0;

    var nextIndex = Math.min(index + 1, entries.length - 1);
    sk_log("WebWhatsApp: playNext index " + index + " -> " + nextIndex);

    // Prevent WhatsApp auto-queue from jumping over the first target on manual next.
    if (this.isPlaying()) {
      dispatchPageHelper("toggle");
    }

    clickVoiceEntry(entries[nextIndex], "playNext", nextIndex);
  };

  controller.playPrev = function () {
    var entries = collectVoiceEntries();
    if (!entries.length) {
      sk_log("WebWhatsApp: playPrev skipped, no voice buttons found", null, true);
      return;
    }

    var index = resolveCurrentEntryIndex(entries);
    if (index < 0) index = 0;

    var prevIndex = Math.max(index - 1, 0);
    sk_log("WebWhatsApp: playPrev index " + index + " -> " + prevIndex);

    // Prevent WhatsApp auto-queue from jumping over the first target on manual prev.
    if (this.isPlaying()) {
      dispatchPageHelper("toggle");
    }

    clickVoiceEntry(entries[prevIndex], "playPrev", prevIndex);
  };

  controller.checkPlayer = function () {
    var entries = collectVoiceEntries();
    if (!entries.length) {
      currentVoiceButtonIndex = -1;
      currentVoiceKey = null;
      return;
    }

    var helperKey = getHelperCurrentKey();
    var helperIndex = getEntryIndexByKey(entries, helperKey);
    if (helperIndex >= 0) {
      currentVoiceButtonIndex = helperIndex;
      currentVoiceKey = entries[helperIndex].key;
    }

    var endedTs = getHelperEndedTs();
    if (endedTs && endedTs !== lastHandledEndedTs) {
      lastHandledEndedTs = endedTs;
      sk_log("WebWhatsApp: detected message end/auto-advance");
    }

    if (currentVoiceButtonIndex >= entries.length) {
      currentVoiceButtonIndex = entries.length - 1;
    }
  };

  installPageHelper();
})();
