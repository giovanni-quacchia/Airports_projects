import Us, {User} from '../models/user';
const auth = require('../utils/auth.utils')

async function logIn(data) {
    Us.validateLogin(data);
    const user = await Us.getModel().findOne({mail: data.mail});
    if(!user || !user.checkPassword(data.password)) throw Error("Credentials not valid");
    // create JWT
    const token = auth.generateAccessToken({
        id: user._id,
        mail: user.mail,
        isAdmin: user.isAdmin()
    });

    return {token: token, expireDays: 7};
}

async function getAllUsers() {
    return Us.getModel().find();
}

async function getUser(id: string){
    const user = await Us.getModel().findById(id);
    return user
}

export async function createUser(User: {mail: string, password: string, isAdmin: boolean}){

    const exists: User = await Us.getModel().findOne({mail: User.mail});
    if(exists) throw Error("User already exists");

    const user = Us.createUser(User);
    user.setPassword(User.password);
    if(User.isAdmin) user.setAdmin();
    user.save();

    // create JWT
    const token = auth.generateAccessToken({
        mail: user.mail,
        isAdmin: user.isAdmin()
    });

    return {token: token, expireDays: 7};
}

async function deleteUser(id: string){
    return Us.getModel().findByIdAndDelete(id);
}

async function updateUser(id: string, data: any){
    Us.validateUpdate(data);
    return Us.getModel().findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export default {
    logIn,
    getAllUsers,
    getUser,
    createUser,
    deleteUser,
    updateUser
}