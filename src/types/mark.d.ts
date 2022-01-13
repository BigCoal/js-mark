interface SelectBase {
    offset: number;  //选中文本相对于根结点的偏移量
    text: string;   //选中的文本
}
interface SelectInfo extends  SelectBase{
    storeRenderOther?:any; //来自jsMark.renderStore方法的用户自定义参数
}
interface Selected extends SelectBase{
    textNodes: Text[]; //选中的所有文本节点
    hasStoreRender: boolean; //是否来自renderStore方法渲染，一般用于从数据库拿到数据运用jsMark.renderStore方法判断首次渲染
    storeRenderOther:any; //来自jsMark.renderStore方法的用户自定义参数
}
interface rangeNode {
    collapsed?: boolean;
    commonAncestorContainer?: Element;
    endContainer: Text;
    endOffset: number;
    startContainer: Text;
    startOffset: number;
    storeRenderOther?: any;
}
interface RangeNodes{
    textNodes: Text[]; //选中的所有文本节点
    uuid?: string; //标注文本节点的唯一id，会绑定到节点身上的data-selector属性，此id可用于清除当前标注节点，可选，不传会自动生成
    className?: string; //需要标注的文本节点样式类,不设置默认标注颜色为 background:rgba(255, 255, 0, 0.3)
}
interface options{
    isCover?:boolean  //是否覆盖
    ignoreClass?:string[] //划词忽略的class
}
interface opsConfig{
    el:Element,         //要挂载的元素节点
    options?:options  //配置
}