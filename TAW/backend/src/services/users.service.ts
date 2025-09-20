import { AppError } from '../models/AppError';
import Us, {User} from '../models/User';
import { validateLogin } from '../utils/auth.utils';
const auth = require('../utils/auth.utils')

async function logIn(query) {
    const user = await Us.getModel().findOne({mail: query.mail});
    if(!user || !user.checkPassword(query.password)) throw new AppError("Credentials not valid", 4005);
    
    // create JWT
    const token = auth.generateAccessToken({
        id: user._id,
        mail: user.mail,
        balance: user.balance,
        isAdmin: user.isAdmin()
    });

    return {token: token, expireDays: 7};
}

async function getAllUsers(query) {

    let {mail} = query
    mail = mail ? { $regex: mail, $options: "i" } : /.*/;

    const pipeline: any[] = [{
        $match: {"mail": mail}
    }];

    return Us.getModel().aggregate(pipeline);
}

async function getUser(id: string, user){
    const select = user.isAdmin ? "" : "mail balance";
    const res = await Us.getModel().findById(id).select(select);
    if(!res) throw new AppError("User not found", 4004);
    return res;
}

export async function createUser(User){

    const exists: User = await Us.getModel().findOne({mail: User.mail});
    if(exists) throw new AppError("User already exists", 4005);
    const user = Us.createUser(User);
    user.setPassword(User.password);
    if(User.isAdmin) user.setAdmin();
    await user.save();

    // create JWT
    const token = auth.generateAccessToken({
        id: user._id,
        mail: user.mail,
        balance: user.balance,
        isAdmin: user.isAdmin()
    });

    return {token: token, expireDays: 7};
}

async function deleteUser(id: string){
    return await Us.getModel().findByIdAndDelete(id);
}

async function updateUser(id: string, query: any, usr){

    const user = await Us.getModel().findById(id);
    if(!user) throw new AppError("User not found", 4004);

    // Change password
    if(query.newPassword){
        if(!user.checkPassword(query.password)) throw new AppError("Invalid password", 4005);
        
        if(query.password === query.newPassword) throw new AppError("New password must be different from the old one", 4005);

        user.setPassword(query.newPassword);
        
        delete query.password;
        delete query.newPassword;
    }

    // Update balance
    if(query.balance && !usr.isAdmin) throw new AppError("Only admin can change balance", 4005);

    // Update other fields
    Object.assign(user, query);
    await user.save();

    return user.isAdmin() ? user : {_id: user._id, mail: user.mail};
}

export default {
    logIn,
    getAllUsers,
    getUser,
    createUser,
    deleteUser,
    updateUser
}