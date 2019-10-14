const Jwt = require('jsonwebtoken');

const _signToken = function (payload, secretKey) {
    return Jwt.sign(payload, secretKey)
}

const _parseToken = function (token, secretKey) {
    return Jwt.verify(token, secretKey);
}

const _verifyToken = function (token, expireIn, secretKey) {
    let decoded, status = false;
    try {
        decoded = _parseToken(token, secretKey);
        const createAt = decoded.createAt;
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
        createAt: Math.floor(Date.now() / 1000),
        user: user,
    };
    let token = _signToken(payload, secretKey);
    return token;
}

const authenticate = function (token, expireIn, secretKey) {
    const { status, decoded } = _verifyToken(token, expireIn, secretKey);
    if (status && decoded && decoded.user) {
        return decoded.user;
    }
}

module.exports = {
    createToken,
    authenticate,
}
