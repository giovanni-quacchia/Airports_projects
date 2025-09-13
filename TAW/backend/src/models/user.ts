import mongoose = require('mongoose');
import crypto = require('crypto');
import { checkKeys } from '../utils/utils';

// Interface
export interface User{
    mail: string;
    roles?: string[];
    salt?: string;
    digest?: string;
    isAdmin(): boolean;
    setAdmin(): void;
    setPassword(pwd: string): void;
    checkPassword(pwd: string): boolean;
}

// Schema

const userSchema = new mongoose.Schema<User>({
    mail: { type: String, required: true, unique: true },
    roles: { type: [String], required: true, default: [] },
    salt: { type: String, required: true},
    digest: { type: String, required: true}
})

// Metodi

userSchema.methods.isAdmin = function(this: User){
    return this.roles.includes("ADMIN");
}

userSchema.methods.setAdmin = function(this: User){
    if(!this.roles.includes("ADMIN")) this.roles.push("ADMIN");
}

userSchema.methods.setPassword = function(this: User, pwd: string){
    this.salt = crypto.randomBytes(16).toString("hex");
    const hmac = crypto.createHmac("sha512", this.salt);
    hmac.update(pwd);
    this.digest = hmac.digest("hex");
}

userSchema.methods.checkPassword = function(this: User, pwd: string){
    const hmac = crypto.createHmac("sha512", this.salt);
    hmac.update(pwd);
    const digest = hmac.digest("hex");
    return (this.digest == digest);
}

// Validation

function validateLogin(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data)

    if(!data.mail || typeof data.mail !== 'string') 
        throw Error("Mail required");
    if(!data.password || typeof data.password !== 'string') 
        throw Error("Password required");

    // Check if there are not valid keys
    return true;
    // if(keys.length === 2) return true;
    // else
    //     throw Error("Credentials not valid");
}

export function validateUpdate(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data)

    if(
        (!data.mail || typeof data.mail !== 'string') &&
        (!data.password || typeof data.password !== 'string')
    )
        throw Error("Updating a user requires a new mail or password")

    // Check if there are not valid keys
    if(checkKeys(keys, ["mail", "password"])) return true;
    else
        throw Error("Not valid data");
}

// Model

let userModel: mongoose.Model<User>;
export function getModel(): mongoose.Model<User> {
    if(!userModel) userModel = mongoose.model<User>('User', userSchema);
    return userModel;
}

export function createUser(data): mongoose.HydratedDocument<User> {
    validateLogin(data);
    const _usermodel = getModel();
    const user = new _usermodel({mail: data.mail});
    return user;
}

export default { getModel, createUser, validateUpdate, validateLogin };