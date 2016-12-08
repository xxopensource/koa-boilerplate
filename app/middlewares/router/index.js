import fs from 'fs'
import path from 'path'
import Router from 'koa-router'
import convert from 'koa-convert'
const debug = require('debug')('koa-boilerplate:router');
const pluralize = require('pluralize');

/**
 * [_routerVerb 可以注册的方法]
 * all = ['acl', 'bind', 'checkout', 'connect', 'copy', 'delete', 'get', 'head', 'link', 'lock', 'm-search', 'merge', 'mkactivity', 'mkcalendar', 'mkcol', 'move', 'notify', 'options', 'patch', 'post', 'propfind', 'proppatch', 'purge', 'put', 'rebind', 'report', 'search', 'subscribe', 'trace', 'unbind', 'unlink', 'unlock', 'unsubscribe' ]
 * @all {会注册33个verb, 慎用！！！}
 * delete {作为保留词，推荐使用别称：del}
 */
const _routerVerb = ['get', 'post', 'put', 'patch', 'del', 'head', 'delete', 'all'];

exports = module.exports = function (options) {
    if (typeof options === 'string') {
        options = { root: options }
    } else if (!options || !options.root) {
        throw new Error('`root` config required.');
    }

    const router = Router(options);
    const Domain = options.domain || '';

    let root = options.root;

    if (!fs.existsSync(root)) {
        debug('error : can\'t find root path ' + root);
        return async (ctx,next) => await next();
    }

    _ls(root).forEach(function(filePath) {
        if (!/([a-zA-Z0-9_\-]+)(\.js)$/.test(filePath)) {
            return;
        }

        let exportFuncs = require(filePath);
        let pathRegexp = _formatPath(filePath, root);

        getRoute(exportFuncs, function(exportFun, ctrlpath) {
            _setRoute(router, {
                domain: Domain,
                method: exportFun.__method__,
                regular: exportFun.__regular__,
                routePath: ctrlpath,
                handler: exportFun
            }, options);
        }, [pathRegexp]);
    });

    return async function (ctx, next) {
        await convert(router.routes())(ctx, next);
    };
};

/**
 * 递归生成路由，层级不超过3级
 * @param  {Object|Function}  exportFuncs 获取到的路由
 * @param  {Array}            _routePath    路由记录
 * @return
 */
function getRoute(exportFuncs, cb, _routePath, _curCtrlname) {
    _routePath = _routePath || [];

    // 如果当前设置了不是路由，则直接返回
    if (exportFuncs.__router__ === false) {
        return;
    }

    let totalCtrlname = _curCtrlname ? _routePath.concat([_curCtrlname]) : _routePath;

    // 只允许3级路由层级
    if (_routePath.length > 3) {
        debug(`嵌套路由对象层级不能超过3级：${totalCtrlname.join('/')}`);
        return;
    }

    // 如果是一个方法就直接执行cb
    if (typeof exportFuncs === 'function') {
        cb(exportFuncs, totalCtrlname);
    } else {
        // 否则进行循环递归查询
        for (let ctrlname in exportFuncs) {
            if (!exportFuncs.hasOwnProperty(ctrlname)) {
                continue
            }

            getRoute(exportFuncs[ctrlname], cb, totalCtrlname, ctrlname);
        }
    }
}

/**
 * 设置路由
 * @param {string} path 当前文件路径
 * @param {object} config  配置项
 *        {string} config.method 当前请求方法：get,post等
 *        {string} config.regular 参考：https://github.com/alexmingoia/koa-router#nested-routers
 *        {funtion} config.handler controller方法
 *        {string} config.routePath 路由记录
 * @param {Obejct} options router配置
 */
function _setRoute(router, config, options) {
    let paths = [];
    let method = (_routerVerb.indexOf(config.method) > -1) ? [config.method] : ['get', 'post'];
    let path = config.routePath.join('/');

    // 处理复数or同名orIndex /abc/abcs => /abcs, /abc/abc => /abc, /abc/index => /abc
    path = path.split('/').reduce(function (result, value) {
        let arr = result.split('/');
        let last = arr.pop();
        if (value === 'index') {
            return result;
        }
        if (last === pluralize(value, 1)) {
            arr.push(value);
            return arr.join('/');
        }
        return result + '/' + value;
    }, '');

    // 加入当前路由
    paths.push(path);

    // 如果有regular则加入regular路由
    if (config.regular) {
        paths.push(path + config.regular);
    }

    // 对每一个method，有定义时唯一，默认post/get
    method.forEach((_method) => {
        // 注入路由
        paths.forEach((pathItem) => {
            debug(_method + ':' + config.domain + pathItem);

            router[_method](pathItem, config.handler);
        });
    });

}

/**
 * 查找目录中的所有文件
 * @param  {string} dir       查找路径
 * @param  {init}   _pending  递归参数，忽略
 * @param  {array}  _result   递归参数，忽略
 * @return {array}            文件list
 */
function _ls(dir, _pending, _result) {
    _pending = _pending ? _pending++ : 1;
    _result = _result || [];

    if (!path.isAbsolute(dir)) {
        dir = path.join(process.cwd(), dir);
    }

    // if error, throw it
    let stat = fs.lstatSync(dir);

    if (stat.isDirectory()) {
        let files = fs.readdirSync(dir);
        files.forEach(function(part) {
            _ls(path.join(dir, part), _pending, _result);
        });
        if (--_pending === 0) {
            return _result;
        }
    } else {
        _result.push(dir);
        if (--_pending === 0) {
            return _result;
        }
    }
}

/**
 * 格式化文件路径为koa-router的path
 * @param  {string} filePath 文件路径
 * @param  {string} root     router路径
 * @return {string}          过滤之后的path
 */
function _formatPath(filePath, root) {
    let dir = root;

    if (!path.isAbsolute(root)) {
        dir = path.join(process.cwd(), root);
    }

    // 修复windows下的\路径问题
    dir = dir.replace(/\\/g, '/');

    return filePath
        .replace(/\\/g, '/')
        .replace(dir, '')
        .split('.')[0];
}