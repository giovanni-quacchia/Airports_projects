import users from '../services/users.service'
import { validateLogin } from '../utils/auth.utils';
import { manageErrors, printObject, validateObj } from '../utils/utils';
import { validateNew, validatePut, validateSearch } from '../models/User';
import { AppError } from '../models/AppError';

export async function logIn(req, res, next) {
    try {
        const query = validateLogin(req.body)
        const result = await users.logIn(query);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "User"));
    }
}

export async function getAllUsers(req, res, next) {
    try {
        const query = validateSearch(req.query)
        const result = await users.getAllUsers(query);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "User"));
    }
}

export async function getUser(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] });

        const result = await users.getUser(id, req.user);

        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "User"));
    }
}

export async function createUser(req, res, next){
    let parsedData: any = {}
    try {
        parsedData = validateNew(req.body);
        const result = await users.createUser(parsedData);
        printObject("User created", parsedData)  
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "User"));
    }
}

export async function deleteUser(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] });

        const result: any = await users.deleteUser(id);
        if(!result) throw new AppError("User not found", 4004);

        res.json({message: "User deleted", user: {_id: result._id, mail: result.mail}});
    } catch (err) {
        res.status(400).send(manageErrors(err, "User"));
    }
}

export async function updateUser(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })

        const parsedData = validatePut(req.body)
        
        const result = await users.updateUser(id, parsedData);
        if(!result) throw new AppError("User not found", 4004);

        res.json({message: "User updated", user: {_id: result._id, mail: result.mail}});
    } catch (err) {
        res.status(400).send(manageErrors(err, "User"));
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