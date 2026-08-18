import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

client = MongoClient(MONGODB_URL)

db = client["bkr_db"]

print(f"--- DB INIT ---")
print(f"Connected to cluster. Databases: {client.list_database_names()}")
print(f"Using database: {db.name}")
print(f"Collections found: {db.list_collection_names()}")
print(f"----------------")