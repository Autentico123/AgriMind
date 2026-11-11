"""In-app notifications and admin announcements.

Mirrors `database-design.md` §10 and §12.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from models.users import User


class Notification(Base):
    """One row in a farmer's feed (§10)."""

    __tablename__ = "Notifications"

    notification_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("Users.user_id", ondelete="CASCADE"), nullable=False
    )
    farm_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("Farms.farm_id", ondelete="CASCADE")
    )
    alert_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("WeatherAlerts.alert_id", ondelete="SET NULL")
    )
    announcement_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("Announcements.announcement_id", ondelete="CASCADE")
    )
    notification_type: Mapped[str] = mapped_column(Text, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str | None] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            "notification_type IN ('Weather Alert','AI Recommendation','Announcement')",
            name="notification_type_values",
        ),
        Index(
            "ix_notifications_user_read_created",
            "user_id",
            "is_read",
            text("created_at DESC"),
        ),
        Index("ix_notifications_farm_id", "farm_id"),
    )


class Announcement(Base, TimestampMixin):
    """Admin-published advisory or bulletin (§12)."""

    __tablename__ = "Announcements"

    announcement_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str | None] = mapped_column(Text)
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)
    created_by: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("Users.user_id", ondelete="SET NULL")
    )

    author: Mapped[User | None] = relationship()

    __table_args__ = (
        CheckConstraint(
            "category IS NULL OR category IN "
            "('Weather Advisory','Farming Tip','Agricultural Announcement','Seasonal Reminder')",
            name="announcement_category_values",
        ),
        Index("ix_announcements_window", "start_date", "end_date"),
    )
