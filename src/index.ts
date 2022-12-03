import * as Util from "./util/index.js";
import config from "./lib/config.js";
import { mergeOptions } from "./core/mergeOptions.js";
import { hasOwn } from "./lib/index.js";

import jsBeautify from 'js-beautify'
import { getOptionalVText, getTextContainer, initVTextNodes, matchVText, sliceVTextNode, splitVTextNode } from "./core/vTextNode.js";

const markSelector = "data-selector"
const beautify = jsBeautify.html_beautify;
let markContainer:HTMLElement;
class JsMark {
    private _element: Element;
    private _selection: Nullable<Selection>;
    public onSelected: Nullable<Function> = null;
    public onClick: Nullable<Function> = null;

    constructor(ops: opsConfig) {

        const ele =markContainer= this._element = ops.el;
        this._selection = window.getSelection();

        if (ele.nodeType !== 1) {
            this._onError("请挂载dom节点");
        }
        if (!this._selection) {
            this._onError("浏览器暂不支持标注，请查看文档支持浏览器版本");
        }

        mergeOptions(config, ops.options)

        if (config.beautify) {
            this._beautifyHTML(ele)
        }

        if (config.ignoreClass.length > 0) {
            this._setEleNoSelect(this._element, config.ignoreClass)
        }

        initVTextNodes(Util.getTextNodes(ele, config.ignoreClass))
        ele.addEventListener("mouseup", this._onMouseUp.bind(this));
    }

    //格式化html代码，去除空行
    private _beautifyHTML(ele: Element) {
        ele.innerHTML = beautify(ele.innerHTML, {
            "preserve_newlines": false, //保留空行
        })
        
    }
    //设置元素无法选中属性
    private _setEleNoSelect(ele:Element,classNames:string[]){
        classNames.map(item=>{
          const hitEle = ele.querySelectorAll(`.${item}`)
          if(!hitEle) return;
          for (let i = 0; i < hitEle.length; i++) {
            const element = hitEle[i] as HTMLElement;
            element.style.userSelect='none'
          }
        })
      }

    private _onClick(e: Event) {
        if (e.target !== null && "dataset" in e.target) {
            let selectorId = (e.target as HTMLTextAreaElement).dataset.selector;
            if (selectorId) {
                let eleArr = document.querySelectorAll(`span[${markSelector}="${selectorId}"]`);
             
                const {top:offsetTop,left:offsetLeft} =  Util.getOffset(eleArr[0] as HTMLElement,markContainer)
                
                this.onClick && this.onClick({uid:selectorId,offsetTop,offsetLeft});
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
    //捕获已选中节点
    private _captureSelection(range: markRange): void {
        let selection = this._selection;
        if (!selection) return;

        if (range.startContainer.nodeType !== 3 || range.endContainer.nodeType !== 3) {
            selection.removeAllRanges();
            return this._onError("只可选中文本节点");
        }


        if (!config.isCover && !range.storeRenderOther && this.hasCoverSelector(range, markSelector)) {
            selection.removeAllRanges();
            return this._onError("不允许覆盖标注，详细请看配置文档，或设置isCover为true");
        }


        const sCntr = range.startContainer as textEle;
        const eCntr = range.endContainer as textEle;
        let endTextNext = splitVTextNode(eCntr, range.endOffset)
        const startText = splitVTextNode(sCntr, range.startOffset)

        

        if (!startText || !endTextNext) return;

        if (config.ignoreClass.length > 0) {
            endTextNext = getOptionalVText(endTextNext)
        }

        if (!endTextNext) return;

        const textNodes = sliceVTextNode(startText, endTextNext,config.ignoreClass.length > 0) || []
        const offset = startText.offset;

        let text = ""
        textNodes?.map(item => text += item.textContent)

        this._onSelected({
            text,
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
            const end = item.offset + item.text.length;
            let startContainer = getTextContainer(item.offset);

            let endContainer = getTextContainer(end);

            if (startContainer && endContainer) {
                const endOffset = end - endContainer.offset
                const startOffset = item.offset - startContainer.offset

                const obj = {
                    collapsed: false,
                    commonAncestorContainer: this._element,
                    endContainer: endContainer.text,
                    endOffset,
                    startContainer: startContainer.text,
                    startOffset,
                    storeRenderOther: item,
                }
                this._captureSelection(obj as any);
            }

        });
    }
    /**
     * @intro 查找词在文章中位置
     * @param word 词语 
     */
    findWord(word: string) {
        this.beautifyHTML()
        if (!word) return null;
        
        return matchVText(word)
    }
    /**
     * @intro 渲染选中的文本节点
     * @param rangeNode 
     * @returns 
     */
    repaintRange(rangeNode: RangeNodes) {
        let { uuid, className, textNodes } = rangeNode;
        
        let uid = uuid || Util.Guid()
        let offsetTop:null|number=null;
        let offsetLeft:null|number=null;
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
                if(offsetTop==null){
                    const offset =  Util.getOffset(hl,markContainer)
                    offsetTop = offset.top;
                    offsetLeft = offset.left;
                }
            }
        });
        return {uid,offsetTop,offsetLeft};
    }

   
    /**
     * @intro 根据标注的元素上属性data-selector为uuid的标签
     * @param uuid 
     */
    deleteMark(uuid: Number): void {
        let eleArr = document.querySelectorAll(`span[${markSelector}="${uuid}"]`);
        this._removeMark(eleArr)
    }

    replaceMarkClass(uuid:number,className:string){
        let eleArr = document.querySelectorAll(`span[${markSelector}="${uuid}"]`);
        eleArr.forEach((node) => {
           
            node.className = className
        });
    }

    private _removeMark(eleS:NodeListOf<Element>){
        eleS.forEach((node) => {
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
        //由于索引改变，需要重新初始化虚拟节点，
        initVTextNodes(Util.getTextNodes(this._element, config.ignoreClass))
    }
    //漂亮代码
    beautifyHTML(){
        this._beautifyHTML(this._element)
        initVTextNodes(Util.getTextNodes(this._element, config.ignoreClass))
    }
}
export default JsMark;
