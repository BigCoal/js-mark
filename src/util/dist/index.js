"use strict";
exports.__esModule = true;
exports.relativeNode = exports.relativeOffset = exports.getTextNodes = exports.Guid = void 0;
var index_js_1 = require("../lib/index.js");
function Guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
exports.Guid = Guid;
/** 获取所有的文本节点*/
function getTextNodes(ele) {
    var nodes = [];
    var e = ele.childNodes;
    for (var i = 0; i < e.length; i++) {
        var element = e[i];
        if (element.nodeType !== index_js_1.NodeTypes.TEXT_NODE) {
            nodes.push.apply(nodes, getTextNodes(element));
        }
        else {
            nodes.push(element);
        }
    }
    return nodes;
}
exports.getTextNodes = getTextNodes;
/** 获取ele元素相对于root元素的偏移量*/
function relativeOffset(ele, root) {
    var textNodes = getTextNodes(root);
    var i = textNodes.indexOf(ele);
    var offset = 0;
    for (var t = 0; t < i; t++) {
        if (textNodes[t] && textNodes[t].nodeValue !== null) {
            offset += textNodes[t].nodeValue.length;
        }
    }
    return offset;
}
exports.relativeOffset = relativeOffset;
// /** 获取root元素下偏移量为offset的父节点*/
function relativeNode(root, offset) {
    var node = null;
    var relativeOffset = 0;
    var textNodes = getTextNodes(root);
    for (var t = 0; t < textNodes.length; t++) {
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
exports.relativeNode = relativeNode;
