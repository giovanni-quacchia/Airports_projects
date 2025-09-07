import itinerary from '../services/itineraries.service'

export async function getAllItineraries(req, res, next) {
    try {
        const result = await itinerary.getAllItineraries(req.query);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
}


export default {
    getAllItineraries,
}