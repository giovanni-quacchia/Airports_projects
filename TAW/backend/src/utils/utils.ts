const crypto = require('crypto');

// Check keys is subset or equals to validKeys
export function checkKeys(keys: string[], validKeys: string[]): boolean{
    keys.forEach(key => {
        if(!validKeys.includes(key)) return false;
    });
    return true;
}

export function getRandomPassword(length: Number){
    return crypto.randomBytes(length).toString("hex");

}