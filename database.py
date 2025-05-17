from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Text, DateTime, func
from databases import Database

DATABASE_URL = "postgresql+asyncpg://postgres:Password%40246@localhost:5432/chatapp"


database = Database(DATABASE_URL)
metadata = MetaData()

messages = Table(
    "messages",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String(100)),
    Column("message", Text),
    Column("timestamp", DateTime, default=func.now()),
)

# Create sync engine for initial table creation
engine = create_engine(DATABASE_URL.replace("asyncpg", "psycopg2"))
metadata.create_all(engine)