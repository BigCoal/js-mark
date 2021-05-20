import * as Util from "./util/index.js";
import config from "./lib/config.js";
var textSelector = (function () {
    function textSelector(ops) {
        var _a, _b;
        this._element = ops.el;
        this._selection = window.getSelection();
        if (this._element.nodeType !== 1) {
            throw new Error("请挂载dom节点");
        }
        if (!this._selection) {
            throw new Error("浏览器暂不支持标注，请查看文档支持浏览器版本");
        }
        config.isCover = (_b = (_a = ops === null || ops === void 0 ? void 0 : ops.options) === null || _a === void 0 ? void 0 : _a.isCover) !== null && _b !== void 0 ? _b : config.isCover;
        this._onMouseUp = null;
        this._onClick = null;
        this._onSelected = null;
        this.onSelected = null;
        this.onClick = null;
        this._initEvent();
        this._addEvent();
    }
    textSelector.prototype._initEvent = function () {
        var that = this;
        that._onMouseUp = function (e) {
            that._captureSelection(undefined, e);
        };
        that._onClick = function (e) {
            if (e.target !== null && "dataset" in e.target) {
                var selector = e.target.dataset.selector;
                if (selector) {
                    var doms = document.querySelectorAll("span[data-selector=\"" + selector + "\"]");
                    that.onClick && that.onClick(doms);
                }
            }
        };
        that._onSelected = function (e) {
            this.onSelected &&
                this.onSelected({
                    code: typeof e === "string" ? -1 : 1,
                    data: e,
                });
            if (typeof e === "string") {
                console.error(e);
            }
        };
    };
    textSelector.prototype._addEvent = function () {
        var that = this;
        this._element.addEventListener("mouseup", this._onMouseUp);
    };
    textSelector.prototype._destroyEvent = function () {
        var that = this;
        this._element.removeEventListener("mouseup", this._onMouseUp);
    };
    textSelector.prototype.renderStore = function (obj) {
        var _this = this;
        obj.map(function (item) {
            var startParentNode = Util.relativeNode(_this._element, item.offset + 1);
            var endParentNode = Util.relativeNode(_this._element, item.offset + item.text.length);
            if (endParentNode && startParentNode) {
                _this._captureSelection({
                    collapsed: false,
                    commonAncestorContainer: _this._element,
                    endContainer: endParentNode,
                    endOffset: item.offset +
                        item.text.length -
                        Util.relativeOffset(endParentNode, _this._element),
                    startContainer: startParentNode,
                    startOffset: item.offset - Util.relativeOffset(startParentNode, _this._element),
                    other: item,
                });
            }
        });
    };
    textSelector.prototype._captureSelection = function (rangeNode, e) {
        var selection = this._selection;
        if (selection == null)
            return;
        var range = rangeNode || selection.getRangeAt(0);
        if (range.collapsed) {
            this._onClick && this._onClick(e);
            return;
        }
        var r = {
            startContainer: range.startContainer,
            endContainer: range.endContainer,
            startOffset: range.startOffset,
            endOffset: range.endOffset,
        };
        if (config.isCover && r.startContainer !== r.endContainer) {
            selection.removeAllRanges();
            var endContainer = r.endContainer.splitText(r.endOffset);
            r.endContainer = endContainer.previousSibling;
            r.startContainer = r.startContainer.splitText(r.startOffset);
        }
        else if (!config.isCover &&
            (r.startContainer.parentNode.dataset
                .selector ||
                r.endContainer.parentNode.dataset.selector)) {
            selection.removeAllRanges();
            return this._onSelected && this._onSelected("不允许覆盖标注，详细请看配置文档，或设置isCover为true");
        }
        else {
            var endContainer = r.endContainer.splitText(r.endOffset);
            r.startContainer = r.startContainer.splitText(r.startOffset);
            r.endContainer = endContainer.previousSibling;
        }
        var textNodes = Util.getTextNodes(range.commonAncestorContainer);
        var offset = Util.relativeOffset(r.startContainer, this._element);
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
        this._onSelected &&
            this._onSelected({
                nodes: rangeNodes,
                other: rangeNode && rangeNode.other ? rangeNode.other : {},
                text: text,
                offset: offset,
                firstRender: firstRender,
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
export default textSelector;
