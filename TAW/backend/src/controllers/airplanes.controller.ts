import airplanes from '../services/airplanes.service'

export async function getAllAirplanes(req, res, next) {
    try {
        const result = await airplanes.getAllAirplanes();
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function getAirplane(req, res, next){
    try {
        const {id} = req.params;
        const result = await airplanes.getAirplane(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function createAirplane(req, res, next){
    try {
        const result = await airplanes.createAirplane(req.body);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function deleteAirplane(req, res, next){
    try {
        const {id} = req.params;
        const result = await airplanes.deleteAirplane(id);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export async function updateAirplane(req, res, next){
    try {
        const {id} = req.params;
        const result = await airplanes.updateAirplane(id, req.body);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

export default {
    getAllAirplanes,
    getAirplane,
    createAirplane,
    deleteAirplane,
    updateAirplane
}