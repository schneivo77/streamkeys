"use strict";
(function() {
  var BaseController = require("BaseController");

  new BaseController({
    siteName: "Twitch.tv",
    song: "[data-a-target='stream-title']",
    media: "video"
  });
})();
