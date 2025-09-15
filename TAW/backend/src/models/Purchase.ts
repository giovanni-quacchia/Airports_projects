import mongoose = require('mongoose');
import { isObject, isObjectEmpty, isObjSameSize, validateObj, validatePartialObj } from '../utils/utils';
import { AppError } from './AppError';

// Interface
export interface Purchase{
    price: number,
    date: Date,
    quantity: number,
    user: string |mongoose.Schema.Types.ObjectId,
    ticket: string | mongoose.Schema.Types.ObjectId,
}

// Schema
const PurchaseSchema = new mongoose.Schema<Purchase>({
    price: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    quantity: { type: Number, required: true, min: 1 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
});

// Model

let purchaseModel: mongoose.Model<Purchase>;
export function getModel(): mongoose.Model<Purchase>{
    if(!purchaseModel) purchaseModel = mongoose.model<Purchase>('Purchase', PurchaseSchema);
        return purchaseModel;
}

export function newPurchase(data): mongoose.HydratedDocument<Purchase> {
    const _purchaseModel = getModel();
    const purchase = new _purchaseModel(data);
    return purchase;
}

//Validate
export function validateNew(data: any): boolean{

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query: any = validateObj({
        quantity: [data.quantity, "positiveInteger"],
        user: [data.user, "ID"],
        ticket: [data.ticket, "ID"]
    });

    if(!isObjSameSize(query, data)) throw new AppError("A new Purchase must include: price, date, quantity, user and ticket ID", 4005);

    return query;
}

// Validate update
export function validatePut(data: any) {

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query: any = validatePartialObj({
        price: [data.price, "positiveNumber"],
        date: [data.date, "date"],
        quantity: [data.quantity, "positiveInteger"],
        user: [data.user, "ID"],
        ticket: [data.ticket, "ID"]
    });

    if(isObjectEmpty(query)) throw new AppError("Update not valid, please provide at least a new parameter", 4005);
    
    return query;
}

// Validate search
export function validateSearch(data: any) {

    if(!isObject(data)) throw new AppError("Object expected", 4005);

    const query: any = validatePartialObj({
        sortBy: [data.sortBy, "string"],
        order: [data.order, "string"]
    });

    if(
        (query.sortBy && !["price", "date", "quantity"].includes(query.sortBy)) || 
        (query.order && !query.sortBy)
    )
        throw new AppError("Sorting parameters not valid", 4005);

    if(query.order && query.order !== "desc" && query.order !== "asc")
        throw new AppError("Order parameter not valid", 4005);

    return query;
}

export default {getModel, newPurchase, validateNew, validatePut, validateSearch}