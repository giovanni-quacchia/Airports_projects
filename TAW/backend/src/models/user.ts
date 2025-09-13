import mongoose = require('mongoose');
import crypto = require('crypto');
import { checkKeys, isObject, isObjectEmpty, isObjSameSize, validateObj, validatePartialObj } from '../utils/utils';
import { AppError } from './AppError';

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

export function validateNew(data: any){

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query: any = validateObj({
        mail: [data.mail, "mail"],
        password: [data.password, "password"],
    });

    if(!isObjSameSize(query, data)) throw new AppError("mail and password are required", 4005);
    return query;
}

export function validatePut(data: any){

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query: any = validatePartialObj({
        mail: [data.mail, "mail"],
        password: [data.password, "password"],
        newPassword: [data.newPassword, "password"]
    });

    // ![ newPw && pw    ||    !newPw && !pw ]
    if( (!query.password || !query.newPassword) && (query.password || query.newPassword))
        throw new AppError("Please provide both password and new password", 4005)

    if(isObjectEmpty(query)) throw new AppError("Update not valid, please provide at least a new parameter", 4005);
    
    return query;
}

export function validateSearch(data: any){
    
    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query = validatePartialObj({
        mail: [data.mail, "string"]
    });

    return query;
}

// Model

let userModel: mongoose.Model<User>;
export function getModel(): mongoose.Model<User> {
    if(!userModel) userModel = mongoose.model<User>('User', userSchema);
    return userModel;
}

export function createUser(data): mongoose.HydratedDocument<User> {
    const _usermodel = getModel();
    const user = new _usermodel({mail: data.mail});
    return user;
}

export default { getModel, createUser, validatePut, validateNew, validateSearch };