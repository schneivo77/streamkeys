"use strict";
(function() {
  var Sitelist = require("./modules/Sitelist.js"),
    _ = require("lodash");

  /**
   * Tracks TimeoutIds by notification ID, to cancel previous uncomplete Timeouts
   * when a new notification is created prior to the last notification clearing
   */
  var notificationTimeouts = {};

  /**
   * Map from tab.id to it's status and time when it was updated
   * e.g. tabStates = {"787" : {"timestamp": <epoch>, "state": <state>}, ...}
   * Look ./modules/BaseController.js getStateData method for what is state.
   */
  var tabStates = {};

  /**
   * Send a player action to every active player tab if it's state command
   * or "stop"-like command. Otherwise command target depends on
   * "single player mode" option.
   * @param {String} command - name of the command to pass to the players
   */
  var sendAction = function(command, ...args) {
    var active_tabs = window.skSites.getActiveMusicTabs();
    active_tabs.then(function(tabs) {
      if (command === "mute" ||
          command === "stop" ||
          command === "playerStateNotify" ||
          command === "getPlayerState") {
        sendActionAllPlayers(command, tabs, args);
        return;
      }
      chrome.storage.sync.get(function(obj) {
        if (Object.prototype.hasOwnProperty.call(obj,"hotkey-single_player_mode") &&
            obj["hotkey-single_player_mode"]) {
          sendActionSinglePlayer(command, tabs, args);
        } else {
          sendActionAllPlayers(command, tabs, args);
        }
      });
    });
  };

  /**
   * For "single player mode": if any tabs are playing - sends
   * action to all (as it's not clear which one to prefer)
   * otherwise tries to select best tab to interact with.
   */
  var sendActionSinglePlayer = function(command, tabs, args) {
    if (_.isEmpty(tabs)) return;

    var secondaryControlledTabs = _.filter(tabs, function(tab) {
      return window.skSites.checkSecondaryControlsEnabled(tab.id);
    });
    if(command.toLowerCase().endsWith("secondary")) {
      tabs = secondaryControlledTabs;
    } else {
      // filter out secondary tabs -> only primary controlled tabs
      tabs = _.difference(tabs, secondaryControlledTabs);
    }

    var playing = getPlayingTabs(tabs);
    if (_.isEmpty(playing)) {
      sendActionAllPlayers(command, [getBestSinglePlayerTab(tabs)], args);
    } else {
      sendActionAllPlayers(command, playing, args);
    }
  };

  /**
   * Returns "best" tab:
   * - if there is one tab is updated 200ms after all others
   * - otherwise active tab
   * - otherwise most recently updated
   */
  var getBestSinglePlayerTab = function(tabs) {
    var times = _.map(tabs, getTabUpdateTime);
    var maxTimestamp = _.max(times);
    // Pick tabs within 200ms from the most recent one.
    tabs = _.filter(tabs, function(tab) {
      return maxTimestamp - getTabUpdateTime(tab) < 200;
    });
    var sorted = _.sortBy(tabs, ["active", getTabUpdateTime]);
    return _.last(sorted);
  };

  var getTabUpdateTime = function(tab) {
    if (Object.prototype.hasOwnProperty.call(tabStates,tab.id)) {
      return tabStates[tab.id].timestamp;
    }
    return 0;
  };

  /**
   * Filters out tabs that has not reported 'isPlaying' status.
   */
  var getPlayingTabs = function(tabs) {
    return _.filter(tabs, function(tab) {
      return Object.prototype.hasOwnProperty.call(tabStates,tab.id) &&
        tabStates[tab.id].state.isPlaying;
    });
  };

  /**
   * Sends command to every tab in the list.
   */
  var sendActionAllPlayers = function(command, tabs, args) {
    tabs.forEach(function(tab) {
      var message = { "action": command };
      if(args != undefined) {
        message.args = args;
      }
      chrome.tabs.sendMessage(tab.id, message);
      console.log("Sent: " + command + " To: " + tab.url);
    });
  };

  /**
   * Process a command sent from somewhere (popup or content script) in the extension
   * @param {Object} request - Chrome request object from runtime.onMessage
   */
  var processCommand = function(request) {
    if(request.tab_target && parseInt(request.tab_target)) {
      var message = { "action": request.command };
      if(request.args != undefined) {
        message.args = request.args;
      }
      chrome.tabs.sendMessage(parseInt(request.tab_target), message);
      console.log("Single tab request. Sent: " + request.command + " To: " + request.tab_target);
    } else {
      sendAction(request.command);
    }
  };

  var lastCmdTimestamp = 0;
  var longPressStarted = false;
  var LONGPRESS_THRESHOLD_MS = 50;

  /**
   * Capture hotkeys and send their actions to tab(s) with music player running
   */
  chrome.commands.onCommand.addListener(function (command) {

    // TODO: Move longpress code to somewhere else.
    var timeBetweenCmds = Date.now() - lastCmdTimestamp;

    lastCmdTimestamp = Date.now();

    console.log("command:", command);
    console.log("timeBetweenCmds:", timeBetweenCmds);

    // TODO: Find a better solution!
    // The longpress seems to not work with all keyboards.
    // In my case it worked with a Razer Huntsman which seems to spam command-events when holding the MediaPlayPause key.
    // A Cherry keyboard only sent one command which doesn't work with the current implementation.
    if (timeBetweenCmds < LONGPRESS_THRESHOLD_MS
       && command === "playPause") {
      if (!longPressStarted) {
        longPressEventStarted();
      } {
        // TODO: The timer solution isn't really nice. Maybe find a better one.
        restartLongPressEndTimer();
      }
    } else {
      console.log("STANDARD PRESS.");
      sendAction(command);
    }
  });

  var longPressEndTimer;
  var LONGPRESS_END_TIME_MS = 500;

  function restartLongPressEndTimer() {
    if(longPressEndTimer !== undefined) {
      console.log("Cancel current timer.");
      clearTimeout(longPressEndTimer);
    }
    longPressEndTimer = setTimeout(function() {
      console.log("Timer ended!!!");
      longPressEventEnded();
    }, LONGPRESS_END_TIME_MS);
    console.log("Timer started for: " + LONGPRESS_END_TIME_MS + " ms");
  }

  function longPressEventStarted() {
    console.log("LONG PRESS EVENT STARTED!!!");
    longPressStarted = true;
    // TODO: Handle longpress event only for "playPause" commands.
    // Or sent longpress as argument and handle somewhere else what action it triggers.
    sendAction("playBackRate", 2);
  }

  function longPressEventEnded() {
    console.log("LONG PRESS EVENT ENDED...");
    longPressStarted = false;
    sendAction("playBackRate", 1);
  }

  /**
   * Messages sent from Options page
   */
  chrome.runtime.onMessage.addListener(function(request, sender, response) {
    if(request.action === "update_keys") {
      window.skSites.loadSettings();
    }
    if(request.action === "update_site_settings") {
      console.log("updating site settings: ", request.siteKey, request.siteState);
      window.skSites.setSiteState(request.siteKey, request.siteState).then(function() {
        response(true);
      });
    }
    if(request.action === "get_sites") {
      response(window.skSites.sites);
    }
    if(request.action === "get_site_controller") {
      response(window.skSites.getController(sender.tab.url));
    }
    if(request.action === "inject_controller") {
      console.log("Inject: " + request.file + " into: " + sender.tab.id);
      chrome.tabs.executeScript(sender.tab.id, {file: request.file});
      if (mprisPort) mprisPort.postMessage({ command: "add_player" });
    }
    if(request.action === "check_music_site") {
      /**
       * A tab index of -1 means that the tab is "embedded" in a page
       * We should only inject into actual tabs
       */
      if(sender.tab.index === -1) return response("no_inject");
      response(window.skSites.checkMusicSite(sender.tab.url));
    }
    if(request.action === "get_commands") response(window.coms);
    if(request.action === "command") processCommand(request);
    if(request.action === "update_player_state") {
      tabStates[sender.tab.id] = {
        "timestamp": Date.now(),
        "state": request.stateData
      };
      chrome.runtime.sendMessage({
        action: "update_popup_state",
        stateData: request.stateData,
        fromTab: sender.tab
      });
      if (mprisPort) handleStateData(updateMPRISState);
    }
    if(request.action === "get_music_tabs") {
      var musicTabs = window.skSites.getMusicTabs();
      musicTabs.then(function(tabs) {
        response(tabs);
      });

      return true;
    }
    if(request.action === "send_change_notification") {
      if (window.skSites.checkShowNotifications(sender.tab.url) &&
          window.skSites.checkTabEnabled(sender.tab.id)) {
        sendChangeNotification(request, sender);
      }
    }
  });

  var sendChangeNotification = function(request, sender) {
    if (!request.stateData.song) {
      return;
    }

    var notificationItems = [
      { title: request.stateData.song.trim(), message: "" },
    ];

    if (request.stateData.artist || request.stateData.album) {
      notificationItems.push({ title: (request.stateData.artist || "").trim(), message: (request.stateData.album || "").trim() });
    }

    if (request.stateData.currentTime || request.stateData.totalTime) {
      notificationItems.push({ title: (request.stateData.currentTime || "").trim(), message: (request.stateData.totalTime || "").trim() });
    }

    chrome.notifications.create(sender.id + request.stateData.siteName, {
      type: "list",
      title: request.stateData.siteName,
      message: (request.stateData.song || "").trim(),
      iconUrl: request.stateData.art || chrome.extension.getURL("icon128.png"),
      items: notificationItems
    }, function(notificationId) {
      if(notificationTimeouts[notificationId])
      {
        clearTimeout(notificationTimeouts[notificationId]);
        delete notificationTimeouts[notificationId];
      }

      notificationTimeouts[notificationId] = setTimeout(function() {
        chrome.notifications.clear(notificationId);
      }, 5000);
    });
  };

  /**
   * Copy over old settings from local storageArea to sync.
   * @note This change introduced in v1.5.5. Deprecate this at some point in the future.
   */
  var storageInitializedCheck = new Promise(function(resolve) {
    chrome.storage.sync.get(function(syncStorageObj) {
      if(syncStorageObj["hotkey-initialized"]) {
        resolve();
      } else {
        var newStorageObj = {
          "hotkey-initialized": true
        };

        chrome.storage.local.get(function(localStorageObj) {
          _.forEach(localStorageObj, function(value, key) {
            newStorageObj[key] = value;
          });

          chrome.storage.sync.set(newStorageObj, function() {
            resolve();
          });
        });
      }
    });
  });

  storageInitializedCheck.then(function() {
    // Open info page on install/update
    chrome.runtime.onInstalled.addListener(function(details) {
      chrome.storage.sync.get(function(obj) {
        if(obj["hotkey-open_on_update"] || typeof obj["hotkey-open_on_update"] === "undefined") {
          if(details.reason == "install") {
            chrome.tabs.create({
              url: "http://www.streamkeys.com/guide.html?installed=true"
            });
          }
        }
      });
    });

    // Store commands in global
    chrome.commands.getAll(function(cmds) {
      window.coms = cmds;
    });

    // Define skSites as a sitelist in global context
    window.skSites = new Sitelist();
    window.skSites.loadSettings();
  });


  /**
   * MPRIS support
   */
  var connections = 0;
  var mprisPort = null;

  var hmsToSecondsOnly = function(str) {
    var p = str.split(":");
    var s = 0;
    var m = 1;

    while (p.length > 0) {
      s += m * parseInt(p.pop(), 10);
      m *= 60;
    }

    return s;
  };

  var handleNativeMsg = function(msg) {
    switch(msg.command) {
    case "play":
    case "pause":
    case "playpause":
      sendAction("playPause");
      break;
    case "stop":
      sendAction("stop");
      break;
    case "next":
      sendAction("playNext");
      break;
    case "previous":
      sendAction("playPrev");
      break;
    default:
      console.log("Cannot handle native message command: " + msg.command);
    }
  };

  /**
   * Get the state of the player that a command will end up affecting and pass
   * it to a function to handle them, along with the tab that corresponds to
   * that state data.
   * For "single player mode" (which is required for MPRIS support), a command
   * will end up affecting the best tab if there are active tabs but no
   * playing tabs, or all playing tabs if there are playing tabs (see
   * sendActionSinglePlayer). With that in mind:
   * - If there is no active tab, then the state and the tab are null.
   * - If there are active tabs but no playing tabs, use the best tab.
   * - If there are any playing tabs, just use the state of the best playing
   *   tab. The command will be sent to all playing tabs anyway.
   */
  var handleStateData = function(func) {
    var activeMusicTabs = window.skSites.getActiveMusicTabs();
    activeMusicTabs.then(function(tabs) {
      if (_.isEmpty(tabs)) {
        func(null, null);
      } else {
        var bestTab = null;
        var playingTabs = getPlayingTabs(tabs);
        if (_.isEmpty(playingTabs)){
          bestTab = getBestSinglePlayerTab(tabs);
        } else {
          bestTab = getBestSinglePlayerTab(playingTabs);
        }

        // while loading website state may not exist, but the website does
        if(bestTab.id in tabStates) {
          func(tabStates[bestTab.id].state, bestTab);
        }
      }
    });
  };

  /**
   * If stateData is null, then state is stopped with NoTrack. Otherwise update
   * with the state of the player that a command will end up affecting.
   */
  var updateMPRISState = function(stateData, tab) {
    if (stateData === null) {
      mprisPort.postMessage({ command: "remove_player" });
    } else {
      var metadata = {
        "mpris:trackid": stateData.song ? tab.id : null,
        "xesam:title": stateData.song,
        "xesam:artist": stateData.artist ? [stateData.artist.trim()] : null,
        "xesam:album": stateData.album,
        "mpris:artUrl": stateData.art,
        "mpris:length": hmsToSecondsOnly((stateData.totalTime || "0").trim()) * 1000000
      };
      var args = [{ "CanGoNext": stateData.canPlayNext,
        "CanGoPrevious": stateData.canPlayPrev,
        "PlaybackStatus": (stateData.isPlaying ? "Playing" : "Paused"),
        "CanPlay": stateData.canPlayPause,
        "CanPause": stateData.canPlayPause,
        "CanSeek": stateData.canSeek,
        "Metadata": metadata,
        "Position": hmsToSecondsOnly((stateData.currentTime || "0").trim()) * 1000000}];
      if(stateData.currentTime != null) {
        args[0].Position = stateData.currentTime;
      }
      if(stateData.totalTime != null) {
        args[0].Metadata["mpris:length"] = stateData.totalTime;
      }
      if(stateData.volume != null) {
        args[0].Volume = stateData.volume;
      }
      mprisPort.postMessage({ command: "update_state", args: args });
    }
  };

  /**
   * Connect to the native messaging host for MPRIS support
   */
  chrome.storage.sync.get(function(obj) {

    if (Object.prototype.hasOwnProperty.call(obj,"hotkey-use_mpris") && obj["hotkey-use_mpris"]) {
      if (!connections) {
        connections += 1;
        console.log("Starting native messaging host");
        mprisPort = chrome.runtime.connectNative("org.mpris.streamkeys_host");
        mprisPort.onMessage.addListener(handleNativeMsg);

        chrome.runtime.onSuspend.addListener(function() {
          if (!--connections)
            mprisPort.postMessage({ command: "quit" });
          mprisPort.onMessage.removeListener(handleNativeMsg);
          mprisPort.disconnect();
        });

        /**
         * When a music tab is removed, we must remove it from tabStates and
         * update the state of the MPRIS player.
         */
        chrome.tabs.onRemoved.addListener(function(tabId) {
          if (Object.prototype.hasOwnProperty.call(tabStates,tabId)) {
            delete tabStates[tabId];
            if (mprisPort) handleStateData(updateMPRISState);
          }
        });

        /**
         * When the active tab changes, the best single tab might change too.
         * Thus we need to update the state of the MPRIS player.
         */
        chrome.tabs.onActivated.addListener(function(activeInfo) {
          if (mprisPort && Object.prototype.hasOwnProperty.call(tabStates,activeInfo.tabId)) {
            handleStateData(updateMPRISState);
          }
        });
      }
    }
  });

  /**
   * Catch created audio/video elements/patch js code
   */
  window.ignoreTabIds = [];
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == "loading") {
      if (window.skSites.checkMusicSite(tab.url)) {
        var index = window.ignoreTabIds.indexOf(tabId);
        if (index !== -1) {
          window.ignoreTabIds.splice(index, 1);
          // media interceptor
          chrome.tabs.executeScript(tabId,
            {file: "js/modules/MediaInterceptor.js", runAt: "document_start"});
          console.log("Inject: js/modules/MediaInterceptor.js into: " + tabId);
          // js patches
          var patchfile = window.skSites.getPatch(tab.url);
          if (patchfile) {
            chrome.tabs.executeScript(tabId,
              {file: "js/patches/" + patchfile, runAt: "document_start"});
            console.log("Inject: js/patches/" + patchfile + " into: " + tabId);
          }
          return;
        }
        window.ignoreTabIds.push(tabId);
      }
    }
  });

})();
