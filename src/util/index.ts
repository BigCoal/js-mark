

import { NodeTypes } from "../lib/index.js"

export function Guid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
    function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}
/** 获取所有的文本节点*/
export function getTextNodes(ele: Element | Node): ChildNode[] {
  let nodes = []
  let e = ele.childNodes;
  for (let i = 0; i < e.length; i++) {
    let element = e[i]
    if (element.nodeType !== NodeTypes.TEXT_NODE) {
      nodes.push(...getTextNodes(element))
    } else {
      nodes.push(element)
    }
  }
  return nodes
}
/** 获取ele元素相对于root元素的偏移量*/
export function relativeOffset(ele: Text, root: Element): number {
  let textNodes = getTextNodes(root)
  let i = textNodes.indexOf(ele);
  let offset = 0;
  for (let t = 0; t < i; t++) {
    if (textNodes[t] && textNodes[t].nodeValue !== null) {
      offset += (textNodes[t].nodeValue as string).length
    }
  }
  return offset
}
// /** 获取root元素下偏移量为offset的父节点*/
export function relativeNode(root: Element, offset: number): (null | Text) {
  let node = null;
  let relativeOffset = 0;
  let textNodes = getTextNodes(root)
  for (let t = 0; t < textNodes.length; t++) {
    if (textNodes[t] && textNodes[t].nodeValue !== null) {
      relativeOffset += (textNodes[t].nodeValue as string).length
    }
    if (offset <= relativeOffset) {
      node = textNodes[t];
      break;
    }
  }
  return node as Text
}
