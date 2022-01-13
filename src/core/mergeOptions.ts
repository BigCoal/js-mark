import { hasOwn } from "../lib/index"

/**
 * @intro 合并配置到基础配置
 * @param basicOps 旧的配置
 * @param newOps 新的配置
 * @returns 旧的配置
 */
export function mergeOptions(basicOps:any,newOps:any){
  
    for(let i in basicOps){
        if(hasOwn(newOps,i)){
            basicOps[i] = newOps[i]
        }
    }

    return basicOps
}