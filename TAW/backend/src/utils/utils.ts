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

    for( const [key, [value, type, regEx]] of Object.entries(data)){
        if(!isValidType(value, type, regEx)){
            if(value === null || value === undefined) throw Error(`${key} is required`);
            throw Error(`${key} "${value}" is not Valid. ${type} expected`);
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
            throw Error(`${key} "${value}" is not Valid. ${type} expected`);
        }

        res[key] = castValue(value, type);
    }

    return res;
}

function castValue(value, type: string){
    return (type === "number" ? Number(value) : type === "boolean" ? value === "true" || value === true : value)
}

function isValidType(value, type: string, regEx?: RegExp, allowNull: boolean = false){
    
    if(value === null || value === undefined) return allowNull;

    const match = regEx ?? /.*/; // ??: nullish coalesce operator
    // https://www.geeksforgeeks.org/javascript/javascript-program-to-validate-an-email-address/
    const mailMatch = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
    const IATAMatch = /^[A-Z]{3}$/
    const IATA2Match = /^[A-Z]{2}$/

    switch(type){
        case "string":
            return typeof value === "string" && match.test(value);
        case "number":
            return !isNaN(Number(value));
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