var NodeTypes;
(function (NodeTypes) {
    NodeTypes[NodeTypes["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
    NodeTypes[NodeTypes["TEXT_NODE"] = 3] = "TEXT_NODE";
})(NodeTypes || (NodeTypes = {}));
export function Guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
export function getTextNodes(ele) {
    var nodes = [];
    var e = ele.childNodes;
    for (var i = 0; i < e.length; i++) {
        var element = e[i];
        if (element.nodeType !== NodeTypes.TEXT_NODE) {
            nodes.push.apply(nodes, getTextNodes(element));
        }
        else {
            nodes.push(element);
        }
    }
    return nodes;
}
export function relativeOffset(ele, root) {
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
export function relativeNode(root, offset) {
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
