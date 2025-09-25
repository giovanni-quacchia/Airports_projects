from sqlalchemy import text
from app.extensions import db

def create_views():
    with open("app/DB/views.sql", "r") as file:
        sql_commands = file.read()
    if sql_commands.strip():
        db.session.execute(text(sql_commands))
        db.session.commit()

def drop_views():
    query = text("DROP VIEW IF EXISTS airlines_public")
    db.session.execute(query)
    db.session.commit()

def create_materialized_views():
    with open("app/DB/mat_views.sql", "r") as file:
        sql_commands = file.read()
    if sql_commands.strip():
        db.session.execute(text(sql_commands))
        db.session.commit()

def drop_materialized_views():
    query = text("DROP MATERIALIZED VIEW IF EXISTS itineraries")
    db.session.execute(query)
    db.session.commit()