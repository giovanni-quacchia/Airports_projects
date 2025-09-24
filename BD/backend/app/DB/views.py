from sqlalchemy import text
from app.extensions import db

def create_itineraries_view():
    query = text("""
        CREATE OR REPLACE VIEW itineraries AS
        SELECT 
            json_build_object(
                'id', f1.id,
                'code', f1.code,
                'departure', f1.departure,
                'arrival', f2.arrival,
                'airline', ai1.name,
                'from', a1.code,
                'to', a2.code
            ) AS flight1,
            json_build_object(
                'id', f2.id,
                'code', f2.code,
                'departure', f2.departure,
                'arrival', f2.arrival,
                'duration', f2.duration,
                'airline', ai2.name,
                'from', a3.code,
                'to', a4.code
            ) AS flight2
        FROM flights f1
        
        JOIN routes r1 ON f1.route = r1.id
        JOIN routes r2 ON r1.to_airport = r2.from_airport
        JOIN flights f2 ON r2.id = f2.route
        
        JOIN airports a1 ON r1.from_airport = a1.id
        JOIN airports a2 ON r1.to_airport = a2.id
        JOIN airports a3 ON r2.from_airport = a3.id
        JOIN airports a4 ON r2.to_airport = a4.id
        
        JOIN airlines ai1 ON f1.airline = ai1.id
        JOIN airlines ai2 ON f2.airline = ai2.id
        
        WHERE f2.departure > f1.arrival + INTERVAL '2 hour';
    """)
    db.session.execute(query)
    db.session.commit()
    
def drop_itineraries_view():
    query = text("DROP VIEW IF EXISTS itineraries")
    db.session.execute(query)
    db.session.commit()