"""ORM models mirroring `docs/database-design.md` §1–§17.

Importing this package registers every table on `Base.metadata`, which is what
Alembic autogenerate compares against.
"""

from models.base import Base
from models.audit import AuditLog, SyncQueue
from models.farms import Crop, CropType, Farm, GrowthStage
from models.knowledge import KnowledgeBase
from models.notifications import Announcement, Notification
from models.recommendations import AIRecommendation
from models.records import FarmRecord
from models.users import Device, PasswordResetToken, User, UserSession
from models.weather import WeatherAlert, WeatherCache

__all__ = [
    "AIRecommendation",
    "Announcement",
    "AuditLog",
    "Base",
    "Crop",
    "CropType",
    "Device",
    "Farm",
    "FarmRecord",
    "GrowthStage",
    "KnowledgeBase",
    "Notification",
    "PasswordResetToken",
    "SyncQueue",
    "User",
    "UserSession",
    "WeatherAlert",
    "WeatherCache",
]
