"use strict";

var ko = require("ko"),
  _ = require("lodash");
var CspBindingProvider = require("../modules/CspBindingProvider.js").CspBindingProvider;
require("material-design-lite");

var resolvePopupBindingAccessors = function(binding, bindingContext) {
  var data = bindingContext.$data;
  var parentData = bindingContext.$parent;

  switch(binding) {
  case "visible: $data.sortedMusicTabs().length == 0 && $data.isLoaded()":
    return {
      visible: function() {
        return data.sortedMusicTabs().length === 0 && data.isLoaded();
      }
    };
  case "css: { disabled: !$data.streamkeysEnabled() }, template: { name: 'site-template' }":
    return {
      css: function() {
        return { disabled: !data.streamkeysEnabled() };
      },
      template: function() {
        return { name: "site-template" };
      }
    };
  case "click: function() { $data.disabledSitesOpen(!$data.disabledSitesOpen.peek()); }":
    return {
      click: function() {
        return function() {
          data.disabledSitesOpen(!data.disabledSitesOpen.peek());
        };
      }
    };
  case "text: $data.disabledSitesOpen() ? 'Hide Disabled Sites' : 'Show Disabled Sites'":
    return {
      text: function() {
        return data.disabledSitesOpen() ? "Hide Disabled Sites" : "Show Disabled Sites";
      }
    };
  case "text: $data.disabledSitesOpen() ? 'arrow_drop_up' : 'arrow_drop_down'":
    return {
      text: function() {
        return data.disabledSitesOpen() ? "arrow_drop_up" : "arrow_drop_down";
      }
    };
  case "slideMenu: $data.disabledSitesOpen":
    return {
      slideMenu: function() {
        return data.disabledSitesOpen;
      }
    };
  case "template: { name: 'site-template' }":
    return {
      template: function() {
        return { name: "site-template" };
      }
    };
  case "click: $data.openOptionsPage":
    return {
      click: function() {
        return data.openOptionsPage;
      }
    };
  case "click: function() { window.open('http://www.streamkeys.com/guide.html'); }":
    return {
      click: function() {
        return function() {
          window.open("http://www.streamkeys.com/guide.html");
        };
      }
    };
  case "click: function() { window.open('http://www.streamkeys.com/donate.html'); }":
    return {
      click: function() {
        return function() {
          window.open("http://www.streamkeys.com/donate.html");
        };
      }
    };
  case "text: $data.priority":
    return {
      text: function() {
        return data.priority;
      }
    };
  case "click: function() { $data.openTab() }":
    return {
      click: function() {
        return function() {
          data.openTab();
        };
      }
    };
  case "attr: { src: $data.faviconUrl }":
    return {
      attr: function() {
        return { src: data.faviconUrl };
      }
    };
  case "text: $data.siteName":
    return {
      text: function() {
        return data.siteName;
      }
    };
  case "scrollingSong: $data.songArtistText, visible: $data.songArtistText().length":
    return {
      scrollingSong: function() {
        return data.songArtistText;
      },
      visible: function() {
        return data.songArtistText().length;
      }
    };
  case "click: function() { $data.settingsOpen(!$data.settingsOpen.peek()); }":
    return {
      click: function() {
        return function() {
          data.settingsOpen(!data.settingsOpen.peek());
        };
      }
    };
  case "click: function() { $data.sendAction('playPrev'); }, css: { 'mdl-button--disabled': !$data.canPlayPrev() }":
    return {
      click: function() {
        return function() {
          data.sendAction("playPrev");
        };
      },
      css: function() {
        return { "mdl-button--disabled": !data.canPlayPrev() };
      }
    };
  case "click: function() { $data.sendAction('dislike'); }, css: { 'mdl-button--disabled': !$data.canDislike() }":
    return {
      click: function() {
        return function() {
          data.sendAction("dislike");
        };
      },
      css: function() {
        return { "mdl-button--disabled": !data.canDislike() };
      }
    };
  case "click: function() { $data.sendAction('playPause'); }":
    return {
      click: function() {
        return function() {
          data.sendAction("playPause");
        };
      }
    };
  case "text: $data.isPlaying() ? 'pause_arrow' : 'play_arrow'":
    return {
      text: function() {
        return data.isPlaying() ? "pause_arrow" : "play_arrow";
      }
    };
  case "click: function() { $data.sendAction('like'); }, css: { 'mdl-button--disabled': !$data.canLike() }":
    return {
      click: function() {
        return function() {
          data.sendAction("like");
        };
      },
      css: function() {
        return { "mdl-button--disabled": !data.canLike() };
      }
    };
  case "click: function() { $data.sendAction('playNext'); }, css: { 'mdl-button--disabled': !$data.canPlayNext() }":
    return {
      click: function() {
        return function() {
          data.sendAction("playNext");
        };
      },
      css: function() {
        return { "mdl-button--disabled": !data.canPlayNext() };
      }
    };
  case "click: function() { $data.toggleStreamkeysEnabled(); }, css: { active: !$data.streamkeysEnabled() }":
    return {
      click: function() {
        return function() {
          data.toggleStreamkeysEnabled();
        };
      },
      css: function() {
        return { active: !data.streamkeysEnabled() };
      }
    };
  case "click: function() { $data.sendAction('addVolume', -0.05); }, css: { 'mdl-button--disabled': !$data.canSetVolume() }":
    return {
      click: function() {
        return function() {
          data.sendAction("addVolume", -0.05);
        };
      },
      css: function() {
        return { "mdl-button--disabled": !data.canSetVolume() };
      }
    };
  case "event: { input: function() { var volume = document.getElementById('vol_slider').value; $data.volume = function() { return volume / 100; }; $data.sendAction('volume', volume / 100); $data.displayVolume(volume); }}":
    return {
      event: function() {
        return {
          input: function() {
            var volume = document.getElementById("vol_slider").value;
            data.volume = function() { return volume / 100; };
            data.sendAction("volume", volume / 100);
            data.displayVolume(volume);
          }
        };
      }
    };
  case "click: function() { $data.sendAction('addVolume', 0.05); }, css: { 'mdl-button--disabled': !$data.canSetVolume() }":
    return {
      click: function() {
        return function() {
          data.sendAction("addVolume", 0.05);
        };
      },
      css: function() {
        return { "mdl-button--disabled": !data.canSetVolume() };
      }
    };
  case "click: function() { $data.sendAction('mute'); }, css: { 'mdl-button--disabled': !$data.canMute() }":
    return {
      click: function() {
        return function() {
          data.sendAction("mute");
        };
      },
      css: function() {
        return { "mdl-button--disabled": !data.canMute() };
      }
    };
  case "event: { input: function() { var timeSlider = document.getElementById('time_slider'); var time = timeSlider.value; var duration = timeSlider.max; $data.current_time = function() { return time * 1000 * 1000; }; $data.total_time = function() { return duration * 1000 * 1000; }; $data.sendAction('position', time); $data.displayTime(time, duration); }}":
    return {
      event: function() {
        return {
          input: function() {
            var timeSlider = document.getElementById("time_slider");
            var time = timeSlider.value;
            var duration = timeSlider.max;
            data.current_time = function() { return time * 1000 * 1000; };
            data.total_time = function() { return duration * 1000 * 1000; };
            data.sendAction("position", time);
            data.displayTime(time, duration);
          }
        };
      }
    };
  case "slideMenu: $data.settingsOpen":
    return {
      slideMenu: function() {
        return data.settingsOpen;
      }
    };
  case "click: function() { if ($data.priority.peek() > 1) $data.priority($data.priority.peek() - 1); }, css: { 'mdl-button--disabled': $data.priority() <= 1 }":
    return {
      click: function() {
        return function() {
          if (data.priority.peek() > 1) data.priority(data.priority.peek() - 1);
        };
      },
      css: function() {
        return { "mdl-button--disabled": data.priority() <= 1 };
      }
    };
  case "text: $data.priority()":
    return {
      text: function() {
        return data.priority();
      }
    };
  case "click: function() { if ($data.priority.peek() < 9) $data.priority($data.priority.peek() + 1); }, css: { 'mdl-button--disabled': $data.priority() >= 9 }":
    return {
      click: function() {
        return function() {
          if (data.priority.peek() < 9) data.priority(data.priority.peek() + 1);
        };
      },
      css: function() {
        return { "mdl-button--disabled": data.priority() >= 9 };
      }
    };
  case "click: $parent.openOptionsPage":
    return {
      click: function() {
        return parentData.openOptionsPage;
      }
    };
  case "foreach: $data.sortedMusicTabs":
    return {
      foreach: function() {
        return data.sortedMusicTabs;
      }
    };
  case "if: $data.disabledMusicTabs().length > 0 && $data.isLoaded":
    return {
      if: function() {
        return data.disabledMusicTabs().length > 0 && data.isLoaded;
      }
    };
  case "foreach: $data.disabledMusicTabs":
    return {
      foreach: function() {
        return data.disabledMusicTabs;
      }
    };
  default:
    return null;
  }
};

