"use strict";
(function() {
  var BaseController = require("BaseController");

  new BaseController({
    siteName: "Amazon Video",
    media: "div.rendererContainer > video"
  });
})();
