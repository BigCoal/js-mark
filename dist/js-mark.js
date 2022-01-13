(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.JsMark = factory());
})(this, (function () { 'use strict';

    var NodeTypes;
    (function (NodeTypes) {
        NodeTypes[NodeTypes["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
        NodeTypes[NodeTypes["TEXT_NODE"] = 3] = "TEXT_NODE";
    })(NodeTypes || (NodeTypes = {}));
    function hasOwn(obj, key) {
        return obj.hasOwnProperty(key);
    }

    function Guid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    function getTextNodes(node) {
        let textNodes = [];
        let e = node.childNodes;
        for (let i = 0; i < e.length; i++) {
            let element = e[i];
            if (element.nodeType === NodeTypes.TEXT_NODE) {
                if (element.textContent && element.textContent !== '\n') {
                    textNodes.push(element);
                }
            }
            else if (element.nodeType === NodeTypes.ELEMENT_NODE) {
                textNodes.push(...getTextNodes(element));
            }
        }
        return textNodes;
    }
    function relativeOffsetChat(content, root) {
        let textNodes = getTextNodes(root);
        let length = 0;
        let hitContent = textNodes.map((item) => {
            let data = item.data;
            let reg = new RegExp(`${content}`, "g");
            let mac = null;
            let macArr = [];
            while ((mac = reg.exec(data))) {
                macArr.push({
                    offset: mac.index + length,
                    text: content,
                });
                reg.lastIndex = reg.lastIndex - content.length + 1;
            }
            length += item.length;
            return macArr;
        });
        return hitContent.flat(Infinity);
    }
    function getRelativeOffset(ele, root) {
        let textNodes = getTextNodes(root);
        let i = textNodes.indexOf(ele);
        let offset = 0;
        for (let t = 0; t < i; t++) {
            if (textNodes[t] && textNodes[t].nodeValue !== null) {
                offset += textNodes[t].nodeValue.length;
            }
        }
        return offset;
    }
    function relativeNode(root, offset) {
        let node = null;
        let relativeOffset = 0;
        let textNodes = getTextNodes(root);
        for (let t = 0; t < textNodes.length; t++) {
            if (textNodes[t] && textNodes[t].nodeValue !== null) {
                relativeOffset += textNodes[t].nodeValue.length;
            }
            if (offset <= relativeOffset) {
                node = textNodes[t];
                break;
            }
        }
        return node;
    }
    function sliceTextNodes(textNodes, startTextNode, endTextNode) {
        let startIndex = textNodes.indexOf(startTextNode);
        let endIndex = textNodes.indexOf(endTextNode);
        let rangeText = textNodes.filter((_, i) => {
            return startIndex <= i && endIndex >= i;
        });
        return rangeText;
    }

    var config = {
        isCover: true,
        ignoreClass: []
    };

    function mergeOptions(basicOps, newOps) {
        for (let i in basicOps) {
            if (hasOwn(newOps, i)) {
                basicOps[i] = newOps[i];
            }
        }
        return basicOps;
    }

    const markSelector = "data-selector";
    class JsMark {
        constructor(ops) {
            this.onSelected = null;
            this.onClick = null;
            const ele = this._element = ops.el;
            this._selection = window.getSelection();
            if (ele.nodeType !== 1) {
                this._onError("请挂载dom节点");
            }
            if (!this._selection) {
                this._onError("浏览器暂不支持标注，请查看文档支持浏览器版本");
            }
            mergeOptions(config, ops.options);
            ele.addEventListener("mouseup", this._onMouseUp.bind(this));
        }
        _onClick(e) {
            if (e.target !== null && "dataset" in e.target) {
                let selectorId = e.target.dataset.selector;
                if (selectorId) {
                    this.onClick && this.onClick(selectorId);
                }
            }
        }
        _onError(e) {
            throw new Error(e);
        }
        _onSelected(e) {
            this.onSelected && this.onSelected(e);
        }
        _onMouseUp(e) {
            let selection = this._selection;
            if (selection == null)
                return;
            if (selection.isCollapsed) {
                return this._onClick && this._onClick(e);
            }
            const range = selection.getRangeAt(0);
            this._captureSelection(range);
        }
        _captureSelection(range) {
            let selection = this._selection;
            if (!selection)
                return;
            if (range.startContainer.nodeType !== 3 || range.endContainer.nodeType !== 3) {
                selection.removeAllRanges();
                return this._onError("只可选中文本节点");
            }
            if (!config.isCover && this.hasCoverSelector(range, markSelector)) {
                selection.removeAllRanges();
                return this._onError("不允许覆盖标注，详细请看配置文档，或设置isCover为true");
            }
            let sCntr = range.startContainer;
            let eCntr = range.endContainer;
            if (sCntr !== eCntr) {
                let endContainer = eCntr.splitText(range.endOffset);
                eCntr = endContainer.previousSibling;
                sCntr = sCntr.splitText(range.startOffset);
            }
            else {
                let endContainer = eCntr.splitText(range.endOffset);
                sCntr = sCntr.splitText(range.startOffset);
                eCntr = endContainer.previousSibling;
            }
            const textNodes = getTextNodes(range.commonAncestorContainer);
            const offset = getRelativeOffset(sCntr, this._element);
            const rangeNodes = sliceTextNodes(textNodes, sCntr, eCntr);
            this._onSelected({
                text: range.toString(),
                offset,
                hasStoreRender: hasOwn(range, "storeRenderOther"),
                textNodes: rangeNodes,
                storeRenderOther: range && range.storeRenderOther ? range.storeRenderOther : {},
            });
            selection.removeAllRanges();
            range.detach && range.detach();
        }
        hasCoverSelector(range, attrName) {
            var _a;
            let hasCover = false;
            if (range.cloneContents().querySelector(`[${attrName}]`)) {
                hasCover = true;
            }
            else {
                if (((_a = range.commonAncestorContainer.parentNode) === null || _a === void 0 ? void 0 : _a.nodeType) === 1) {
                    const pNode = range.commonAncestorContainer.parentNode;
                    if (pNode.getAttribute(attrName)) {
                        hasCover = true;
                    }
                }
            }
            return hasCover;
        }
        destroy() {
            this._selection = null;
            this._element.removeEventListener("mouseup", this._onMouseUp);
        }
        renderStore(obj) {
            if (this._selection == null)
                return;
            obj.map((item) => {
                let startParentNode = relativeNode(this._element, item.offset + 1);
                let endParentNode = relativeNode(this._element, item.offset + item.text.length);
                if (endParentNode && startParentNode) {
                    const obj = {
                        collapsed: false,
                        commonAncestorContainer: this._element,
                        endContainer: endParentNode,
                        endOffset: item.offset +
                            item.text.length -
                            getRelativeOffset(endParentNode, this._element),
                        startContainer: startParentNode,
                        startOffset: item.offset - getRelativeOffset(startParentNode, this._element),
                        storeRenderOther: item,
                    };
                    this._captureSelection(obj);
                }
            });
        }
        findWord(word) {
            if (!word)
                return null;
            return relativeOffsetChat(word, this._element);
        }
        repaintRange(rangeNode) {
            let { uuid, className, textNodes } = rangeNode;
            let uid = uuid || Guid();
            textNodes.forEach((node) => {
                if (node.parentNode) {
                    let hl = document.createElement("span");
                    if (className) {
                        hl.className = className;
                    }
                    else {
                        hl.style.background = "rgba(255, 255, 0, 0.3)";
                    }
                    hl.setAttribute(markSelector, uid);
                    node.parentNode.replaceChild(hl, node);
                    hl.appendChild(node);
                }
            });
            return uuid;
        }
        deleteMark(uuid) {
            let eleArr = document.querySelectorAll(`span[${markSelector}="${uuid}"]`);
            eleArr.forEach((node) => {
                if (node.parentNode) {
                    const fragment = document.createDocumentFragment();
                    let childNodes = node.childNodes;
                    for (let i = 0; i < childNodes.length; i++) {
                        const node = childNodes[i];
                        fragment.appendChild(node.cloneNode(true));
                    }
                    node.parentNode.replaceChild(fragment, node);
                }
            });
        }
    }

    return JsMark;

}));
