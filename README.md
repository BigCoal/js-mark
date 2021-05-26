<div>
    <h1 align="center"><code>js-mark</code>&nbsp;&nbsp;🖍️️</h1>
    <p align="center">
        <strong>✨ 它提供了一组可交互操作的工具来注释网页内容 ✨🖍️</strong>
    </p>
    <p>
        <span style="background:rgba(0, 0, 255, 0.3);">js-mark是一个JavaScript库，用于在浏览器。他是一个可以在任何网页做标记的前端库,</span>
        <span style="background:rgba(255, 255, 0, 0.3);">它提供了一组可交互操作的工具来注释网页内容。</span>
        <span style="background:rgba(0, 255, 127, 0.3);">支持标记文本和</span>
        <span style="background:rgba(255, 0, 0, 0.3);">持久化存储与还原</span>
    </p>
</div>


## Demo
如果进行简单的演示，可以打开``https://bigcoal.github.io/``运行方可查看演示效果

## 安装
#### 方法一
 ``npm install js-mark``
#### 方法二
使用静态文件,把``dist/js-mark.js``静态文件直接放到项目中

## 文档

### 基本配置

```js
 import JsMark from "js-mark";
 const jsMark = new jsMark(opts:OPTS)
```
创建一个新的jsMark实例,opts 会合并至默认配置 (如下所示).
```js
interface OPTS {
    el:Element，
    options:{
        isCover:boolean
    }
}

```

配置说明：


|参数名 |类型 |描述 |是否必须 |默认值 
|---|---|---|---|---
|el | Document | 标记的根节点元素 | 是 | null
|options | Object | 配置项(详细如下) | 否 | null


``options``配置说明：

|参数名|类型|描述|是否必须|默认值
|---|---|---|---|---
|isCover | Boolean | 标记内容是否可以覆盖 | 否 | true


### 实例方法
##### 1.鼠标选中文本后的回调方法：``jsMark.onSelected``
当``鼠标选中根节点下的文本``或``从后台获取数据使用jsMark.renderStore渲染已标注节点时``会触发此方法，该方法回调返回一个Selected已选中对象

```js

interface Selected {
    textNodes: Text[]; //选中的所有文本节点
    text: string;   //选中的文本
    offset: number; //选中文本相对于根结点的偏移量
    hasStoreRender: boolean; //是否来自renderStore方法渲染，一般用于从数据库拿到数据运用jsMark.renderStore方法判断首次渲染
}

jsMark.onSelected = function (res:Selected) {};

```
##### 2.标注选中文本：``jsMark.repaintRange(nodes:Text[],uid:string,cssClass:string)``

标注已经选中的文本，一般用在``jsMark.onSelected``回调方法内，接受三个参数
```js

//定义
interface RangeNodes{
    textNodes: Text[]; //选中的所有文本节点,onSelected返回值的res.textNodes
    className: string; //需要标注的文本节点样式类
    uuid?: string; //标注文本节点的唯一id，会绑定到节点身上的data-selector属性，此id可用于清除当前标注节点，可选，不传会自动生成
    storeRenderOther?:any; //来自jsMark.renderStore方法的用户自定义参数
}

function repaintRange(opts:RangeNodes):void{...}

//调用示例
jsMark.onSelected = function (res) {
    jsMark.repaintRange({
        textNodes:res.textNodes
    });
};

```

##### 3.点击已经标注文本后的回调方法：``jsMark.onClick``
点击已经标注的内容后，会触发``jsMark.onClick``方法,回掉方法接受一个uid为标签上唯一的一个id，可用于清除单个标注
```js

jsMark.onClick = function (uid:string) {};

```

##### 4.通过数据去标注根节点下的数据：``jsMark.renderStore()``

```js

//定义
interface SelectInfo{
    offset: number;  //选中文本相对于根结点的偏移量
    text: string;   //选中的文本
    storeRenderOther?:any; //用户自定义参数
}

function renderStore(obj: SelectInfo[]): void {...}

//调用
jsMark.renderStore([{text:"测试",offset:20}])

```

##### 5.查找跟节点下的单个词组：``jsMark.findWord``
通过``jsMark.findWord``查找文档中所有的可标注文本位置，返回相对于跟节点的偏移量
```js
//定义
declare type Nullable<T> = T | null;

interface Selected {
    offset: number;  //偏移量
    text: string;   //文本信息
}

function findWord(word:string):Nullable<Selected[]>{...}

//调用
jsMark.findWord("标注文本");

```
##### 6.清除单个标注：``jsMark.clearMark``
清除标签上data-selector属性为唯一uid的标签标注
```js
jsMark.clearMark(uid);
```
##### 7.清除所有标注：``jsMark.clearMarkAll``
```js
jsMark.clearMarkAll();
```

##### 8.清除事件：``jsMark.destroyEvent``
```js
jsMark.destroyEvent();
```


## 兼容性


|IE | Firefox| Chrome| Safari| Opera
|---|---|---|---|---
|10+ | 52+ |15+|5.1+|15+

