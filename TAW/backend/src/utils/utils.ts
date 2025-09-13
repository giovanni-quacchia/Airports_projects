import mongoose from "mongoose";
import { AppError } from "../models/AppError";

const crypto = require('crypto');


// Check keys is subset or equals to validKeys
export function checkKeys(keys: string[], validKeys: string[]): boolean {
    for (const key of keys) {
        if (!validKeys.includes(key)) return false;
    }
    return true;
}

export function getRandomPassword(length: Number){
    return crypto.randomBytes(length).toString("hex");

}

// INPUT: {code: ["123", "number"], mail: {"mail@gmail.com", "string"}}
// OUTPUT: {code: 123, mail: "mail@gmail.com"}

export function validateObj(data: {[key: string]: [value: unknown, type: string, regEx?: RegExp]}){

    const res = {}
    const pwError = "Minimum 8 chars, at least one upper case letter, one lower case letter, one number and one special char";

    for( const [key, [value, type, regEx]] of Object.entries(data)){
        if(!isValidType(value, type, regEx)){
            if(value === null || value === undefined) throw new AppError(`${key} is required`, 4002);
            throw new AppError(`${key}: '${value}' is not Valid. ${type} expected. ${type === "password" ? pwError : ""}`, 4001);
        }
        res[key] = castValue(value, type);
    }

    return res;
}

// Skip keys when values are undefined or null
export function validatePartialObj(data: {[key: string]: [value: unknown, type: string, regEx?: RegExp]}){

    const res = {}

    for( const [key, [value, type, regEx]] of Object.entries(data)){
        
        if(value === null || value === undefined) continue;

        if(!isValidType(value, type, regEx, true)){
            throw new AppError(`${key}: '${value}' is not Valid. ${type} expected`, 4001);
        }

        res[key] = castValue(value, type);
    }

    return res;
}

function castValue(value, type: string){
    return (type === "number" ? Number(value) : type === "boolean" ? value === "true" || value === true : type === "date" ? new Date(value) : value)
}

function isValidType(value, type: string, regEx?: RegExp, allowNull: boolean = false){
    
    if(value === null || value === undefined) return allowNull;

    const match = regEx ?? /.*/; // ??: nullish coalesce operator
    // https://www.geeksforgeeks.org/javascript/javascript-program-to-validate-an-email-address/
    const mailMatch = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 

    // https://ihateregex.io/expr/password/
    const pwMatch = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/

    const IATAMatch = /^[A-Z]{3}$/
    const IATA2Match = /^[A-Z]{2}$/

    switch(type){
        case "date":
            return !isNaN(new Date(value).getTime());
        case "string":
            return typeof value === "string" && match.test(value);
        case "number":
            return !isNaN(Number(value));
        case "positiveInteger":
            return Number.isInteger(Number(value)) && Number(value) > 0;
        case "positiveNumber":
            return !isNaN(Number(value)) && Number(value) > 0;
        case "boolean":
            return(
                value === true || value === false ||
                value === "true" || value === "false"
            )
        case "mail":
            return (
                typeof value === "string" && mailMatch.test(value)
            )
        case "IATA":
            return (
                typeof value == "string" && IATAMatch.test(value)
            )
        case "IATA-2":
            return (
                typeof value == "string" && IATA2Match.test(value)
            )
        case "ID":
            return mongoose.Types.ObjectId.isValid(value);
        case "password":
            return typeof value === "string" //&& pwMatch.test(value)
        case "ticketType":
            return typeof value === "string" && (["ECONOMY", "BUSINESS", "FIRST CLASS"].includes(value))
        default:
            return false;
    }
}

export function isObject(data){
    return (typeof data === "object" && data !== null && !Array.isArray(data))
}

export function isObjSameSize(obj1: object, obj2: object){
    return Object.keys(obj1).length === Object.keys(obj2).length
}

export function isObjectEmpty(obj: object){
    return Object.keys(obj).length === 0;
}

export function printObject(title: string, obj: object){
    console.log(title);
    for(const [key, value] of Object.entries(obj))
        console.log(`- ${key}: ${value}`); 
}

export function manageErrors(err, collection: string){

    switch(err.code){
        case 4001:
            return {type: "Type error", msg: err.message};
        case 4002:
            return {type: "Field missing", msg: err.message};
        case 4004:
            return {type: "Document not found", msg: err.message};
        case 4005:
            return {type: "Input error", msg: err.message};
        case 4006:
            return {type: "Operation not allowed", msg: err.message}
        case 11000:
            return {type: "Duplicate error", msg: `${collection} already exists`};
        default:
            console.log(err);
            return "Internal server error";
    }
}