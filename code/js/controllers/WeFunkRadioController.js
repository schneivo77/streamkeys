"use strict";
(function() {
  var BaseController = require("BaseController");

  var controller = new BaseController({
    siteName: "WEFUNK Radio",
    playPause: ".player-control-play",
    playNext: ".player-control-nexttrack",
    playPrev: ".player-control-prevtrack",
    currentTime: ".player-control-tracktime",
    song: ".player-control-title",
    canSeek: true
  });

  controller.seek = function (time) {
    if (time > 0) {
    // press fastworward button
      controller.doc().querySelector(".player-control-fastforward").click();
    } else {
    // press rewind button
      controller.doc().querySelector(".player-control-rewind").click();
    }
  }

})();
