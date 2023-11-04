"use strict";
(function() {
  var BaseController = require("BaseController");

  var controller = new BaseController({
    siteName: "Zdf.de Mediathek",
    play: ".play-button-cGT-0w",
    pause: ".pause-button-38iHQf"
  });

  controller.seek = function (time) {
    if (time > 0) {
    // press fastworward button
      controller.doc().querySelector(".forward-button-3y3eCp").click();
    } else {
    // press rewind button
      controller.doc().querySelector(".backward-button-TckXlX").click();
    }
  }
})();
