import redis
import json
from typing import Optional, Any
from app.core.settings import settings
from app.core.logger import logger

class RedisCache:
    def __init__(self):
        self.client = None
        self.enabled = False
        try:
            self.client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            self.client.ping()
            self.enabled = True
            logger.info("Connected to Redis successfully.")
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}. Caching is disabled (falling back to direct computation).")

    def get(self, key: str) -> Optional[Any]:
        if not self.enabled or not self.client:
            return None
        try:
            data = self.client.get(key)
            if data:
                return json.loads(data)
        except Exception as e:
            logger.warning(f"Error reading from Redis cache: {e}")
        return None

    def set(self, key: str, value: Any, expire_seconds: int = 3600):
        if not self.enabled or not self.client:
            return
        try:
            self.client.setex(key, expire_seconds, json.dumps(value))
        except Exception as e:
            logger.warning(f"Error writing to Redis cache: {e}")

    def delete(self, key: str):
        if not self.enabled or not self.client:
            return
        try:
            self.client.delete(key)
        except Exception as e:
            logger.warning(f"Error deleting from Redis cache: {e}")

cache = RedisCache()
