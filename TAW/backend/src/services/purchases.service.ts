import mongoose, { get } from 'mongoose';
import { AppError } from '../models/AppError';
import {getModel as getPassengerModel} from '../models/Passenger'
import {getModel as getPurchaseModel, newPurchase} from '../models/Purchase'
import {getModel as getTicketModel} from '../models/Ticket'
import {getModel as getUserModel} from '../models/User'

async function getAllPurchases(query, userId, user) {
    
    let { sortBy = "price", order = "asc"} = query;

    const sortOrder = order === "asc" ? 1 : -1;

    const pipeline: any[] = []

    if(userId && (user.isAdmin || user.id === userId)){
        pipeline.push({
            $match: {user: new mongoose.Types.ObjectId(userId)}
        })
    }
    
    pipeline.push(
        { $sort: { [sortBy]: sortOrder } }        
    )
    return getPurchaseModel().aggregate(pipeline);
}

async function getPurchase(id: string){
    const purchase = await getPurchaseModel().findById(id)
        .populate({path: "ticket", populate: "flight" })
    if(!purchase) throw new AppError("Purchase not found", 4004);
    return purchase;
}

async function createPurchase(data){

    // Start transaction
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();

        // Check user balance and ticket qnt
        const usr = await getUserModel().findById(data.user).session(session);
        if(!usr) throw new AppError("User does not exist", 4005);

        const ticket = await getTicketModel().findById(data.ticket).session(session);
        if(!ticket) throw new AppError("Ticket does not exist", 4005);

        const totalPrice = data.quantity * ticket.price;

        if(usr.balance < totalPrice) throw new AppError("Insufficient balance", 4005);

        usr.balance -= totalPrice;
        await usr.save({session});

        if(data.quantity > ticket.quantity) throw new AppError("Not enough tickets available", 4005);

        ticket.quantity -= data.quantity;
        await ticket.save({session});

        const purchase = newPurchase({...data, date: new Date(), price: totalPrice});
        await purchase.save({session});

        await session.commitTransaction();

        return purchase;
    } catch (error) {
        await session.abortTransaction(); // rollback
        throw error;
    } finally {
        session.endSession();
    }
}

async function deletePurchase(id: string, user){

    let res = {};

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        // Check passengers
        const passengers = await getPassengerModel().findOne({purchase: new mongoose.Types.ObjectId(id)}).session(session);
        if(passengers) throw new AppError("Purchase is in use by passengers", 4005);
        
        // Find purchase
        const purchase = await getPurchaseModel().findById(id).session(session);
        if(!purchase) throw new AppError("Purchase not found", 4004);

        // Only admin or the user who made the purchase can delete
        if(!user.isAdmin && String(purchase.user) !== user.id) throw new AppError("Access denied: you can only delete your own purchases", 4005);
        
        // Refund user
        const usr = await getUserModel().findById(purchase.user).session(session);
        if(!usr) throw new AppError("User does not exist", 4005);
        usr.balance += purchase.price;

        await usr.save({session});

        // Restore ticket quantity
        const ticket = await getTicketModel().findById(purchase.ticket).session(session);
        if(!ticket) throw new AppError("Ticket does not exist", 4005);

        ticket.quantity += purchase.quantity;
        await ticket.save({session});
    
        res = await purchase.deleteOne({session});
        await session.commitTransaction();
        return res;
    } catch (error) {
        await session.abortTransaction(); // rollback
        throw error;
    } finally {
        session.endSession();
    }
}

async function updatePurchase(id: string, data: any, user){

    // Start transaction
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Find purchase
        const purchase = await getPurchaseModel().findById(id).session(session);
        if(!purchase) throw new AppError("Purchase not found", 4004);

        // Check user
        if(data.user){
            const usr = await getUserModel().findById(data.user).session(session);
            if(!usr) throw new AppError("User does not exist", 4005);
        }

       if(data.ticket){
           const ticket = await getTicketModel().findById(data.ticket).session(session);
           if(!ticket) throw new AppError("Ticket does not exist", 4005);
       }

       const newPurchase = await getPurchaseModel().findByIdAndUpdate(id, data, {new: true, runValidators: true, session}).session(session);

       await session.commitTransaction();
       return newPurchase;

    } catch (error) {
        await session.abortTransaction(); // rollback
        throw error;
    } finally {
        await session.endSession();
    }
}

export default {
    getAllPurchases,
    getPurchase,
    createPurchase,
    deletePurchase,
    updatePurchase
}