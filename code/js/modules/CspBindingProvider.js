"use strict";

function normalizeBinding(bindingString) {
  return (bindingString || "").replace(/\s+/g, " ").trim();
}

function getBindingStringForNode(node) {
  if (!node) return null;

  if (node.nodeType === 1) {
    return node.getAttribute("data-bind");
  }

  // Virtual element bindings: <!-- ko ... -->
  if (node.nodeType === 8) {
    var match = (node.nodeValue || "").match(/^\s*ko\s+([\s\S]+)\s*$/);
    return match ? match[1] : null;
  }

  return null;
}

function CspBindingProvider(resolveAccessors) {
  this.resolveAccessors = resolveAccessors;
}

CspBindingProvider.prototype.nodeHasBindings = function(node) {
  return !!getBindingStringForNode(node);
};

CspBindingProvider.prototype.getBindingAccessors = function(node, bindingContext) {
  var bindingString = normalizeBinding(getBindingStringForNode(node));

  if (!bindingString) {
    return {};
  }

  var accessors = this.resolveAccessors(bindingString, bindingContext, node);

  if (!accessors) {
    throw new Error("Unsupported CSP-safe binding: " + bindingString);
  }

  return accessors;
};

module.exports = {
  CspBindingProvider: CspBindingProvider,
  normalizeBinding: normalizeBinding
};
