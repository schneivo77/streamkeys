"use strict";

var ko = require("ko");
var CspBindingProvider = require("./modules/CspBindingProvider.js").CspBindingProvider;
require("material-design-lite");

var resolveOptionsBindingAccessors = function(binding, bindingContext) {
  var data = bindingContext.$data;
  var parentData = bindingContext.$parent;

  switch(binding) {
  case "click: function() { $data.selectedTab('sites') }, css: { selected: $data.selectedTab() == 'sites' }":
    return {
      click: function() {
        return function() {
          data.selectedTab("sites");
        };
      },
      css: function() {
        return { selected: data.selectedTab() === "sites" };
      }
    };
  case "click: function() { $data.selectedTab('general') }, css: { selected: $data.selectedTab() == 'general' }":
    return {
      click: function() {
        return function() {
          data.selectedTab("general");
        };
      },
      css: function() {
        return { selected: data.selectedTab() === "general" };
      }
    };
  case "visible: !$data.loadingComplete()":
    return {
      visible: function() {
        return !data.loadingComplete();
      }
    };
  case "visible: $data.selectedTab() == 'sites'":
    return {
      visible: function() {
        return data.selectedTab() === "sites";
      }
    };
  case "css: { disabled: !$data.enabled() }":
    return {
      css: function() {
        return { disabled: !data.enabled() };
      }
    };
  case "attr: { id: 'modal-' + $data.sanitizedId }":
    return {
      attr: function() {
        return { id: "modal-" + data.sanitizedId };
      }
    };
  case "text: $data.name":
    return {
      text: function() {
        return data.name;
      }
    };
  case "textInput: $data.aliasText":
    return {
      textInput: function() {
        return data.aliasText;
      }
    };
  case "click: $data.addAlias":
    return {
      click: function() {
        return data.addAlias;
      }
    };
  case "text: $data":
    return {
      text: function() {
        return data;
      }
    };
  case "click: function() { $parent.removeAlias($index); }":
    return {
      click: function() {
        return function() {
          parentData.removeAlias(bindingContext.$index);
        };
      }
    };
  case "click: function() { $data.toggleSite() }":
    return {
      click: function() {
        return function() {
          data.toggleSite();
        };
      }
    };
  case "text: $data.enabled() ? 'Disable' : 'Enable'":
    return {
      text: function() {
        return data.enabled() ? "Disable" : "Enable";
      }
    };
  case "text: $data.enabled() ? 'close' : 'check'":
    return {
      text: function() {
        return data.enabled() ? "close" : "check";
      }
    };
  case "priorityDropdown: $data.priority":
    return {
      priorityDropdown: function() {
        return data.priority;
      }
    };
  case "text: $data.priority":
    return {
      text: function() {
        return data.priority;
      }
    };
  case "text: 'arrow_drop_down'":
    return {
      text: function() {
        return "arrow_drop_down";
      }
    };
  case "aliasModal: $data.alias":
    return {
      aliasModal: function() {
        return data.alias;
      }
    };
  case "text: $data.alias().length > 0 ? $data.alias().length : 'None'":
    return {
      text: function() {
        return data.alias().length > 0 ? data.alias().length : "None";
      }
    };
  case "click: function() { $data.toggleNotifications() }":
    return {
      click: function() {
        return function() {
          data.toggleNotifications();
        };
      }
    };
  case "text: $data.showNotifications() ? 'Hide' : 'Show'":
    return {
      text: function() {
        return data.showNotifications() ? "Hide" : "Show";
      }
    };
  case "text: $data.showNotifications() ? 'close' : 'check'":
    return {
      text: function() {
        return data.showNotifications() ? "close" : "check";
      }
    };
  case "visible: $data.selectedTab() == 'general'":
    return {
      visible: function() {
        return data.selectedTab() === "general";
      }
    };
  case "checked: $data.singlePlayerMode":
    return {
      checked: function() {
        return data.singlePlayerMode;
      }
    };
  case "visible: $data.supportsMPRIS":
    return {
      visible: function() {
        return data.supportsMPRIS;
      }
    };
  case "checked: $data.useMPRIS, enable: $data.singlePlayerMode":
    return {
      checked: function() {
        return data.useMPRIS;
      },
      enable: function() {
        return data.singlePlayerMode;
      }
    };
  case "checked: $data.openOnUpdate":
    return {
      checked: function() {
        return data.openOnUpdate;
      }
    };
  case "checked: $data.youtubeRestart":
    return {
      checked: function() {
        return data.youtubeRestart;
      }
    };
  case "text: $data.description":
    return {
      text: function() {
        return data.description;
      }
    };
  case "text: $data.shortcut || 'Not Set'":
    return {
      text: function() {
        return data.shortcut || "Not Set";
      }
    };
  case "click: $data.openExtensionKeysPage":
    return {
      click: function() {
        return data.openExtensionKeysPage;
      }
    };
  case "foreach: $data.sitelist()":
    return {
      foreach: function() {
        return data.sitelist();
      }
    };
  case "foreach: $data.alias":
    return {
      foreach: function() {
        return data.alias;
      }
    };
  case "if: $data.settingsInitialized()":
    return {
      if: function() {
        return data.settingsInitialized();
      }
    };
  case "foreach: $data.commandList":
    return {
      foreach: function() {
        return data.commandList;
      }
    };
  case "if: $data.description !== ''":
    return {
      if: function() {
        return data.description !== "";
      }
    };
  default:
    return null;
  }
};

