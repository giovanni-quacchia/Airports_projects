import mongoose = require('mongoose');
import crypto = require('crypto');

// Interface

export interface User extends mongoose.Document {
    username: string;
    mail: string;
    roles: string[];
    salt: string;
    digest: string;
    isAdmin(): boolean;
    setAdmin(): void;
    setPassword(password: string): void;
    checkPassword(password: string): boolean;
}

// Schema per DB

const userSchema = new mongoose.Schema<User>({
    username: { type: String, required: true},
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

// Model

let userModel: mongoose.Model<User>;
export function getModel(): mongoose.Model<User> {
    if(!userModel) userModel = mongoose.model<User>('User', userSchema);
    return userModel;
}

export function newUser(data): User {
    const _usermodel = getModel();
    const user = new _usermodel(data);
    return user;
}

export default { getModel, userSchema };