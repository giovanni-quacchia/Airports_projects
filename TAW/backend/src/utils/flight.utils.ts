// If an airline requests flights info for itself AND statistic === true (or admin)
export function CheckStatisticsReq(user, airlineId, statistics: boolean){
    return user.isAdmin || user && user.isAirline && Object.keys(user).length > 0 && user.id === airlineId && statistics === true;
}