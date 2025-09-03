import mongoose = require('mongoose');

// Interface

interface Passenger{
    name: string;
    surname: string;
    CF?: string;
    passportNumber?: string
}

// Schema: CF || passportNumber

const passengerSchema = new mongoose.Schema<Passenger>({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    CF: {
        type: String,
        validate: {
            validator: function(this: Passenger, value: string){
                return !!value || !!this.passportNumber; // \!! converts to boolean
            }
        }
    },
    passportNumber: {
        type: String,
        validate: {
            validator: function(this: Passenger, value: string){
                return !!value || !!this.passportNumber; // \!! converts to boolean
            }
        }
    }
});

// Model

let passengerModel: mongoose.Model<Passenger>;
export function getModel(): mongoose.Model<Passenger>{
    if(!passengerModel) passengerModel = mongoose.model<Passenger>('Passenger', passengerSchema);
    return passengerModel;
}

export function newPassenger(data): Passenger {
    const _passengerModel = getModel();
    const passenger = new _passengerModel(data);
    return passenger;
}