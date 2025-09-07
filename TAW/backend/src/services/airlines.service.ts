import Ar, {Airline} from '../models/airline';
import { getRandomPassword } from '../utils/utils';

// Add airlines (if not exist)
async function getAllAirlines(query) {
    Ar.validateSearch(query);
    
    let {name = /.*/} = query

    name = name ? { $regex: name, $options: "i" } : /.*/;

    return Ar.getModel().aggregate([
        {
            $match: { name: name }
        },
        {
            $project: {__t: 0}
        }
    ]);
}

async function getAirline(id: string){
    return Ar.getModel().findById(id);
}

async function createAirline(airline: Partial<Airline>){
    const ar = Ar.newAirline(airline);
    const pw = getRandomPassword(16);
    ar.setPassword(pw);
    return [ar, pw];
}

async function deleteAirline(id: string){
    return Ar.getModel().findByIdAndDelete(id);
}

async function updateAirline(id: string, data: any){
    Ar.validateUpdate(data);
    return Ar.getModel().findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export default {
    getAllAirlines,
    getAirline,
    createAirline,
    deleteAirline,
    updateAirline
}