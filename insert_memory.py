import json
import os
import psycopg2
from psycopg2.extras import Json
from datetime import datetime

DB_CONFIG = {
    "host": os.getenv("POSTGRES_SERVER", "localhost"),
    "port": os.getenv("POSTGRES_PORT", "5433"),
    "database": os.getenv("POSTGRES_DB", "mcp_knowledge"),
    "user": os.getenv("POSTGRES_USER", "mcp_user"),
    "password": os.getenv("POSTGRES_PASSWORD", "")
}

data = {
    "dense_content": "Successfully implemented on-demand Supabase synchronization for DASHTU-SUPD-II using FastAPI and React. Addressed HTTP 400 (timestamp empty string formatting) and HTTP 409 (orphaned foreign key records in disposisi and tindak_lanjut) issues in SQLite extraction. Migrated 11 tables successfully.",
    "entities": ["Supabase", "SQLite", "FastAPI", "React", "DASHTU-SUPD-II", "PostgreSQL", "ETL"],
    "facts": [
      "Empty strings in SQLite timestamps cause HTTP 400 in Supabase.",
      "Orphaned records in SQLite cause HTTP 409 Foreign Key violation in Supabase.",
      "Supabase REST API resolution=merge-duplicates requires exact relational integrity."
    ],
    "outcome": "success"
}

conn = psycopg2.connect(**DB_CONFIG)
cursor = conn.cursor()
cursor.execute("""
    INSERT INTO ltm_memory (session_id, project, status, timestamp, data)
    VALUES (%s, %s, %s, %s, %s)
    ON CONFLICT (session_id) DO UPDATE SET
        project = EXCLUDED.project,
        status = EXCLUDED.status,
        timestamp = EXCLUDED.timestamp,
        data = EXCLUDED.data,
        updated_at = CURRENT_TIMESTAMP
""", (
    "dashtu_supd_ii_supabase_sync",
    "DASHTU-SUPD-II",
    "COMPLETED",
    datetime.now().isoformat(),
    Json(data)
))

# Also insert into memories table to comply with mcp-ltm-manager semantic search
cursor.execute("""
    INSERT INTO memories (namespace, key, content, metadata)
    VALUES (%s, %s, %s, %s)
""", (
    "dashtu_supd_ii",
    "supabase_sync_implementation",
    data["dense_content"],
    Json(data)
))

conn.commit()
print("Memory saved to ltm_memory and memories tables.")
