export function SELECT(projection: string){
    const projectStage = []
    const project = {};

    projection.split(" ").forEach(attr => project[attr.trim()] = 1);
    projectStage.push({ $project: project});

    return projectStage // [ [ $project: {attr_1: 1, ..., attr_n: 1} ] ]
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

export function JOINStop(collection: string, FK: string, PK: string, newAttr: string, dest, firstArrival){
    return [
        {
            $lookup: {
                from: collection,
                let: { dest: `$${FK}`, firstArrival: `$${firstArrival}`},
                pipeline: [
                    matchDeparture("departure"),
                    ...JOIN("routes", "route"),
                    {
                        $match: { 
                            $expr: { $eq: [`$${PK}`, "$$dest"]}
                        }
                    },
                    ...JOIN("airports", "route.from"),
                    ...JOIN("airports", "route.to"),
                    // Ex: from=vcn&to=ber --> VCN -- NEW -- BER -- PEC
                    // f2.from != to (cosi non considera il volo ber -- pec, perche sono gia a berlino con il primo volo)
                    unMatchAirport("route.from", dest),

                    ...JOIN("users", "airline", "code PIVA name logo"),
                ],
                as: newAttr
            },
        },
        { $unwind: { path: `$${newAttr}`, preserveNullAndEmptyArrays: true } }
    ]
}

// WHERE location LIKE regEx

export function getAirportContidions(location: string, regEx){
    return [
        { [`${location}.name`]: regEx },
        { [`${location}.city`]: regEx },
        { [`${location}.code`]: regEx },
        { [`${location}.country`]: regEx },
    ] 
}

export function matchAirport(location: string, regEx){
    return {
        $match: {
            $or: getAirportContidions(location, regEx)
        }
    }
}

export function unMatchAirport(location: string, regEx){
    return {
        $match: {
            $nor: getAirportContidions(location, regEx)
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

// Next Flight after at least 2hrs and max 24hrs
export function matchDeparture(attr: string){

    const transferTime = 2 * 60 * 60000; // min * ms
    // const waitTime = 24 * 60 * 60000

    return {
        $match:{
            $expr: {
                $and: [
                    { $gte: [`$${attr}`, { $add: ["$$firstArrival", transferTime] }] },
                    //{ $lte: [`$${attr}`, { $add: ["$$firstArrival", waitTime] }] }
                ]
            }
        }
    }
}