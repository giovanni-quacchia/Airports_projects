import { AppError } from '../models/AppError';
import Us, {User} from '../models/user';
import { validateLogin } from '../utils/auth.utils';
const auth = require('../utils/auth.utils')

async function logIn(data) {
    const query = validateLogin(data);
    const user = await Us.getModel().findOne({mail: query.mail});
    if(!user || !user.checkPassword(query.password)) throw new AppError("Credentials not valid", 4005);
    
    // create JWT
    const token = auth.generateAccessToken({
        id: user._id,
        mail: user.mail,
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
    const select = user.isAdmin ? "" : "mail";
    const res = await Us.getModel().findById(id).select(select);
    if(!res) throw new AppError("User not found", 4004);
    return res;
}

export async function createUser(User: {mail: string, password: string, isAdmin: boolean}){

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
        isAdmin: user.isAdmin()
    });

    return {token: token, expireDays: 7};
}

async function deleteUser(id: string){
    return await Us.getModel().findByIdAndDelete(id);
}

async function updateUser(id: string, data: any){
    const query = Us.validatePut(data);
    return await Us.getModel().findByIdAndUpdate(id, query, { new: true, runValidators: true });
}

export default {
    logIn,
    getAllUsers,
    getUser,
    createUser,
    deleteUser,
    updateUser
}