var PopupViewModel = function PopupViewModel() {
  var self = this;

  self.totalMusicTabs = ko.observable(1);
  self.musicTabsLoaded = ko.observable(0);
  self.musicTabs = ko.observableArray([]);

  // Tabs from disabled music sites to show in disabled list toggle
  self.disabledMusicTabs = ko.observableArray([]);
  self.disabledSitesOpen = ko.observable(false);

  // Filter hidden players and sort by priority -> siteName -> tabId
  self.sortedMusicTabs = ko.pureComputed(function() {
    var filteredGrouped = _.groupBy(
      _.filter(self.musicTabs(), function(tab) {
        return (tab.canPlayPause() || !tab.hidePlayer);
      }),
      function(tab) { return tab.priority(); }
    );

    var sortedKeys = _.sortBy(
      _.keys(filteredGrouped),
      function(priority) { return priority * -1; }
    );

    var filteredGroupedSorted = [];

    _.forEach(sortedKeys, function(key) {
      filteredGroupedSorted.push(
        _.sortBy(
          filteredGrouped[key], ["siteName", "tabId"]
        )
      );
    });

    return _.flatten(filteredGroupedSorted);
  });

  self.isLoaded = ko.pureComputed(function() {
    return self.musicTabsLoaded() == self.totalMusicTabs();
  });

  self.visibleMusicTabs = ko.observableArray([]);
  self.optionsUrl = ko.observable(chrome.runtime.getURL("html/options.html"));

  self.openOptionsPage = function() {
    window.open(self.optionsUrl());
  };

  // Send a request to get the player state of every active music site tab
  chrome.runtime.sendMessage({ action: "get_music_tabs" }, self.getTabStates.bind(this));

  // Setup listener for updating the popup state
  chrome.runtime.onMessage.addListener(function(request) {
    if(request.action === "update_popup_state" && request.stateData) self.updateState(request.stateData, request.fromTab);
  });
};

