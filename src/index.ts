
import * as Util from "./util.js"
interface SelectInfo {
    offset: number,
    text: string,
    uuid?: string
}
interface rangeNode {
    "collapsed"?: boolean,
    "commonAncestorContainer"?: Element,
    "endContainer": Text,
    "endOffset": number,
    "startContainer": Text,
    "startOffset": number
}
interface Selected {
    nodes: Element[],
    text: string,
    offset: number,
    firstRender: boolean
}
// import $ from "jquery";
class textSelector {
    public element: Element;
    public selection: Selection | null;
    public _mouseUp: Function | null;
    public _click: Function | null;
    public _selected: Function | null;
    public onSelected: Function | null;
    public onClick: Function | null;


    constructor(element: Element) {
        this.element = element;
        this.selection = window.getSelection();
        this._mouseUp = null;
        this._click = null;
        this._selected = null;
        this.onSelected = null;
        this.onClick = null;
        this._initEvent();
    }
    _initEvent() {
        let that = this;
        this._mouseUp = function () {
            that.captureSelection()
        }
        this._click = function (e: MouseEvent) {
            if (e.target !== null && "dataset" in e.target) {
                let selector = (e.target as HTMLTextAreaElement).dataset.selector
                if (selector) {
                    let doms = document.querySelectorAll(`span[data-selector="${selector}"]`)
                    that.onClick && that.onClick(doms)
                }
            }

        }
        this._selected = function (e: Selected | string) {
            this.onSelected && this.onSelected({
                code: typeof (e) === "string" ? -1 : 1,
                data: e
            })
        }
        this.addEvent();
    }
    addEvent() {
        let that = this;
        this.element.addEventListener("mouseup", function (e) {
            that._mouseUp && that._mouseUp(e)
        })
        this.element.addEventListener("click", function (e) {
            that._click && that._click(e)
        })
    }
    destroyEvent() {
        let that = this;
        this.element.removeEventListener("mouseup", function (e) {
            that._mouseUp && that._mouseUp(e)
        })
        this.element.removeEventListener("click", function (e) {
            that._click && that._click(e)
        })
    }
    fromStore(obj: SelectInfo[]): void {
        obj.map((item) => {
            let startParentNode = Util.relativeNode(this.element, item.offset);
            let endParentNode = Util.relativeNode(this.element, item.offset + item.text.length);
            if (endParentNode && startParentNode) {
                this.captureSelection({
                    "collapsed": false,
                    "commonAncestorContainer": this.element,
                    "endContainer": endParentNode,
                    "endOffset": item.offset + item.text.length - Util.relativeOffset(endParentNode, this.element),
                    "startContainer": startParentNode,
                    "startOffset": item.offset - Util.relativeOffset(startParentNode, this.element),
                })
            }
        })
    }
    captureSelection(rangeNode?: rangeNode): void {
        let selection = this.selection;
        if (selection == null) return;
        let range = rangeNode || selection.getRangeAt(0);
        console.log(range);

        if (range.collapsed) return;
        let r = {
            startContainer: range.startContainer as Text,
            endContainer: range.endContainer as Text,
            startOffset: range.startOffset,
            endOffset: range.endOffset,
        }
        if (r.startContainer !== r.endContainer) {
            let endContainer = r.endContainer.splitText(r.endOffset)
            r.endContainer = endContainer.previousSibling as Text
            r.startContainer = r.startContainer.splitText(r.startOffset)
        } else {
            let endContainer = r.endContainer.splitText(r.endOffset)
            r.startContainer = r.startContainer.splitText(r.startOffset)
            r.endContainer = endContainer.previousSibling as Text
        }
        let textNodes = Util.getTextNodes(range.commonAncestorContainer as Element)
        const offset = Util.relativeOffset(r.startContainer, this.element);
        let rangeNodes = this.getSelectTextNode(textNodes, r)
        let text = ""
        for (let i = 0; i < rangeNodes.length; i++) {
            const e = rangeNodes[i];
            text += e.nodeValue;
        }
        let firstRender = true
        if (!rangeNode) {
            firstRender = false
            selection.removeAllRanges();
        }
        this._selected && this._selected({
            nodes: rangeNodes,
            text,
            offset,
            firstRender
        })
    }
    getSelectTextNode(textNodes: ChildNode[], range: rangeNode) {
        let startIndex = textNodes.indexOf(range.startContainer)
        let endIndex = textNodes.indexOf(range.endContainer )
        let rangeText = textNodes.filter((item, i) => {
            return startIndex <= i && endIndex >= i
        })
        return rangeText
    }
    repaintRange(eleArr: Element[], cssClass: string) {
        let uuid = Util.Guid();
        eleArr.forEach(node => {
            if (node.parentNode) {
                let hl = document.createElement("span");
                hl.className = cssClass;
                hl.setAttribute("data-selector", uuid)
                node.parentNode.replaceChild(hl, node);
                hl.appendChild(node);
            }
        })
        return uuid
    }
    clearRange(eleArr: Element[]): void {
        eleArr.forEach(node => {
            if (node.parentNode) {
                const fragment = document.createDocumentFragment()
                let childNodes = node.childNodes;
                for (let i = 0; i < childNodes.length; i++) {
                    const node = childNodes[i];
                    fragment.appendChild(node.cloneNode(true));
                }
                node.parentNode.replaceChild(fragment, node);
            }

        })
    }
}
let a = 123;
export default textSelector