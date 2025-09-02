const users = require("../services/users.service");

async function signUp(req, res, next){
    try{
        const result = await users.signUp(req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json(err.message);
    }
}

module.exports = {
    signUp
}