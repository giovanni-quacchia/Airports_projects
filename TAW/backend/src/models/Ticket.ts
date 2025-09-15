import mongoose = require('mongoose');
import { isObject, isObjectEmpty, isObjSameSize, validateObj, validatePartialObj } from '../utils/utils';
import { AppError } from './AppError';

// Interface
export interface Ticket{
    code: number,
    type: 'ECONOMY' | 'BUSINESS' | 'FIRST CLASS',
    price: number,
    quantity: number,
    flight: mongoose.Schema.Types.ObjectId,
}

// Schema
const TicketSchema = new mongoose.Schema<Ticket>({
    code: { type: Number, required: true, unique: true},
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
        required: true,
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

export function newTicket(data): mongoose.HydratedDocument<Ticket> {
    const _ticketModel = getModel();
    const ticket = new _ticketModel(data);
    return ticket;
}

//Validate
export function validateNew(data: any): boolean{

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query: any = validateObj({
        code: [data.code, "positiveInteger"],
        type: [data.type, "ticketType"],
        price: [data.price, "positiveNumber"],
        quantity: [data.quantity, "positiveInteger"],
        flight: [data.flight, "ID"],
    });

    if(!isObjSameSize(query, data)) throw new AppError("A new Ticket must include: code, type, price, quantity and flight ID", 4005);

    return query;
}

// Validate update
export function validatePut(data: any) {

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query: any = validatePartialObj({
        code: [data.code, "positiveInteger"],
        type: [data.type, "ticketType"],
        price: [data.price, "positiveNumber"],
        quantity: [data.quantity, "positiveInteger"],
        flight: [data.flight, "ID"]
    });

    if(isObjectEmpty(query)) throw new AppError("Update not valid, please provide at least a new parameter", 4005);
    
    return query;
}

// Validate search
export function validateSearch(data: any) {

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query: any = validatePartialObj({
        type: [data.type, "ticketType"],
        from: [data.from, "string"],
        to: [data.to, "string"],
        minPrice: [data.minPrice, "positiveNumber"],
        maxPrice: [data.maxPrice, "positiveNumber"],
        minQuantity: [data.minQuantity, "positiveInteger"],
        maxQuantity: [data.maxQuantity, "positiveInteger"],
        sortBy: [data.sortBy, "string"],
        order: [data.order, "string"],
    });

    if(
        (query.sortBy && !["price", "quantity", "type", "code"].includes(query.sortBy)) || 
        (query.order && !query.sortBy)
    )
        throw new AppError("Sorting parameters not valid", 4005);

    if(query.order && query.order !== "desc" && query.order !== "asc")
        throw new AppError("Order parameter not valid", 4005);

    return query;
}

export default {getModel, newTicket, validateNew, validatePut, validateSearch}