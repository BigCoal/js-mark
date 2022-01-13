export enum NodeTypes {
    ELEMENT_NODE = 1,
    TEXT_NODE = 3
}

export function hasOwn(obj:object,key:string){
    return obj.hasOwnProperty(key)
}