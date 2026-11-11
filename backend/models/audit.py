"""Append-only audit log and the offline sync outbox.

Mirrors `database-design.md` §16 and §17.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base

_EVENT_TYPES = (
    "('login','user_login_google','logout','user_created','user_updated',"
    "'user_deleted','user_activated','user_deactivated','user_role_changed',"
    "'knowledge_base_created','knowledge_base_updated','knowledge_base_deleted',"
    "'announcement_created','announcement_updated','announcement_deleted',"
    "'farmer_data_accessed')"
)


class AuditLog(Base):
    """Append-only admin and system action log (§16)."""

    __tablename__ = "AuditLogs"

    audit_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    performed_by: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("Users.user_id", ondelete="RESTRICT"), nullable=False
    )
    event_type: Mapped[str] = mapped_column(Text, nullable=False)
    target_table: Mapped[str | None] = mapped_column(String(100))
    target_id: Mapped[int | None] = mapped_column(BigInteger)
    description: Mapped[str | None] = mapped_column(Text)
    ip_address: Mapped[str | None] = mapped_column(String(45))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            f"event_type IN {_EVENT_TYPES}", name="audit_event_type_values"
        ),
        Index("ix_auditlogs_performed_by", "performed_by"),
        Index("ix_auditlogs_event_type", "event_type"),
        Index("ix_auditlogs_created_at", text("created_at DESC")),
    )


class SyncQueue(Base):
    """Offline mutation outbox written by the mobile app (§17)."""

    __tablename__ = "SyncQueue"

    sync_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("Users.user_id", ondelete="CASCADE"), nullable=False
    )
    table_name: Mapped[str] = mapped_column(String(100), nullable=False)
    record_id: Mapped[int | None] = mapped_column(BigInteger)
    operation: Mapped[str] = mapped_column(Text, nullable=False)
    payload: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default="Pending")
    retry_count: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    last_attempted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    error_message: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            "operation IN ('INSERT','UPDATE','DELETE')", name="sync_operation_values"
        ),
        CheckConstraint(
            "status IN ('Pending','Synced','Failed')", name="sync_status_values"
        ),
        Index("ix_syncqueue_status_created", "status", "created_at"),
        Index("ix_syncqueue_user_id", "user_id"),
    )
