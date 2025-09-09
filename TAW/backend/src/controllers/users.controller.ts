import mongoose from 'mongoose';
import users from '../services/users.service'

export async function logIn(req, res, next) {
    try {
        const result = await users.logIn(req.body);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function getAllUsers(req, res, next) {
    try {
        const result = await users.getAllUsers();
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function getUser(req, res, next){
    try {
        const {id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)) throw Error("Id not valid");
        const result = await users.getUser(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function createUser(req, res, next){
    const ar = req.body
    try {
        const result = await users.createUser(ar);

        console.log("\nUser created:");
        for(const value of Object.values(ar))
            console.log(`-${value}`);     
        res.json(result);
    } catch (err) {
        // duplicate error
        if (err.code === 11000)
            err.message = `User with mail ${ar.mail} already exists`;
        res.status(400).send(err.message);
    }
}

export async function deleteUser(req, res, next){
    try {
        const {id} = req.params;
        const result = await users.deleteUser(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function updateUser(req, res, next){
    const ar = req.body;
    try {
        const {id} = req.params;
        const result = await users.updateUser(id, ar);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export default {
    logIn,
    getAllUsers,
    getUser,
    createUser,
    deleteUser,
    updateUser
}