"use strict";
(function() {
  if (window.skOldCreateElement !== undefined) {
    return;
  }

  console.log("adding media interceptor");

  var root = document.head || document.documentElement;
  var mediaContainer = document.getElementById("skMedias");

  if (!mediaContainer) {
    mediaContainer = document.createElement("div");
    mediaContainer.id = "skMedias";
    mediaContainer.style.display = "none";
    root.appendChild(mediaContainer);
  }

  window.skOldCreateElement = document.createElement.bind(document);
  window.skMedias = window.skMedias || [];

  document.createElement = function() {
    var element = window.skOldCreateElement.apply(document, arguments);
    var tagName = arguments.length > 0 ? String(arguments[0]).toLowerCase() : "";

    if (tagName === "video" || tagName === "audio") {
      var container = document.getElementById("skMedias");
      if (container) {
        container.appendChild(element);
      }
      window.skMedias.push(element);
    }

    return element;
  };
})();
