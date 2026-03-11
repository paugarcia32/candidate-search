import contextlib
import os

from dotenv import load_dotenv
from psycopg2.pool import ThreadedConnectionPool

load_dotenv()

_pool = ThreadedConnectionPool(1, 5, dsn=os.environ["DATABASE_URL"])


@contextlib.contextmanager
def get_conn():
    conn = _pool.getconn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        _pool.putconn(conn)
