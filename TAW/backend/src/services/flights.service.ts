import Fl, {Flight} from '../models/Flight';

// Add Flights (if not exist)
async function getAllFlights() {
    return Fl.getModel().find();
}

async function getFlight(id: string){
    return Fl.getModel().findById(id);
}

async function createFlight(flight: Partial<Flight>){
    const fl = Fl.createFlight(flight);
    return fl.save();
}

async function deleteFlight(id: string){
    return Fl.getModel().findByIdAndDelete(id);
}

async function updateFlight(id: string, data: any){
    Fl.validate(data);
    return Fl.getModel().findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export default {
    getAllFlights,
    getFlight,
    createFlight,
    deleteFlight,
    updateFlight
}