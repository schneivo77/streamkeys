"use strict";
(function() {
  var BaseController = require("BaseController");

  var controller = new BaseController({
    siteName: "Disney Plus",
    playPause: "button.control-icon-btn.play-pause-icon"
  });

  controller.seek = function (time) {
    if (time > 0) {
    // press fastworward button
      controller.doc().querySelector("button.control-icon-btn.ff-10sec-icon").click();
    } else {
    // press rewind button
      controller.doc().querySelector("button.control-icon-btn.rwd-10sec-icon").click();
    }
  }
})();