var OptionsViewModel = function OptionsViewModel() {
  var self = this;

  self.selectedTab = ko.observable("sites");

  self.sitelistInitialized = ko.observable(false);
  self.settingsInitialized = ko.observable(false);
  self.sitelist = ko.observableArray([]);
  self.commandList = ko.observableArray([]);

  self.loadingComplete = ko.pureComputed(function() {
    return self.sitelistInitialized() && self.settingsInitialized();
  });

  chrome.commands.getAll(function(commands) {
    self.commandList(commands);
  });

  self.openExtensionKeysPage = function() {
    chrome.tabs.create({
      url: "chrome://extensions/configureCommands"
    });
  };

  chrome.runtime.getPlatformInfo(function(platformInfo){
    self.supportsMPRIS = (platformInfo.os === chrome.runtime.PlatformOs.LINUX);
  });

  // Load localstorage settings into observables
  chrome.storage.sync.get(function(obj) {
    self.openOnUpdate = ko.observable(obj["hotkey-open_on_update"]);
    self.openOnUpdate.subscribe(function(value) {
      chrome.storage.sync.set({ "hotkey-open_on_update": value });
    });

    self.useMPRIS = ko.observable(obj["hotkey-use_mpris"]);
    self.useMPRIS.subscribe(function(value) {
      if (value) {
        chrome.permissions.contains({
          permissions: ["nativeMessaging"],
        }, function (alreadyHaveNativeMessagingPermissions) {
          if (alreadyHaveNativeMessagingPermissions) {
            chrome.storage.sync.set({ "hotkey-use_mpris": value });
          }
          else {
            chrome.permissions.request({
              permissions: ["nativeMessaging"],
            }, function (granted) {
              chrome.storage.sync.set({ "hotkey-use_mpris": granted });
            });
          }
        });
      } else {
        chrome.storage.sync.set({ "hotkey-use_mpris": value });
      }
    });

    self.youtubeRestart = ko.observable(obj["hotkey-youtube_restart"]);
    self.youtubeRestart.subscribe(function(value) {
      chrome.storage.sync.set({ "hotkey-youtube_restart": value });
    });

    self.singlePlayerMode = ko.observable(obj["hotkey-single_player_mode"]);
    self.singlePlayerMode.subscribe(function(value) {
      chrome.storage.sync.set({ "hotkey-single_player_mode": value });
      if (!value) self.useMPRIS(false);
    });

    self.settingsInitialized(true);
  });

  self.sitelistChanged = function(site) {
    if(self.sitelistInitialized()) {
      chrome.runtime.sendMessage({
        action: "update_site_settings",
        siteKey: site.id,
        siteState: {
          enabled: site.enabled.peek(),
          priority: site.priority.peek(),
          alias: site.alias.peek(),
          showNotifications: site.showNotifications.peek(),
          removedAlias: site.removedAlias
        }
      });
    }
  };

  chrome.runtime.sendMessage({ action: "get_sites" }, function(response) {
    Object.keys(response).forEach(function(key) {
      const siteData = response[key];

      var site = new MusicSite({
        id: key,
        name: siteData.name,
        enabled: siteData.enabled,
        priority: siteData.priority,
        alias: siteData.alias,
        showNotifications: siteData.showNotifications
      });

      site.enabled.subscribe(function() {
        self.sitelistChanged(site);
      });
      site.priority.subscribe(function() {
        self.sitelistChanged(site);
      });
      site.alias.subscribe(function() {
        self.sitelistChanged(site);
      });
      site.showNotifications.subscribe(function() {
        self.sitelistChanged(site);
      });

      self.sitelist.push(site);
    });

    self.sitelistInitialized(true);
  });
};

