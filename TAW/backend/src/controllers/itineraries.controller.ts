import itinerary from '../services/itineraries.service'
import { manageErrors } from '../utils/utils';

export async function getAllItineraries(req, res, next) {
    try {
        const result = await itinerary.getAllItineraries(req.query);
        res.json(result);
    } catch (err) {
        res.status(400).send(manageErrors(err, "Itinerary"));
    }
}

export default {
    getAllItineraries,
}