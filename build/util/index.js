import { NodeTypes } from "../lib/index.js";
export function Guid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
export function getTextNodes(ele) {
    let nodes = [];
    let e = ele.childNodes;
    for (let i = 0; i < e.length; i++) {
        let element = e[i];
        if (element.nodeType !== NodeTypes.TEXT_NODE) {
            nodes.push(...getTextNodes(element));
        }
        else {
            nodes.push(element);
        }
    }
    return nodes;
}
export function relativeOffsetChat(content, root) {
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
export function relativeOffset(ele, root) {
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
export function relativeNode(root, offset) {
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
