# Koa 架构模版

### 项目结构

#### controllers
用于接收数据，调用services得到数据与views绑定, 以及生成api  
`api`特殊配置:  
`api/todo.js`内`todos`方法，默认支持`post`、`get`请求:
  
<table>
  <tr>
    <td>Code</td>
    <td>Request</td>
  </tr>
  <tr>
  <td>
    
    // 与controller同名做特殊处理
    export async function todo() { }
    or 
    export async function index() { }
        
  </td>
  <td>
          
    get: /api/todo
    post: /api/todo
           
  </td>
  </tr>
  <tr>
  <td>
    
    // controller名称复数做特殊处理
    export async function todos() { }
      
  </td>
  <td>
        
    get: /api/todos
    post: /api/todos
          
  </td>
  </tr>
  <tr>
  <td>
    
    test.__method__ = 'post';
    test.__regular__ = '/:id';
    export async function test() { }
  
  </td>
  <td>
    
    post: /api/todos/test
    post: /api/todos/test/:id 
      
  </td>
  </tr>
  <tr>
  <td>
      
    export async function test() { }
    
  </td>
  <td>
      
    get: /api/todos/test
    post: /api/todos/test
        
  </td>
  </tr>
  <tr>
  <td>
    
    test.__router__ = false;
    export async function test() { }
    
  </td>
  <td>
      
    null
        
  </td>
  </tr>
</table>

#### middlewares
一些中间件
##### model
用于遍历给定路径下所有`model`注入到`app.models`中方便使用, 可调用`context.app.models`使用
##### router
处理`controller`自动生成`router`
##### service
用于遍历给定路径下所有`service`注入到`app.services`中方便使用, 可调用`context.app.service`使用

#### models
定义与数据库对应model，使用Mongoose提供dao，自定义Dao也在这里实现

#### services
实现主要业务逻辑，提供数据

#### views
前端视图模版


### Dependencies

```json
"dependencies": {
    "debug": "^2.3.3",
    "glob": "^7.1.1",// 查找文件
    "koa": "^2.0.0",// koa core
    "koa-bodyparser": "^2.3.0", // 用于自动解析request.body
    "koa-compress": "^1.0.9",// 数据压缩
    "koa-conditional-get": "^1.0.3", // koa-etag依赖
    "koa-convert": "^1.2.0",// yield 语法co转换，koa将不支持yield中间件， async/await 调用yield也需要转化下
    "koa-etag": "^2.1.1",// etag缓存支持
    "koa-logger": "^1.3.0",// log请求信息
    "koa-onerror": "^1.3.1",// 输出详细错误
    "koa-router": "^5.4.0",// 路由
    "koa-static": "^2.0.0", // Koa static file serving middleware
    "mongoose": "^4.7.1",// mongoodb orm
    "mongoose-schema-extend": "^0.2.2", // Schema Extend
    "pluralize": "^3.0.0"// 单复数处理
  },
  "devDependencies": {
    "babel-plugin-add-module-exports": "^0.2.1", // export default {} 转码
    "babel-polyfill": "^6.16.0",// 新特性API 转码
    "babel-preset-es2015": "^6.18.0", // es2015 转码规则
    "babel-preset-stage-3": "^6.17.0",// es7 转码规则
    "babel-register": "^6.18.0", // require文件自动转码
    "nodemon": "^1.11.0" // 检测文件是否修改，自动重启server
  }
```