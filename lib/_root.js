'use strict';

const config = {
    root: __dirname,
}

function init(root) {
    if (root) {
        config.root = root;
    }
}

function getRoot() {
    return config.root;
}

module.exports = {
    init,
    getRoot,
}