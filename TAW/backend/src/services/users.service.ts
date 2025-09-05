import Us, {User} from '../models/user';

async function logIn(data) {
    Us.validateLogin(data);
    const user: User = await Us.getModel().findOne({mail: data.mail});
    if(!user || !user.checkPassword(data.password)) throw Error("Credentials not valid")
    return "Log in successful";
}

async function getAllUsers() {
    return Us.getModel().find();
}

async function getUser(id: string){
    return Us.getModel().findById(id);
}

export async function createUser(User: {mail: string, password: string, isAdmin: boolean}){
    const ar = Us.createUser(User);
    ar.setPassword(User.password);
    if(User.isAdmin) ar.setAdmin();
    return ar.save();
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