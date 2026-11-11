"""Users, devices, sessions and password-reset tokens.

Mirrors `database-design.md` §1, §13, §14 and §15.
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, CreatedAtMixin, TimestampMixin

if TYPE_CHECKING:
    from models.farms import Farm


class User(Base, TimestampMixin):
    """Farmer and admin accounts (§1)."""

    __tablename__ = "Users"

    user_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str | None] = mapped_column(Text)
    auth_provider: Mapped[str] = mapped_column(
        Text, nullable=False, server_default="Local"
    )
    google_sub: Mapped[str | None] = mapped_column(String(255), unique=True)
    phone_number: Mapped[str | None] = mapped_column(String(20))
    profile_photo: Mapped[str | None] = mapped_column(Text)
    role: Mapped[str] = mapped_column(Text, nullable=False, server_default="Farmer")
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default="Active")
    preferred_language: Mapped[str] = mapped_column(
        Text, nullable=False, server_default="en"
    )
    is_deleted: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    farms: Mapped[list[Farm]] = relationship(back_populates="owner")
    devices: Mapped[list[Device]] = relationship(back_populates="user")
    sessions: Mapped[list[UserSession]] = relationship(back_populates="user")

    __table_args__ = (
        CheckConstraint(
            "auth_provider IN ('Local','Google')",
            name="auth_provider_values",
        ),
        CheckConstraint("role IN ('Farmer','Admin')", name="role_values"),
        CheckConstraint("status IN ('Active','Inactive')", name="status_values"),
        CheckConstraint(
            "preferred_language IN ('en','fil','ceb')", name="language_values"
        ),
        # users_auth_credential (database-design.md §A.4)
        CheckConstraint(
            "(auth_provider = 'Local' AND password_hash IS NOT NULL "
            "AND google_sub IS NULL) OR "
            "(auth_provider = 'Google' AND google_sub IS NOT NULL "
            "AND password_hash IS NULL AND role = 'Farmer')",
            name="users_auth_credential",
        ),
    )


class Device(Base):
    """Push tokens and multi-device support (§13)."""

    __tablename__ = "Devices"

    device_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("Users.user_id", ondelete="CASCADE"), nullable=False
    )
    device_name: Mapped[str | None] = mapped_column(String(100))
    platform: Mapped[str | None] = mapped_column(Text)
    push_token: Mapped[str | None] = mapped_column(Text, unique=True)
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship(back_populates="devices")

    __table_args__ = (
        CheckConstraint("platform IN ('Android','iOS')", name="platform_values"),
    )


class UserSession(Base):
    """Refresh-token-backed sessions (§14)."""

    __tablename__ = "UserSessions"

    session_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("Users.user_id", ondelete="CASCADE"), nullable=False
    )
    device_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("Devices.device_id", ondelete="SET NULL")
    )
    refresh_token_hash: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default="Active")
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ip_address: Mapped[str | None] = mapped_column(String(45))
    user_agent: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped[User] = relationship(back_populates="sessions")

    __table_args__ = (
        CheckConstraint(
            "status IN ('Active','Revoked','Expired')", name="session_status_values"
        ),
    )


class PasswordResetToken(Base, CreatedAtMixin):
    """One-time reset tokens; only hashes are stored (§15)."""

    __tablename__ = "PasswordResetTokens"

    reset_token_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("Users.user_id", ondelete="CASCADE"), nullable=False
    )
    token_hash: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