PopupViewModel.prototype.updateState = function(stateData, tab, disabled) {
  if(typeof stateData == "undefined") return false;

  var self = this;

  var musicTab = _.find(
    _.union(this.musicTabs.peek(), this.disabledMusicTabs.peek()),
    function(itTab) { return itTab.tabId == tab.id; }
  );

  if(musicTab) {
    // Update observables
    _.forEach(musicTab.observableProperties, function(property) {
      if(typeof stateData[property] !== "undefined") musicTab[property](stateData[property]);
    });
  } else {
    // Create new tab
    musicTab = new MusicTab(_.assign(stateData, {
      tabId: tab.id,
      faviconUrl: tab.favIconUrl,
      priority: tab.streamkeysPriority,
      siteKey: tab.streamkeysSiteKey,
      streamkeysEnabled: typeof tab.streamkeysEnabled !== "undefined" ? tab.streamkeysEnabled : true,
    }));

    if(disabled) {
      this.disabledMusicTabs.push(musicTab);
    } else {
      this.musicTabs.push(musicTab);
    }

    // Subscribe to each sites priority to maintain state if multiple tabs are open
    musicTab.priority.subscribe(function(newPriority) {
      _.forEach(self.musicTabs(), function(tab) {
        if(tab.siteKey === this.siteKey && tab.tabId !== this.tabId && tab.priority() !== newPriority) {
          tab.priority(newPriority);
        }
      }, this);
    }, musicTab);
  }
  var timeContainer = document.getElementById("time_container");
  if(musicTab.canSeek()) {
    var time = parseInt(musicTab.currentTime() / (1000 * 1000));
    var duration = parseInt(musicTab.totalTime() / (1000 * 1000));
    displayTime(time, duration);
    if(timeContainer) timeContainer.style.display = "flex";
  } else {
    if(timeContainer) timeContainer.style.display = "none";
  }
  var volumeContainer = document.getElementById("volume_container");
  if(musicTab.canSetVolume()) {
    var volume = Math.round(musicTab.volume() * 100);
    displayVolume(volume);
    if(volumeContainer) volumeContainer.style.display = "flex";
  } else {
    if(volumeContainer) volumeContainer.style.display = "none";
  }
  window.componentHandler.upgradeDom();
};

/**
 * Query each active music tab for the player state, then update the popup state
 * @param {Array} tabs - array of active music tabs
 */
