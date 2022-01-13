import { NodeTypes } from "../lib/index.js";

export function Guid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * @intro 获取节点下所有的文本节点
 * @param node 节点
 * @returns 所有文本节点
 */
export function getTextNodes(node:Node): Text[] {
  let textNodes = [];
  let e = node.childNodes;
  // console.log("e",e)
  for (let i = 0; i < e.length; i++) {
    let element = e[i];
    if (element.nodeType === NodeTypes.TEXT_NODE) {
      textNodes.push(element as Text);
    } else if(element.nodeType === NodeTypes.ELEMENT_NODE) {
      textNodes.push(...getTextNodes(element));
    }
  }
  return textNodes;
}
/** 获取字符相对于root元素的偏移量*/
export function relativeOffsetChat(content: string, root: Element):SelectInfo[] {
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
      reg.lastIndex = reg.lastIndex - content.length + 1; //匹配覆盖内容
    }
    length += item.length;
    return macArr;
  });
  return hitContent.flat(Infinity) as SelectInfo[];
}
/**
 * @intro 获取节点相对于元素的偏移量
 * @param ele 节点
 * @param root 相对元素
 * @returns 偏移量
 */
export function getRelativeOffset(ele: Node, root: Element): number {
  let textNodes = getTextNodes(root);
  let i = textNodes.indexOf(ele);
  let offset = 0;
  for (let t = 0; t < i; t++) {
    if (textNodes[t] && textNodes[t].nodeValue !== null) {
      offset += (textNodes[t].nodeValue as string).length;
    }
  }
  return offset;
}
// /** 获取root元素下偏移量为offset的父节点*/
export function relativeNode(root: Element, offset: number): null | Text {
  let node = null;
  let relativeOffset = 0;
  let textNodes = getTextNodes(root);
  for (let t = 0; t < textNodes.length; t++) {
    if (textNodes[t] && textNodes[t].nodeValue !== null) {
      relativeOffset += (textNodes[t].nodeValue as string).length;
    }
    if (offset <= relativeOffset) {
      node = textNodes[t];
      break;
    }
  }
  return node as Text;
}
/**
 * @intro 截取文本节点
 * @param textNodes 文本节点组
 * @param startTextNode 截取开始节点
 * @param endTextNode 截取终止节点
 * @returns 截取后节点
 */
export function sliceTextNodes(textNodes: Text[], startTextNode: Text,endTextNode:Text) {
  let startIndex = textNodes.indexOf(startTextNode);
  let endIndex = textNodes.indexOf(endTextNode);
  let rangeText = textNodes.filter((_, i) => {
      return startIndex <= i && endIndex >= i;
  });
  return rangeText;
}