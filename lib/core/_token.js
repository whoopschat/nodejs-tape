const Jwt = require('jsonwebtoken');

const _verifyToken = function (token, expireIn, secretKey) {
    let decoded, status = false;
    try {
        decoded = Jwt.verify(token, secretKey);
        const createAt = parseInt(decoded.createAt);
        if ((createAt + expireIn) < Math.floor(Date.now() / 1000)) {
            status = false;
        } else {
            status = true;
        }
    } catch (error) {
        status = false;
    }
    return { status, decoded };
}

const createToken = function (user, secretKey) {
    if (!user) {
        return;
    }
    const payload = {
        createAt: (Math.floor(Date.now() / 1000)).toString(),
        user: user,
    };
    let token = Jwt.sign(payload, secretKey);
    return token;
}

const authenticate = function (token, expireIn = 60 * 86400, secretKey, callback) {
    const { status, decoded } = _verifyToken(token, expireIn, secretKey);
    if (status && decoded && decoded.user) {
        callback(decoded.user);
    } else {
        callback(null);
    }
}

module.exports = {
    createToken,
    authenticate,
}
