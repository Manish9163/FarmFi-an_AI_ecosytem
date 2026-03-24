import mysql.connector
from mysql.connector import pooling
from config import Config

_pool = None

def get_pool():
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(
            pool_name="farmfi_pool",
            pool_size=10,
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            database=Config.DB_NAME,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            charset='utf8mb4',
            autocommit=False,
        )
    return _pool

def get_db():
    """Return a connection from the pool.  Use as context manager or call .close()."""
    return get_pool().get_connection()
