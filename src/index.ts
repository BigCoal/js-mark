import * as Util from "./util/index.js";
import config from "./lib/config.js";

class JsMark {
    private _element: Element;
    private _selection: Nullable<Selection>;
    private _onMouseUp:Nullable<Listener>;
    private _onClick: Nullable<Function>;
    private _onSelected:Nullable<Function>;

    public onSelected: Nullable<Function>;
    public onClick: Nullable<Function>;

    constructor(ops: opsConfig) {
        this._element = ops.el;
        this._selection = window.getSelection();

        if(this._element.nodeType!==1){
             throw new Error("请挂载dom节点");
        }
        if(!this._selection){
            throw new Error("浏览器暂不支持标注，请查看文档支持浏览器版本");
        }
      
        config.isCover =  ops?.options?.isCover ?? config.isCover
        
        this._onMouseUp = null;
        this._onClick = null;
        this._onSelected = null;
        this.onSelected = null;
        this.onClick = null;

        this._initEvent();
        this._addEvent();
    }
     
    private _initEvent() {
        let that = this;

        that._onMouseUp = function (e: MouseEvent) {
            that._captureSelection(undefined, e);
        };

        that._onClick = function (e: MouseEvent) {
            if (e.target !== null && "dataset" in e.target) {
                let selectorId = (e.target as HTMLTextAreaElement).dataset.selector;
                if (selectorId) {
                    that.onClick && that.onClick(selectorId);
                }
            }
        };

        that._onSelected = function (e: Selected | string) {
                if(typeof e === "string"){
                    throw new Error(e)
                }else{
                    this.onSelected &&this.onSelected(e);
                }
        };
    }

    private _addEvent() {
        this._element.addEventListener("mouseup", this._onMouseUp as Listener);
    }

    destroyEvent() {
        this._element.removeEventListener("mouseup", this._onMouseUp as Listener);
    }

    renderStore(obj: SelectInfo[]): void {
        obj.map((item) => {
            let startParentNode = Util.relativeNode(this._element, item.offset + 1);
            let endParentNode = Util.relativeNode(
                this._element,
                item.offset + item.text.length
            );
            if (endParentNode && startParentNode) {
                this._captureSelection({
                    collapsed: false,
                    commonAncestorContainer: this._element,
                    endContainer: endParentNode,
                    endOffset:
                        item.offset +
                        item.text.length -
                        Util.relativeOffset(endParentNode, this._element),
                    startContainer: startParentNode,
                    startOffset:
                        item.offset - Util.relativeOffset(startParentNode, this._element),
                    storeRenderOther: item,
                });
            }
        });
    }

    findWord(word:string):Nullable<SelectBase[]>{
        if(!word) return null;
        return Util.relativeOffsetChat(word, this._element)
    }

    //捕获已选中节点
    private _captureSelection(rangeNode?: rangeNode, e?: MouseEvent): void {
        let selection = this._selection;
        if (selection == null) return;
        let range = rangeNode || selection.getRangeAt(0);
        if (range.collapsed) {
            this._onClick && this._onClick(e);
            return;
        }
        let r = {
            startContainer: range.startContainer as Text,
            endContainer: range.endContainer as Text,
            startOffset: range.startOffset,
            endOffset: range.endOffset,
        };

        if (
            !config.isCover &&
                ((r.startContainer.parentNode as HTMLTextAreaElement).dataset
                    .selector ||
            (r.endContainer.parentNode as HTMLTextAreaElement).dataset.selector)
        ) {
            selection.removeAllRanges();
            return this._onSelected && this._onSelected("不允许覆盖标注，详细请看配置文档，或设置isCover为true");
        }

        if (r.startContainer !== r.endContainer) {
            selection.removeAllRanges();
            let endContainer = r.endContainer.splitText(r.endOffset);
            r.endContainer = endContainer.previousSibling as Text;
            r.startContainer = r.startContainer.splitText(r.startOffset);
        }  else {
            let endContainer = r.endContainer.splitText(r.endOffset);
            r.startContainer = r.startContainer.splitText(r.startOffset);
            r.endContainer = endContainer.previousSibling as Text;
        }
        let textNodes = Util.getTextNodes(range.commonAncestorContainer as Element);
        const offset = Util.relativeOffset(r.startContainer, this._element);
        let rangeNodes = this.getSelectTextNode(textNodes, r);
        let text = "";
        for (let i = 0; i < rangeNodes.length; i++) {
            const e = rangeNodes[i];
            text += e.nodeValue;
        }
        let hasStoreRender = true;
        if (!rangeNode) {
            hasStoreRender = false;
            selection.removeAllRanges();
        }
        this._onSelected &&
            this._onSelected({
                text,
                offset,
                hasStoreRender,
                textNodes: rangeNodes,
                storeRenderOther: rangeNode && rangeNode.storeRenderOther ? rangeNode.storeRenderOther : {},
            });
    }

    getSelectTextNode(textNodes: ChildNode[], range: rangeNode) {
        let startIndex = textNodes.indexOf(range.startContainer);
        let endIndex = textNodes.indexOf(range.endContainer);
        let rangeText = textNodes.filter((item, i) => {
            return startIndex <= i && endIndex >= i;
        });
        return rangeText;
    }

    repaintRange(rangeNode:RangeNodes) {

        let {uuid,className,textNodes} = rangeNode;
        let uid = uuid || Util.Guid()
        textNodes.forEach((node) => {
            if (node.parentNode) {
                let hl = document.createElement("span");
                if(className){
                    hl.className = className;
                }else{
                    hl.style.background = "rgba(255, 255, 0, 0.3)"
                }
               
                hl.setAttribute("data-selector", uid);
                node.parentNode.replaceChild(hl, node);
                hl.appendChild(node);
            }
        });
        return uuid;
    }
    
    clearMark(uuid: Number): void {
        let eleArr = document.querySelectorAll(`span[data-selector="${uuid}"]`);
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
export default JsMark;
