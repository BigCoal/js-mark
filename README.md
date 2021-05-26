
# js-mark


<div>
<span style="background:rgba(0, 0, 255, 0.3);">js-mark是一个JavaScript库，用于在浏览器。他是一个可以在任何网页做标记的前端库,</span>
<span style="background:rgba(255, 255, 0, 0.3);">它提供了一组可交互操作的工具来注释网页内容。</span><span style="background:rgba(0, 255, 127, 0.3);">支持标记文本和</span><span style="background:rgba(255, 0, 0, 0.3);">持久化存储与还原</span>
</div>

---


## Demo
如果进行简单的演示，可以打开``example/demo.html``运行方可查看演示效果

## 安装
#### 方法一
 ``npm install js-mark``
#### 方法二
使用静态文件,把``dist/js-mark.js``静态文件直接放到项目中

## 文档

### 基本配置

```
 import JsMark from "js-mark";
 const jsMark = new jsMark(${opts})
```
创建一个新的jsMark实例,opts 会合并至默认配置 (如下所示).
```
{
    el:${dom}，
    options:{
        isCover:false
    }
}
```

配置说明：

| 参数名|类型|描述|是否必须|默认值
|--|--|--|--|--|--
|el | Document | 标记的根节点元素 | 是 | null
|options | Object | 配置项(详细如下) | 否 | null

``options``配置说明：

|参数名|类型|描述|是否必须|默认值
|--|--|--|--|--|--
|isCover | Boolean | 标记内容是否可以覆盖 | 否 | true


### 实例方法
##### 1.鼠标选中文本后的回调方法：``jsMark.onSelected(Selected)``
当鼠标选中根节点下的文本时会触发此方法，该方法回调返回一个Selected已选中对象
```
interface Selected {
    nodes: Element[]; //
    text: string;
    offset: number;
    firstRender: boolean;
}
```
##### 1.标注选中文本：``jsMark.repaintRange()``

##### 2.点击已经标注文本后的回调方法：``jsMark.onClick()``
##### 3.通过数据去标注根节点下的数据：``jsMark.renderStore()``
##### 4.查找跟节点下的单个词组：``jsMark.findWord()``
##### 5.查找跟节点下的多个词组：``jsMark.findWordArr()``
##### 6.清除单个标注：``jsMark.clearMark()``
##### 7.清除所有标注：``jsMark.clearMarkAll()``

## 兼容性


|IE | Firefox| Chrome| Safari| Opera
|---|---|---|---|---
|10+ | 52+ |15+|5.1+|15+

