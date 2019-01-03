const Jwt = require('jsonwebtoken');

const _verifyToken = function (token, secretKey) {
    let decoded, status = false;
    try {
        decoded = Jwt.verify(token, secretKey);
        const timeout = parseInt(decoded.timeout);
        const expireAfter = parseInt(decoded.expire_after);
        if ((timeout + expireAfter) < Math.floor(Date.now() / 1000)) {
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
    const expireAfter = (60 * 86400).toString();
    const payload = {
        timeout: (Math.floor(Date.now() / 1000)).toString(),
        expire_after: expireAfter,
        user: user,
    };
    let token = Jwt.sign(payload, secretKey);
    return token;
}

const authenticate = function (token, secretKey, callback) {
    const { status, decoded } = _verifyToken(token, secretKey);
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
