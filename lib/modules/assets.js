const fs = require('fs');
const path = require('path');
const Root = require('../_root');

const config = {
    inited: false,
    root: __dirname,
}

function _mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (_mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

function getAssetsDirName() {
    return 'assets'
}

function getAssetsDir(resolve = false) {
    if (resolve) {
        return path.resolve(path.join(Root.getRoot(), getAssetsDirName()))
    } else {
        return path.join(Root.getRoot(), getAssetsDirName());
    }
}

function getAssetsTmpDirName() {
    return 'tmp'
}

function getAssetsTmpDir(resolve = false) {
    let dir = path.join(getAssetsDir(resolve), getAssetsTmpDirName());
    if (!fs.existsSync(dir)) {
        _mkdirsSync(dir);
    }
    return dir;
}

function getAssetsUploadDirName() {
    return 'upload'
}

function getAssetsUploadDir(resolve = false) {
    let dir = path.join(getAssetsDir(resolve), getAssetsUploadDirName());
    if (!fs.existsSync(dir)) {
        _mkdirsSync(dir);
    }
    return dir;
}

module.exports = {
    getAssetsDir,
    getAssetsDirName,
    getAssetsTmpDir,
    getAssetsTmpDirName,
    getAssetsUploadDir,
    getAssetsUploadDirName,
}
