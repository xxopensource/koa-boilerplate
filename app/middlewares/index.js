import fs from 'fs'
const curPath = __dirname;

fs.readdirSync(curPath).forEach((item) => {
    let filePath = `${curPath}/${item}/index.js`;
    if (fs.existsSync(filePath)) {

        if(item.indexOf('-') != -1) { // xx-xx => xxXx
            let strArry = item.split('-');
            item = strArry[0]+strArry[1].charAt(0).toUpperCase()+strArry[1].substring(1);
        }

        exports[item] = require(filePath)
    }
});
