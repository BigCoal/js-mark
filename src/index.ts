import * as Util from "./util/index.js";
import config from "./lib/config.js";
import { mergeOptions } from "./core/mergeOptions.js";
import { hasOwn } from "./lib/index.js";

const markSelector = "data-selector"
class JsMark {
    private _element: Element;
    private _selection: Nullable<Selection>;
    public onSelected: Nullable<Function> = null;
    public onClick: Nullable<Function> = null;

    constructor(ops: opsConfig) {
        const ele = this._element = ops.el;
        this._selection = window.getSelection();

        if (ele.nodeType !== 1) {
            this._onError("请挂载dom节点");
        }
        if (!this._selection) {
            this._onError("浏览器暂不支持标注，请查看文档支持浏览器版本");
        }

        mergeOptions(config, ops.options)

        if (config.ignoreClass.length > 0) {
            Util.setEleNoSelect(this._element, config.ignoreClass)
        }

        ele.addEventListener("mouseup", this._onMouseUp.bind(this));
    }

    private _onClick(e: Event) {
        if (e.target !== null && "dataset" in e.target) {
            let selectorId = (e.target as HTMLTextAreaElement).dataset.selector;
            if (selectorId) {
                this.onClick && this.onClick(selectorId);
            }
        }
    }

    private _onError(e: string) {
        throw new Error(e)
    }

    private _onSelected(e: Selected | string) {
        this.onSelected && this.onSelected(e);
    }

    private _onMouseUp(e: Event) {
        let selection = this._selection;
        if (selection == null) return;
        if (selection.isCollapsed) {
            //选中起点位置和终点位置相同,触发点击事件
            return this._onClick && this._onClick(e);
        }
        const range = selection.getRangeAt(0);
        this._captureSelection(range);
    }
    //清除text节点中在userSelect为none的test节点
    private _clearUserSelectText(rangeNodes: textEle[]) {
        //解决从左侧划区，终点在userSelect:none区域时，会选中userSelect:none的问题
        let textNodes: textEle[] = []
        for (let i = 0; i < rangeNodes.length; i++) {
            const item = rangeNodes[i];
            if (item.ignore == true) {
                textNodes.push(item)
            }
        }
        return textNodes
    }
    //捕获已选中节点
    private _captureSelection(range: markRange): void {
        let selection = this._selection;
        if (!selection) return;

        if (range.startContainer.nodeType !== 3 || range.endContainer.nodeType !== 3) {
            selection.removeAllRanges();
            return this._onError("只可选中文本节点");
        }

        if (!config.isCover &&!range.storeRenderOther&& this.hasCoverSelector(range, markSelector)) {
            selection.removeAllRanges();
            return this._onError("不允许覆盖标注，详细请看配置文档，或设置isCover为true");
        }



        let sCntr = range.startContainer as textEle;
        let eCntr = range.endContainer as textEle;

        if (sCntr !== eCntr) {
            let endContainer = eCntr.splitText(range.endOffset);
            eCntr = endContainer.previousSibling as textEle;
            sCntr = sCntr.splitText(range.startOffset);
        } else {
            let endContainer = eCntr.splitText(range.endOffset);
            sCntr = sCntr.splitText(range.startOffset);
            eCntr = endContainer.previousSibling as textEle;
        }


        const commonTextNodes = Util.getTextNodes(range.commonAncestorContainer, config.ignoreClass);
        let rangeNodes = Util.sliceTextNodes(commonTextNodes, sCntr, eCntr);
        let textNodes: textEle[] = config.ignoreClass.length > 0 ? this._clearUserSelectText(rangeNodes) : rangeNodes


        const offset = Util.getRelativeOffset(sCntr, this._element);

        this._onSelected({
            text: range.toString(),
            offset,
            hasStoreRender: hasOwn(range, "storeRenderOther"),
            textNodes,
            storeRenderOther: range && range.storeRenderOther ? range.storeRenderOther : {},
        });

        selection.removeAllRanges();
        //将 Range 从使用状态中释放，改善性能
        range.detach && range.detach()
    }

    /**
     * @intro 选中文档片段是否覆盖拥有属性名的元素
     * @param range  选中文档片段
     * @param attrName  属性名
     * @returns 
     */
    private hasCoverSelector(range: Range, attrName: string): boolean {
        let hasCover = false;
        if (range.cloneContents().querySelector(`[${attrName}]`)) {
            //1.选中范围内存在已经标注的节点
            hasCover = true;
        } else {
            if (range.commonAncestorContainer.parentNode?.nodeType === 1) {
                const pNode = range.commonAncestorContainer.parentNode as Element
                if (pNode.getAttribute(attrName)) {
                    //2.选中范围内在已经标注节点内部
                    hasCover = true;
                }
            }
        }
        return hasCover
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
        return uid;
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
