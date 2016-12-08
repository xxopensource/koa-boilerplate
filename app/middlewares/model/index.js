import fs from 'fs'
import path from 'path'
const debug = require('debug')('koa-boilerplate:model');

exports = module.exports = function (app, options) {
    if (typeof options === 'string') {
        options = { root: options }
    } else if (!options || !options.root) {
        throw new Error('`root` config required.');
    }

    let root = options.root;

    if (!fs.existsSync(root)) {
        debug('error : can\'t find model path ' + root);
        return async (ctx,next) => await next();
    }

    let models = {};
    _ls(root).forEach((filePath) => {
        if (!/([a-zA-Z0-9_\-]+)(\.js)$/.test(filePath)) {
            return;
        }

        const model = require(filePath);
        models[model.modelName] = model;
        debug(model.modelName);
    });

    app.models = models;

    return async (ctx,next) => await next();
};

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