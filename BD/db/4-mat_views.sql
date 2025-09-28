CREATE MATERIALIZED VIEW itineraries AS
SELECT
    f.id AS id,
    json_build_object(
        'id', f.id,
        'code', f.code,
        'airline', a.name,
        'duration', f.duration,
        'from_', from_.code,
        'to_', to_.code,
        'departure', f.departure,
        'arrival', f.arrival
    ) AS flight1,
    NULL::json AS flight2,
    f.duration AS tot_duration,
    NULL::interval AS stop_time
FROM flights f
JOIN routes r ON f.route = r.id
JOIN airports from_ ON r.from_airport = from_.id
JOIN airports to_ ON r.to_airport = to_.id
JOIN airlines a ON f.airline = a.id

UNION ALL

SELECT
    f1.id * 100000 + f2.id AS id,
    json_build_object(
        'id', f1.id,
        'code', f1.code,
        'airline', a1.name,
        'duration', f1.duration,
        'from_', flight1_from_.code,
        'to_', flight1_to_.code,
        'departure', f1.departure,
        'arrival', f1.arrival
    ) AS flight1,
    json_build_object(
        'id', f2.id,
        'code', f2.code,
        'airline', a2.name,
        'duration', f2.duration,
        'from_', flight2_from_.code,
        'to_', flight2_to_.code,
        'departure', f2.departure,
        'arrival', f2.arrival
    ) AS flight2,
    (f1.duration + f2.duration) AS tot_duration,
    (f2.departure - f1.arrival) AS stop_time
FROM flights f1
JOIN routes r1 ON f1.route = r1.id
JOIN routes r2 ON r2.from_airport = r1.to_airport
JOIN flights f2 ON f2.route = r2.id

JOIN airports flight1_from_ ON r1.from_airport = flight1_from_.id
JOIN airports flight1_to_ ON r1.to_airport = flight1_to_.id
JOIN airports flight2_from_ ON r2.from_airport = flight2_from_.id
JOIN airports flight2_to_ ON r2.to_airport = flight2_to_.id

JOIN airlines a1 ON f1.airline = a1.id
JOIN airlines a2 ON f2.airline = a2.id

WHERE f2.departure > f1.arrival + INTERVAL '2 hour'
AND r2.to_airport <> r1.from_airport;
