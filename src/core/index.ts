import * as Util from "./util/index.js";
import config from "./lib/config.js";
import { mergeOptions } from "./core/mergeOptions.js";
import { hasOwn } from "./lib/index.js";

const markSelector = "data-selector"
class Mark {
    private _element: Element;
    private _selection: Nullable<Selection>;

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

        this.onSelected = null;
        this.onClick = null;
        this._addEvent();
    }

    private _onClick(e: Event) {
        if (e.target !== null && "dataset" in e.target) {
            let selectorId = (e.target as HTMLTextAreaElement).dataset.selector;
            if (selectorId) {
                this.onClick && this.onClick(selectorId);
            }
        }
    }

    private _onSelected(e: Selected | string) {
        if (typeof e === "string") {
            throw new Error(e)
        } else {
            this.onSelected && this.onSelected(e);
        }
    }

    private _onMouseUp(e: Event) {
        let selection = this._selection;
        if (selection == null) return;
        const range = selection.getRangeAt(0);
        if (range.collapsed) {
            //选中起点位置和终点位置相同,触发点击事件
            return this._onClick && this._onClick(e);
        }
        this._captureSelection(range);
    }

    private _addEvent() {
        this._element.addEventListener("mouseup", this._onMouseUp.bind(this));
    }

    //捕获已选中节点
    private _captureSelection(range: markRange): void {
        let selection = this._selection;
        if (!selection) return;

        if (!config.isCover) {
            let hasCover = false;

            if (range.cloneContents().querySelector(markSelector)) {
                //1.选中范围内存在已经标注的节点
                hasCover = true;
            } else {
                if (range.commonAncestorContainer.parentNode?.nodeType === 1) {
                    const pNode = range.commonAncestorContainer.parentNode as Element
                    if (pNode.getAttribute(markSelector)) {
                        //2.选中范围内在已经标注节点内部
                        hasCover = true;
                    }
                }
            }

            if (hasCover) {
                selection.removeAllRanges();
                return this._onSelected("不允许覆盖标注，详细请看配置文档，或设置isCover为true");
            }
        }

        if (range.startContainer.nodeType !== 3 || range.endContainer.nodeType !== 3) {
            selection.removeAllRanges();
            return this._onSelected("只可选中文本节点");
        }

        let sCntr = range.startContainer as Text;
        let eCntr = range.endContainer as Text;

        if (sCntr !== eCntr) {
            let endContainer = eCntr.splitText(range.endOffset);
            eCntr = endContainer.previousSibling as Text;
            sCntr = sCntr.splitText(range.startOffset);
        } else {
            let endContainer = eCntr.splitText(range.endOffset);
            sCntr = sCntr.splitText(range.startOffset);
            eCntr = endContainer.previousSibling as Text;
        }

        let textNodes = Util.getTextNodes(range.commonAncestorContainer);

        const offset = Util.getRelativeOffset(sCntr, this._element);
        let rangeNodes = Util.sliceTextNodes(textNodes, sCntr, eCntr);

        this._onSelected({
            text: range.toString(),
            offset,
            hasStoreRender: hasOwn(range, "storeRenderOther"),
            textNodes: rangeNodes,
            storeRenderOther: range && range.storeRenderOther ? range.storeRenderOther : {},
        });

        selection.removeAllRanges();
        //将 Range 从使用状态中释放，改善性能
        range.detach && range.detach()
    }

    /**
     * @intro 销毁
     */
    destroy() {
        this._selection = null;
        this._element.removeEventListener("mouseup", this._onMouseUp as Listener);
    }

    /**
     * @intro 渲染存储节点
     * @param obj 
     */
    renderStore(obj: SelectInfo[]): void {
        if (this._selection == null) return;

        obj.map((item) => {
            let startParentNode = Util.relativeNode(this._element, item.offset + 1);
            let endParentNode = Util.relativeNode(
                this._element,
                item.offset + item.text.length
            );
            if (endParentNode && startParentNode) {
                const obj = {
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
                }
                this._captureSelection(obj);
            }
        });
    }
    /**
     * @intro 查找词在文章中位置
     * @param word 词语 
     */
    findWord(word: string): Nullable<SelectBase[]> {
        if (!word) return null;
        return Util.relativeOffsetChat(word, this._element)
    }
    /**
     * @intro 渲染选中的文本节点
     * @param rangeNode 
     * @returns 
     */
    repaintRange(rangeNode: RangeNodes) {
        let { uuid, className, textNodes } = rangeNode;
        let uid = uuid || Util.Guid()
        console.log("rangeNode", rangeNode)
        textNodes.forEach((node) => {
            if (node.parentNode) {
                let hl = document.createElement("span");
                if (className) {
                    hl.className = className;
                } else {
                    hl.style.background = "rgba(255, 255, 0, 0.3)"
                }

                hl.setAttribute(markSelector, uid);
                node.parentNode.replaceChild(hl, node);
                hl.appendChild(node);
            }
        });
        return uuid;
    }
    /**
     * @intro 根据标注的元素上属性data-selector为uuid的标签
     * @param uuid 
     */
    deleteMark(uuid: Number): void {
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
export default JsMark;
