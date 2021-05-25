interface SelectInfo {
    offset: number;  //偏移量
    text: string;   //文本信息
    uuid?: string;  //唯一id
}

interface rangeNode {
    collapsed?: boolean;
    commonAncestorContainer?: Element;
    endContainer: Text;
    endOffset: number;
    startContainer: Text;
    startOffset: number;
    other?: object;
}

interface Selected {
    nodes: Element[];
    text: string;
    offset: number;
    firstRender: boolean;
}

interface options{
    isCover?:boolean  //是否覆盖
}

interface opsConfig{
    el:Element,         //要挂载的元素节点
    options?:options  //配置
}