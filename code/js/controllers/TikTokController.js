"use strict";
(function() {
  var BaseController = require("BaseController");

  var controller = new BaseController({
    siteName: "TikTok",
    media: "video",
    playNext: "button.tiktok-1iiukfq-ButtonBasicButtonContainer-StyledVideoSwitchV2.e1xqvjno15",
    playPrev: "button.tiktok-2xqv0y-ButtonBasicButtonContainer-StyledVideoSwitchV2.e1xqvjno15",
  });

  controller.playPause = function () {

    // show seekbar
    document.querySelector(".tiktok-ascbr8-DivVideoControlContainer.ep7o6uj5").style.opacity = 1

    // copied from BaseController since idk how to call super.playPause
    var media = this.getMedia();
    if (media) {
      if (this.isPlaying()) {
        media.pause();
      } else {
        media.play();
      }
    }
  }

})();



