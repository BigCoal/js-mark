"use strict";
exports.__esModule = true;
var Util = require("./util/index.js");
var config_js_1 = require("./lib/config.js");
var textSelector = /** @class */ (function () {
    function textSelector(element) {
        this.element = element;
        this.selection = window.getSelection();
        this._mouseUp = null;
        this._click = null;
        this._selected = null;
        this.onSelected = null;
        this.onClick = null;
        this._initEvent();
    }
    textSelector.prototype._initEvent = function () {
        var that = this;
        this._mouseUp = function (e) {
            that.captureSelection(undefined, e);
        };
        this._click = function (e) {
            if (e.target !== null && "dataset" in e.target) {
                var selector = e.target.dataset.selector;
                if (selector) {
                    var doms = document.querySelectorAll("span[data-selector=\"" + selector + "\"]");
                    that.onClick && that.onClick(doms);
                }
            }
        };
        this._selected = function (e) {
            this.onSelected &&
                this.onSelected({
                    code: typeof e === "string" ? -1 : 1,
                    data: e
                });
        };
        this.addEvent();
    };
    textSelector.prototype.addEvent = function () {
        var that = this;
        this.element.addEventListener("mouseup", function (e) {
            that._mouseUp && that._mouseUp(e);
        });
    };
    textSelector.prototype.destroyEvent = function () {
        var that = this;
        this.element.removeEventListener("mouseup", function (e) {
            that._mouseUp && that._mouseUp(e);
        });
    };
    textSelector.prototype.fromStore = function (obj) {
        var _this = this;
        obj.map(function (item) {
            var startParentNode = Util.relativeNode(_this.element, item.offset + 1);
            var endParentNode = Util.relativeNode(_this.element, item.offset + item.text.length);
            if (endParentNode && startParentNode) {
                _this.captureSelection({
                    collapsed: false,
                    commonAncestorContainer: _this.element,
                    endContainer: endParentNode,
                    endOffset: item.offset +
                        item.text.length -
                        Util.relativeOffset(endParentNode, _this.element),
                    startContainer: startParentNode,
                    startOffset: item.offset - Util.relativeOffset(startParentNode, _this.element),
                    other: item
                });
            }
        });
    };
    textSelector.prototype.captureSelection = function (rangeNode, e) {
        var selection = this.selection;
        if (selection == null)
            return;
        var range = rangeNode || selection.getRangeAt(0);
        if (range.collapsed) {
            this._click && this._click(e);
            return;
        }
        var r = {
            startContainer: range.startContainer,
            endContainer: range.endContainer,
            startOffset: range.startOffset,
            endOffset: range.endOffset
        };
        // debugger
        if (config_js_1["default"].isCover && r.startContainer !== r.endContainer) {
            selection.removeAllRanges();
            var endContainer = r.endContainer.splitText(r.endOffset);
            r.endContainer = endContainer.previousSibling;
            r.startContainer = r.startContainer.splitText(r.startOffset);
        }
        else if (!config_js_1["default"].isCover &&
            (r.startContainer.parentNode.dataset
                .selector ||
                r.endContainer.parentNode.dataset.selector)) {
            selection.removeAllRanges();
            return this._selected && this._selected("不允许重复标注");
        }
        else {
            var endContainer = r.endContainer.splitText(r.endOffset);
            r.startContainer = r.startContainer.splitText(r.startOffset);
            r.endContainer = endContainer.previousSibling;
        }
        var textNodes = Util.getTextNodes(range.commonAncestorContainer);
        var offset = Util.relativeOffset(r.startContainer, this.element);
        var rangeNodes = this.getSelectTextNode(textNodes, r);
        var text = "";
        for (var i = 0; i < rangeNodes.length; i++) {
            var e_1 = rangeNodes[i];
            text += e_1.nodeValue;
        }
        var firstRender = true;
        if (!rangeNode) {
            firstRender = false;
            selection.removeAllRanges();
        }
        this._selected &&
            this._selected({
                nodes: rangeNodes,
                other: rangeNode && rangeNode.other ? rangeNode.other : {},
                text: text,
                offset: offset,
                firstRender: firstRender
            });
    };
    textSelector.prototype.getSelectTextNode = function (textNodes, range) {
        var startIndex = textNodes.indexOf(range.startContainer);
        var endIndex = textNodes.indexOf(range.endContainer);
        var rangeText = textNodes.filter(function (item, i) {
            return startIndex <= i && endIndex >= i;
        });
        return rangeText;
    };
    textSelector.prototype.repaintRange = function (eleArr, uuid, cssClass) {
        var uid = uuid || Util.Guid();
        eleArr.forEach(function (node) {
            if (node.parentNode) {
                var hl = document.createElement("span");
                hl.className = cssClass;
                hl.setAttribute("data-selector", uid);
                node.parentNode.replaceChild(hl, node);
                hl.appendChild(node);
            }
        });
        return uuid;
    };
    textSelector.prototype.clearRange = function (uuid) {
        var eleArr = document.querySelectorAll("span[data-selector=\"" + uuid + "\"]");
        eleArr.forEach(function (node) {
            if (node.parentNode) {
                var fragment = document.createDocumentFragment();
                var childNodes = node.childNodes;
                for (var i = 0; i < childNodes.length; i++) {
                    var node_1 = childNodes[i];
                    fragment.appendChild(node_1.cloneNode(true));
                }
                node.parentNode.replaceChild(fragment, node);
            }
        });
    };
    return textSelector;
}());
exports["default"] = textSelector;
