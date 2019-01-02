const fs = require('fs');
const path = require('path');
const writingKeys = new Set();

const _config = {
    root: __dirname
}

const _mkdir = (dirPath) => {
    return new Promise((resolve, reject) => {
        fs.mkdir(dirPath, (err) => {
            if (err) {
                if (err.code == 'EEXIST') {
                    resolve();
                }
                reject(err);
            }
            resolve();
        });
    });
}

const _isPathExists = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

const _ensureDirExists = (dirPath) => {
    return _isPathExists(dirPath).catch(() => {
        const parent = path.dirname(dirPath);
        return _ensureDirExists(parent).then(() => {
            return _mkdir(dirPath);
        });
    })
}

function _keyToFilePath(key) {
    const items = key.split(':');
    return path.join(_config.root, '.storage', items.join('/'));
}

function config(conf) {
    Object.assign(_config, conf)
}

function has(key) {
    const filePath = _keyToFilePath(key);
    return fs.existsSync(filePath);
}

function set(key, value) {
    const filePath = _keyToFilePath(key);
    const resolveFilePath = path.resolve(filePath);
    const parentFolder = path.dirname(resolveFilePath);
    return _ensureDirExists(parentFolder).then(() => {
        if (writingKeys.has(key)) {
            return Promise.reject(new Error('key is being writing'));
        }
        writingKeys.add(key);
        return new Promise((resolve, reject) => {
            fs.writeFile(resolveFilePath, value, (err) => {
                writingKeys.delete(key);
                if (err) {
                    reject(err);
                }
                resolve({ filePath: resolveFilePath, fileName: key });
            });
        });
    })
}

function get(key) {
    const filePath = _keyToFilePath(key);
    return new Promise((resolve, reject) => {
        if (writingKeys.has(key)) {
            reject(new Error('key is being writing'));
        }
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

module.exports = {
    config,
    has,
    get,
    set,
}