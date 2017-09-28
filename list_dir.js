const fs = require("fs"),
    path = require("path");

function listDir(currentDirPath, callback) {
    try {
        var files = fs.readdirSync(currentDirPath);
        var returnList = [];
        files.forEach(function (name) {
            var filePath = path.join(currentDirPath, name);
            var stat = fs.statSync(filePath);
            if (stat.isFile()) {
                returnList.push({type: "file", name: name, size: 4096});
            } else if (stat.isDirectory()) {
                returnList.push({type: "folder", name: name, size: 0});
            }
        });
        callback(null, returnList);
    } catch (e) {
        callback(e, []);
    }

};
module.exports = listDir;