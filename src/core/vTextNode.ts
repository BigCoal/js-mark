interface vText {
    text: Text, //文本节点
    ignore: boolean,//是否是忽略节点
    offset: number, //相对起始节点的偏移量
}

let vTextNodes: vText[] = [];

/**
 * @intro 设置虚拟文本节点
 * @param textNodes 
 */
export function initVTextNodes(textNodes: textEle[]) {
    let offset = 0;
    vTextNodes = [];
    for (let i = 0; i < textNodes.length; i++) {
        const text = textNodes[i];

        vTextNodes.push({
            text,
            ignore: text.ignore || false,
            offset: text.ignore ? -1 : offset,
        })
        if (!text.ignore)
            offset += text.textContent ? text.textContent.length : 0; //跳过忽略节点
        // console.log(text.textContent)
    }
    console.log(vTextNodes)
}

export function splitVTextNode(text: Text, offset: number): vText | void {
    // debugger
    let i = vTextNodes.findIndex(item => item.text === text)
    if (i !== -1) {
        const newText = vTextNodes[i].text.splitText(offset)
        const newVText = {
            text: newText,
            ignore: vTextNodes[i].ignore,
            offset: vTextNodes[i].offset + (vTextNodes[i].text.textContent?.length || 0)
        }
        vTextNodes.splice(i + 1, 0, newVText)
        return newVText;
    } else {
        console.error("bug，找不到可以splitVTextNode的节点，请联系开发人员")
    }
};

export function sliceVTextNode(startText: vText, endText: vText,hasIgnore=false) {
    const startIndex = vTextNodes.findIndex(item => item.text === startText.text)
    const endIndex = vTextNodes.findIndex(item => item.text === endText.text)
    if (startIndex !== -1 && endIndex !== -1) {
         let  rangeTextNodes = vTextNodes.slice(startIndex, endIndex)
         rangeTextNodes= hasIgnore?rangeTextNodes.filter(item=>!item.ignore):rangeTextNodes;
         return rangeTextNodes.map(item => item.text)
    } else {
        console.error("bug，找不到可以sliceVTextNode的节点，请联系开发人员")
    }
}

export function getTextContainer(offset: number): vText | void {
    let nodes = vTextNodes.filter(item=>!item.ignore)
    let i = nodes.findIndex(item => item.offset >= offset)
    if (i !== -1) {
        i = i == 0 ? 0 : i - 1;
        return nodes[i]
    } else {
        console.error("bug，找不到可以getTextContainer的节点，请联系开发人员")
    }
};

export function getVTextsContent(vTextNode: vText[]) {
    let content = "";
    vTextNode.map(item => content += item.text.textContent)
    return content
}

//获取可选的文本节点
export function getOptionalVText(vTextNode: vText):vText|void{
    let i = vTextNodes.findIndex(item => item === vTextNode)
    if (i !== -1) {
        i = i == 0 ? 0 : i - 1;
        while(i!==0){
            if(!vTextNodes[i].ignore){
                return vTextNodes[i+1]
                break;
            }
            i--
        }
    } else {
        console.error("bug，找不到可以getOptionalVText的节点，请联系开发人员")
    }
}