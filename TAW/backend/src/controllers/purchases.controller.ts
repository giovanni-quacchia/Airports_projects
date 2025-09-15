import purchases from '../services/purchases.service'
import { manageErrors, printObject, validateObj } from '../utils/utils';
import { validateNew, validatePut, validateSearch } from '../models/Flight';

export async function getAllPurchases(req, res, next) {
    try {
        const { userId } = req.params
        if(userId) validateObj({id: [userId, "ID"]})

        const query: any = validateSearch(req.query);
        const result = await purchases.getAllPurchases(query, userId, req.user);

        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Purchase"));
    }
}

export async function getPurchase(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })

        const result = await purchases.getPurchase(id);

        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Purchase"));
    }
}

export async function createPurchase(req, res, next){
    let parsedData: any = {}
    try {
        parsedData = validateNew(req.body);
        const result = await purchases.createPurchase(parsedData, req);
        printObject("Purchase created", parsedData)
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Purchase"));
    }
}

export async function deletePurchase(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] });

        const result = await purchases.deletePurchase(id, req.user);

        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Purchase"));
    }
}

export async function updatePurchase(req, res, next){
    try {
        const {id} = req.params;
        validateObj({ id: [id, "ID"] })

        const parsedData = validatePut(req.body)

        const result = await purchases.updatePurchase(id, parsedData, req.user);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Purchase"));
    }
}

export default {
    getAllPurchases,
    getPurchase,
    createPurchase,
    deletePurchase,
    updatePurchase
}