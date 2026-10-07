import os
import sys

# Ensure UTF-8 output encoding on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

def get_connection_url():
    raw_url = os.getenv("DIRECT_URL") or os.getenv("DATABASE_URL")
    if not raw_url:
        print("ERROR: No DIRECT_URL or DATABASE_URL found in .env")
        sys.exit(1)

    raw_url = raw_url.strip('"').strip("'")
    
    # Handle password with '@' symbol if present:
    if (raw_url.startswith("postgresql://") or raw_url.startswith("postgres://")) and "%40" not in raw_url:
        prefix = "postgresql://" if raw_url.startswith("postgresql://") else "postgres://"
        rest = raw_url[len(prefix):]
        if "@" in rest:
            parts = rest.split("@")
            if len(parts) > 2:
                user_pass = "@".join(parts[:-1])
                host_part = parts[-1]
                if ":" in user_pass:
                    user, password = user_pass.split(":", 1)
                    raw_url = f"{prefix}{user}:{quote_plus(password)}@{host_part}"
    
    return raw_url

def run_migration():
    import psycopg2
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

    db_url = get_connection_url()
    clean_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
    if "?pgbouncer=true" in clean_url:
        clean_url = clean_url.replace("?pgbouncer=true", "")

    print(f"[PodLaunch] Connecting to Supabase PostgreSQL at {clean_url.split('@')[-1]}...")
    try:
        conn = psycopg2.connect(clean_url)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        schema_path = os.path.join(os.path.dirname(__file__), "..", "supabase", "schema.sql")
        seed_path = os.path.join(os.path.dirname(__file__), "..", "supabase", "seed.sql")

        if os.path.exists(schema_path):
            print(f"[PodLaunch] Applying schema from {schema_path}...")
            with open(schema_path, "r", encoding="utf-8") as f:
                schema_sql = f.read()
            cursor.execute(schema_sql)
            print("[OK] Schema migration successfully executed!")

        if os.path.exists(seed_path):
            print(f"[PodLaunch] Seeding initial data from {seed_path}...")
            with open(seed_path, "r", encoding="utf-8") as f:
                seed_sql = f.read()
            cursor.execute(seed_sql)
            print("[OK] Seed data successfully inserted!")

        # Verify created tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = [row[0] for row in cursor.fetchall()]
        print(f"\n[OK] Active Tables in Supabase Database:")
        for t in tables:
            cursor.execute(f"SELECT count(*) FROM public.{t};")
            count = cursor.fetchone()[0]
            print(f"  - public.{t} ({count} rows)")

        cursor.close()
        conn.close()
        print("\n[SUCCESS] Supabase Database Migration Completed Successfully!")

    except Exception as e:
        print(f"Migration Failed: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
