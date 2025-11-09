"use strict";
(function() {
  var BaseController = require("BaseController");

  var controller = new BaseController({
    play: "[data-testid=control-button-playpause][aria-label=Play]",
    pause: "[data-testid=control-button-playpause][aria-label=Pause]",
    playPrev: "[data-testid='control-button-skip-back']",
    playNext: "[data-testid='control-button-skip-forward']",
    like: "button[aria-label='Save to Your Library'].control-button-heart",
    dislike: "button[aria-label='Remove from Your Library'].control-button-heart",
    buttonSwitch: true,
    mute: "volume-bar .volume-bar__icon-button",
    song: "[data-testid=context-item-info-title] [data-testid=context-item-link]",
    artist: "[data-testid=context-item-info-subtitles] [data-testid=context-item-info-artist]",
    art: ".cover-art img",
    currentTime: "[data-testid=playback-position]",
    totalTime: "[data-testid=playback-duration]",
    // enable seek feature
    canSeek: true
  });

  controller.seek = function (time) {
    if (time > 0) {
      // skip forward 15 secs
      controller.doc().querySelector("[data-testid='control-button-seek-forward-15']").click();
    } else {
      // skip back 15 secs
      controller.doc().querySelector("[data-testid='control-button-seek-back-15']").click();
    }
  }

  // Spotify art uses an inline CSS background-image style, this override parses the image from there
  controller.getArtData = function(selector) {
    if (!selector) return null;

    var dataEl = this.doc().querySelector(selector);

    if (dataEl !== null) {
      var backgroundImage = window.getComputedStyle(dataEl)["background-image"];
      return backgroundImage.match(/url\(["|']?([^"']*)["|']?\)/)[1];
    }
  };
})();