PopupViewModel.prototype.getTabStates = function(tabs) {
  var that = this;
  that.totalMusicTabs(tabs.enabled.length + tabs.disabled.length);

  _.forEach(tabs.enabled, function(tab) {
    chrome.tabs.sendMessage(tab.id, { action: "getPlayerState" }, (function(playerState) {
      that.updateState(playerState, this.tab);
      that.musicTabsLoaded(that.musicTabsLoaded.peek() + 1);
    }).bind({ tab: tab }));
  });

  _.forEach(tabs.disabled, function(tab) {
    chrome.tabs.sendMessage(tab.id, { action: "getPlayerState" }, (function(playerState) {
      that.updateState(playerState, this.tab, true);
      that.musicTabsLoaded(that.musicTabsLoaded.peek() + 1);
    }).bind({ tab: tab }));
  });
};

var MusicTab = (function() {
  function MusicTab(attributes) {
    var self = this;

    this.observableProperties = [
      "song",
      "artist",
      "streamkeysEnabled",
      "priority",
      "isPlaying",
      "canPlayPause",
      "canPlayNext",
      "canPlayPrev",
      "canMute",
      "canLike",
      "canDislike",
      "canSeek",
      "canSetVolume",
      "volume",
      "currentTime",
      "totalTime"
    ];

    _.assign(this, attributes);

    /** Override observables **/
    _.forEach(this.observableProperties, (function(property) {
      this[property] = ko.observable(typeof attributes[property] !== "undefined" ? attributes[property] : null);
    }).bind(this));

    /** Popup specific observables **/
    this.songArtistText = ko.pureComputed(function() {
      if(!this.song()) return "";

      return (this.artist()) ? this.artist() + " - " + this.song() : this.song();
    }, this);

    this.settingsOpen = ko.observable(false);

    this.priority.subscribe(function(priority) {
      chrome.runtime.sendMessage({
        action: "update_site_settings",
        siteKey: self.siteKey,
        siteState: {
          priority: priority
        }
      });
    });

    this.sendAction = function(action, ...args) {
      chrome.runtime.sendMessage({
        action: "command",
        args: args,
        command: action,
        tab_target: this.tabId
      });
    };

    this.openTab = function() {
      chrome.tabs.update(parseInt(this.tabId), { active: true });
    };

    this.toggleStreamkeysEnabled = function() {
      this.streamkeysEnabled(!this.streamkeysEnabled.peek());
      chrome.runtime.sendMessage({
        action: "mark_tab_enabled_state",
        tabId: this.tabId,
        enabled: this.streamkeysEnabled.peek()
      });
    };

    this.displayTime = displayTime;

    this.displayVolume = displayVolume;
  }

  return MusicTab;
})();

document.addEventListener("DOMContentLoaded", function() {
  ko.bindingProvider.instance = new CspBindingProvider(resolvePopupBindingAccessors);

  window.popup = new PopupViewModel();

  ko.bindingHandlers.scrollingSong = {
    update: function(element, valueAccessor) {
      element.querySelector(".song-text").textContent = ko.unwrap(valueAccessor());

      if(element.querySelector(".song-text").scrollWidth > document.querySelector("#player").clientWidth) {
        var content = element.querySelector(".song-text").innerHTML;

        element.querySelector(".song-text").innerHTML = "<marquee>" + content + "</marquee>";
      }
    }
  };

  ko.bindingHandlers.slideMenu = {
    update: function(element, valueAccessor) {
      var value = ko.unwrap(valueAccessor());

      if(value) {
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
    }
  };

  ko.applyBindings(window.popup);
});

function displayTime(time, duration) {
  var timeSlider = document.getElementById("time_slider");
  if(timeSlider != undefined) {
    // we have to set max before min on the dom element
    timeSlider.max = duration;
    timeSlider.value = time;
    var durationMinuteStrLength = parseInt(duration / 60).toString().length;
    var timeStr = parseInt(time / 60).toString().padStart(durationMinuteStrLength, "0") + ":" + parseInt(time % 60).toString().padStart(2, "0");
    var durationStr = parseInt(duration / 60).toString() + ":" + parseInt(duration % 60).toString().padStart(2, "0");
    document.getElementById("time").innerHTML = timeStr + " / " + durationStr;
  }
}

function displayVolume(volume) {
  var volSlider = document.getElementById("vol_slider");
  if(volSlider != undefined) {
    document.getElementById("vol_slider").value = volume;
    document.getElementById("vol_perc").innerHTML = (volume + "%").padStart(4);
  }
}