var MusicSite = (function() {
  function MusicSite(attributes) {
    var self = this;

    self.id = attributes.id;
    self.sanitizedId = attributes.id.replace(/[.,"']/g, "");
    self.name = attributes.name;
    self.enabled = ko.observable(attributes.enabled);
    self.priority = ko.observable(attributes.priority);
    self.alias = ko.observableArray(attributes.alias || []);
    self.showNotifications = ko.observable(attributes.showNotifications);
    self.removedAlias = [];
    self.aliasText = ko.observable("");

    self.toggleSite = function() {
      self.enabled(!self.enabled.peek());
    };

    self.toggleNotifications = function() {
      var internalToggleNotifications = function() {
        self.showNotifications(!self.showNotifications.peek());
      };

      chrome.permissions.contains({
        permissions: ["notifications"],
        origins: ["http://*/*", "https://*/*"]
      }, function (alreadyHaveNotificationsPermissions) {
        if (alreadyHaveNotificationsPermissions) {
          internalToggleNotifications();
        }
        else {
          chrome.permissions.request({
            permissions: ["notifications"],
            origins: ["http://*/*", "https://*/*"]
          }, function (granted) {
            if (granted) {
              internalToggleNotifications();
            }
          });
        }
      });
    };

    /**
     * Note: It's possible some validation should be added to check if alias is proper domain.
     *    However, since it is user input and can be deleted it's probably not worth it.
     */
    self.addAlias = function() {
      self.removedAlias = [];
      self.alias.push(self.aliasText.peek());
      self.aliasText("");
    };

    self.removeAlias = function(index) {
      var aliasToRemove = self.alias.peek()[index()];

      self.removedAlias = [aliasToRemove];
      self.alias.remove(aliasToRemove);
    };
  }

  return MusicSite;
})();

document.addEventListener("DOMContentLoaded", function() {
  ko.bindingProvider.instance = new CspBindingProvider(resolveOptionsBindingAccessors);

  ko.bindingHandlers.priorityDropdown = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var value = valueAccessor();

      element.id = bindingContext.$data.sanitizedId;

      var $ul = document.createElement("ul");

      $ul.className += "mdl-menu mdl-js-menu mdl-js-ripple-effect";
      $ul.setAttribute("for", bindingContext.$data.sanitizedId);

      var updatePriority = function() {
        value(parseInt(this.getAttribute("data-value")));
      };

      for (var idx = 1; idx <= 9; idx++) {
        // add each item to the list
        var $li = document.createElement("li");

        $li.className += "mdl-menu__item";
        $li.textContent = idx;
        $li.setAttribute("data-value", idx);
        $li.onclick = updatePriority;

        $ul.appendChild($li);
      }

      element.after($ul);

      window.componentHandler.upgradeElement($ul);
      window.componentHandler.upgradeElement(element);
    }
  };

  ko.bindingHandlers.aliasModal = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var dialog = document.querySelector("#modal-" + bindingContext.$data.sanitizedId);
      var closeButton = dialog.querySelector(".close-button");
      var showButton = element;

      var closeClickHandler = function() {
        dialog.close();
      };

      var showClickHandler = function() {
        dialog.showModal();
      };

      showButton.addEventListener("click", showClickHandler);
      closeButton.addEventListener("click", closeClickHandler);
    }
  };

  ko.applyBindings(new OptionsViewModel());
});
