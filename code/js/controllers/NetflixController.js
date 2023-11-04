"use strict";
(function() {
  var BaseController = require("BaseController");

  var controller = new BaseController({
    siteName: "Netflix.com",
    media: "video"
  });

  function getNetflixPlayer() {
    return `
    // https://stackoverflow.com/questions/42105028/netflix-video-player-in-chrome-how-to-seek
    var videoPlayer = window.netflix
      .appContext
      .state
      .playerApp
      .getAPI()
      .videoPlayer;
    var id = videoPlayer.getAllPlayerSessionIds()[0];
    var player = videoPlayer.getVideoPlayerBySessionId(id);`;
  }

  controller.seek = function(time) {
    // https://stackoverflow.com/questions/9515704/insert-code-into-the-page-context-using-a-content-script/9517879#9517879
    var code = `
    ${getNetflixPlayer()}
    var time = ${time};
    // seek works with milliseconds
    player.seek(player.getCurrentTime() + time * 1000);`;
    var script = document.createElement("script");
    script.textContent = code;
    (document.head||document.documentElement).appendChild(script);
    script.remove();
  };

})();
