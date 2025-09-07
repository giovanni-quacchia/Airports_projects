export function SELECT(projection: string){
    const projectStage = []
    const project = {};

    projection.split(" ").forEach(attr => project[attr.trim()] = 1);
    projectStage.push({ $project: project});

    return projectStage 
}

export function JOIN(collection: string, field: string, projection?: string){

    // SELECT
    const projectStage = projection ? SELECT(projection) : [];

    const stages =  [
        {
            $lookup: {
                from: collection,
                localField: field,
                foreignField: "_id",
                as: field,
                pipeline: projectStage
            }
        },
        { $unwind: `$${field}` }
    ]

    return stages;
}

// WHERE location LIKE regEx
export function matchAirport(location: string, regEx){
    return {
        $match: {
            $or: [
                { [`${location}.name`]: regEx },
                { [`${location}.city`]: regEx },
                { [`${location}.code`]: regEx },
                { [`${location}.country`]: regEx },
            ] 
        }
    }
}

export function matchDate(attribute: string, fromDate: string, toDate: string){
    return {
        $match: {
            [attribute]: {
                $gte: fromDate ? new Date(fromDate) : new Date('1970-01-01'),
                $lte: toDate ? new Date(toDate) : new Date('2100-12-31'),
            },
        }
    }
}