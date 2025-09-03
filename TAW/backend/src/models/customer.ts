import mongoose = require('mongoose');
import { User } from './user';


// Interface

export interface Customer extends User{
    buyTicket(): any
}

// Schema

const customerSchema = new mongoose.Schema<Customer>({
});

// Model
// Discriminator: 

let passengerModel: mongoose.Model<Customer>;
export function getModel(): mongoose.Model<Customer>{
    if(!passengerModel){
        const userModel = getModel();
        passengerModel = userModel.discriminator<Customer>('Customer', customerSchema);
    }
    return passengerModel;
}

export function newCustomer(data): Customer {
    const _customerModel = getModel();
    const customer = new _customerModel(data);
    return customer;
}