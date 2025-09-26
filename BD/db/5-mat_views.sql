CREATE MATERIALIZED VIEW itineraries AS
SELECT
    json_build_object(
        'id', f.id,
        'duration', f.duration::text,
        'from', from_.code,
        'to', to_.code,
        'departure', f.departure,
        'arrival', f.arrival
    ) AS flight1,
    NULL::json AS flight2,
    f.duration::text AS tot_duration,
    NULL::text AS stop_time
FROM flights f
JOIN routes r ON f.route = r.id
JOIN airports from_ ON r.from_airport = from_.id
JOIN airports to_ ON r.to_airport = to_.id

UNION ALL

SELECT
    json_build_object(
        'id', f1.id,
        'duration', f1.duration::text,
        'from', flight1_from_.code,
        'to', flight1_to_.code,
        'departure', f1.departure,
        'arrival', f1.arrival
    ) AS flight1,
    json_build_object(
        'id', f2.id,
        'duration', f2.duration::text,
        'from', flight2_from_.code,
        'to', flight2_to_.code,
        'departure', f2.departure,
        'arrival', f2.arrival
    ) AS flight2,
    (f1.duration + f2.duration)::text AS tot_duration,
    (f2.departure - f1.arrival)::text AS stop_time
FROM flights f1
JOIN routes r1 ON f1.route = r1.id
JOIN routes r2 ON r2.from_airport = r1.to_airport
JOIN flights f2 ON f2.route = r2.id

JOIN airports flight1_from_ ON r1.from_airport = flight1_from_.id
JOIN airports flight1_to_ ON r1.to_airport = flight1_to_.id
JOIN airports flight2_from_ ON r2.from_airport = flight2_from_.id
JOIN airports flight2_to_ ON r2.to_airport = flight2_to_.id

WHERE f2.departure > f1.arrival + INTERVAL '2 hour'
AND r2.to_airport <> r1.from_airport;
