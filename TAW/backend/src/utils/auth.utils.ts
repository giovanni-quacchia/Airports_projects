import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import fs from 'fs'

// Makes .env file available in process.env
const dotenv = require("dotenv");
dotenv.config();

function generateSecret(){
    const envPath = ".env"
    const token = crypto.randomBytes(64).toString("hex");

    if (fs.existsSync(envPath)) {
        console.log(".env already exists — not overwriting TOKEN_SECRET");
        return;
    }

    fs.writeFileSync(envPath, `TOKEN_SECRET=${token}\n`);
    console.log("New TOKEN_SECRET generated in .env");
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: "7d" });
}

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];

  if (token === null) return res.sendStatus(401); // TOKEN MISSING

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {

    if(err && err.name === "TokenExpiredError"){
      return res.status(401).json({error: "Token expired"});
    }

    if (err){
      return res.sendStatus(403); // NOT ALLOWED
    }

    req.user = user;

    next();
  });
}

// Check token only for additional privileges
function optionalCheckToken(req, res, next){
  const token = req.headers["authorization"];

  if(!token) return next();

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if(!err && user) req.user = user;
    next();
  })

}

function checkAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.sendStatus(403);
  }

  next();
}

function checkAirline(req, res, next) {
  if (!req.user?.isAirline) {
    return res.sendStatus(403);
  }

  next();
}

// Managing airline: only admin or specific airline
function checkAirlineId(req, res, next){

  if(req.user?.isAdmin) return next();

  if (!req.user?.isAirline) return res.sendStatus(403);

  if(req.user?.id !== req.params?.id) return res.sendStatus(403);

  return next();
}

module.exports = {
  generateSecret,
  generateAccessToken,
  authenticateToken,
  checkAdmin,
  checkAirline,
  checkAirlineId,
  optionalCheckToken
};