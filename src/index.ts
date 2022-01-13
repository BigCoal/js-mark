import * as Util from "./util/index.js";
import config from "./lib/config.js";
import { mergeOptions } from "./core/mergeOptions.js";

class JsMark {
    private _element: Element;
    private _selection: Nullable<Selection>;
    private _onMouseUp: Nullable<Listener>;
    private _onClick: Nullable<Function>;
    private _onSelected: Nullable<Function>;

    public onSelected: Nullable<Function>;
    public onClick: Nullable<Function>;

    constructor(ops: opsConfig) {
        this._element = ops.el;
        this._selection = window.getSelection();

        if (this._element.nodeType !== 1) {
            throw new Error("请挂载dom节点");
        }
        if (!this._selection) {
            throw new Error("浏览器暂不支持标注，请查看文档支持浏览器版本");
        }


        mergeOptions(config, ops.options)

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
            let selection = that._selection;
            if (selection == null) return;
            that._captureSelection(selection.getRangeAt(0), e);
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
            if (typeof e === "string") {
                throw new Error(e)
            } else {
                this.onSelected && this.onSelected(e);
            }
        };
    }

    private _addEvent() {
        this._element.addEventListener("mouseup", this._onMouseUp as Listener);
    }

    destroyEvent() {
        this._element.removeEventListener("mouseup", this._onMouseUp as Listener);
    }

    /**
     * @intro 渲染存储节点
     * @param obj 
     */
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
                        Util.getRelativeOffset(endParentNode, this._element),
                    startContainer: startParentNode,
                    startOffset:
                        item.offset - Util.getRelativeOffset(startParentNode, this._element),
                    storeRenderOther: item,
                });
            }
        });
    }
    /**
     * @intro 查找词在违章中位置
     * @param word 词语 
     */
    findWord(word: string): Nullable<SelectBase[]> {
        if (!word) return null;
        return Util.relativeOffsetChat(word, this._element)
    }

    //捕获已选中节点
    private _captureSelection(range: Range, e?: MouseEvent): void {
        let selection = this._selection;
        if (selection == null) return;
        if (range.collapsed) {
            //选中起点位置和终点位置相同
            return this._onClick && this._onClick(e);
        }
        let r = {
            startContainer: range.startContainer,
            endContainer: range.endContainer,
            startOffset: range.startOffset,
            endOffset: range.endOffset,
        };

        if (!config.isCover) {
            let hasCover = false;
            
            if (range.cloneContents().querySelector("[data-selector]")) {
                //1.选中范围内存在已经标注的节点
                hasCover = true;
            } else {
                if (range.commonAncestorContainer.parentNode?.nodeType === 1) {
                    const pNode = range.commonAncestorContainer.parentNode as Element
                    if (pNode.getAttribute("data-selector")) {
                        //2.选中范围内在已经标注节点内部
                        hasCover = true;
                    }
                }
            }

            if (hasCover) {
                selection.removeAllRanges();
                return this._onSelected && this._onSelected("不允许覆盖标注，详细请看配置文档，或设置isCover为true");
            }
        }

  
        //TODO bug当选中的不是文本节点时报错，无效果，比如说img
        if (r.startContainer !== r.endContainer) {
            selection.removeAllRanges();
            let endContainer = r.endContainer.splitText(r.endOffset);
            r.endContainer = endContainer.previousSibling as Text;
            r.startContainer = r.startContainer.splitText(r.startOffset);
        } else {
            let endContainer = r.endContainer.splitText(r.endOffset);
            r.startContainer = r.startContainer.splitText(r.startOffset);
            r.endContainer = endContainer.previousSibling as Text;
        }
        let textNodes = Util.getTextNodes(range.commonAncestorContainer);
      
        const offset = Util.getRelativeOffset(r.startContainer, this._element);
        let rangeNodes = Util.sliceTextNodes(textNodes, r.startContainer, r.endContainer);
       
        let hasStoreRender = true;
        if (!range) {
            hasStoreRender = false;
            selection.removeAllRanges();
        }
        console.log(Util.getTextNodes(range.cloneContents()))
        this._onSelected &&
            this._onSelected({
                text: range.toString(),
                offset,
                hasStoreRender,
                textNodes: rangeNodes,
                storeRenderOther: range && range.storeRenderOther ? range.storeRenderOther : {},
            });


        //将 Range 从使用状态中释放，改善性能
        range.detach()
    }


    /**
     * @intro 渲染选中的文本节点
     * @param rangeNode 
     * @returns 
     */
    repaintRange(rangeNode: RangeNodes) {
        let { uuid, className, textNodes } = rangeNode;
        let uid = uuid || Util.Guid()
        console.log("rangeNode",rangeNode)
        textNodes.forEach((node) => {
            if (node.parentNode) {
                let hl = document.createElement("span");
                if (className) {
                    hl.className = className;
                } else {
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
