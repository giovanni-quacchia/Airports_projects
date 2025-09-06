import mongoose = require('mongoose');
import { checkKeys } from '../utils/utils';

// Interface
export interface Ticket{
    type: 'ECONOMY' | 'BUSINESS' | 'FIRST CLASS',
    price: number,
    quantity: number,
    flight: mongoose.Schema.Types.ObjectId
}

// Schema
const TicketSchema = new mongoose.Schema<Ticket>({
    type: {
        type: String,
        enum: ["ECONOMY", "BUSINESS", "FIRST CLASS"],
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        requierd: true,
        min: 0
    },
    flight: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flight",
        required: true
    }
});

// Model

let ticketModel: mongoose.Model<Ticket>;
export function getModel(): mongoose.Model<Ticket>{
    if(!ticketModel) ticketModel = mongoose.model<Ticket>('Ticket', TicketSchema);
        return ticketModel;
}

export function createTicket(data): mongoose.HydratedDocument<Ticket> {
    validateInput(data);
    const _ticketModel = getModel();
    const ticket = new _ticketModel(data);
    return ticket;
}

//Validate
function validateInput(data: any): boolean{

    if(typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data);

    if(!data.type || typeof data.type !== 'string') 
        throw Error("Ticket type required");
    if(!data.price || isNaN(data.price)) 
        throw Error("Price required");
    if(!data.quantity || isNaN(data.quantity)) 
        throw Error("Quantity required");
    if(!data.flight || !mongoose.Types.ObjectId.isValid(data.flight)) 
        throw Error("Flight required");

    data.price = Number(data.price);
    data.quantity = Number(data.quantity);

    // Check if there are not valid keys
    if(keys.length === 4) return true;
    else
        throw Error("Credentials not valid");
}

// Validate update
function validate(data: any): boolean {

    if (typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data);

    if (
        (!data.type || typeof data.type !== 'string') &&
        (!data.price || isNaN(data.price)) &&
        (!data.quantity || isNaN(data.quantity)) &&
        (!data.flight || !mongoose.Types.ObjectId.isValid(data.flight))
    )
        throw Error("Updating a ticket requires at least one valid field");

    // Check if keys are valid
    if (checkKeys(keys, ["type", "price", "quantity", "flight"])) return true;
    else throw Error("Not valid data");
}

// Validate search
function validateSearch(data: any): boolean {

    if (typeof data !== "object" || data === null || Array.isArray(data)) throw Error("Not valid data");

    const keys = Object.keys(data);

    if (keys.length === 0) return true;

    // Optional search fields, must be correct type if provided
    if (data.type && typeof data.type !== 'string') throw Error("Ticket type must be a string");
    if (data.from && typeof data.from !== 'string') throw Error("Departure must be a string");
    if (data.to && typeof data.to !== 'string') throw Error("Arrival must be a string");
    if (data.minPrice && isNaN(data.minPrice)) throw Error("minPrice must be a number");
    if (data.maxPrice && isNaN(data.maxPrice)) throw Error("maxPrice must be a number");
    if (data.minQuantity && isNaN(data.minQuantity)) throw Error("minQuantity must be a number");
    if (data.maxQuantity && isNaN(data.maxQuantity)) throw Error("maxQuantity must be a number");

    if(data.minPrice) data.minPrice = Number(data.minPrice)
    if(data.maxPrice) data.maxPrice = Number(data.maxPrice)
    if(data.minQuantity) data.minQuantity = Number(data.minQuantity)
    if(data.maxQuantity) data.maxQuantity = Number(data.maxQuantity)

    console.log(data.minPrice)

    // Check if keys are valid
    if (checkKeys(keys, ["type", "flight", "minPrice", "maxPrice", "minQuantity", "maxQuantity", "from", "to"])) return true;
    else throw Error("Not valid data");
}

export default {getModel, createTicket, validate, validateSearch}