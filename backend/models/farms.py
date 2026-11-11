"""Farms, crops and the crop-type lookup tables.

Mirrors `database-design.md` §2–§5.
"""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from models.records import FarmRecord
    from models.recommendations import AIRecommendation
    from models.users import User


class Farm(Base, TimestampMixin):
    """A physical location owned by a farmer (§2)."""

    __tablename__ = "Farms"

    farm_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("Users.user_id", ondelete="RESTRICT"), nullable=False
    )
    farm_name: Mapped[str] = mapped_column(String(150), nullable=False)
    latitude: Mapped[Decimal] = mapped_column(Numeric(10, 8), nullable=False)
    longitude: Mapped[Decimal] = mapped_column(Numeric(11, 8), nullable=False)
    address: Mapped[str | None] = mapped_column(Text)
    farm_size: Mapped[Decimal | None] = mapped_column(Numeric(8, 2))
    farm_size_unit: Mapped[str | None] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)
    sync_version: Mapped[int] = mapped_column(Integer, nullable=False, server_default="1")
    last_modified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_deleted: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    restored_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    owner: Mapped[User] = relationship(back_populates="farms")
    crops: Mapped[list[Crop]] = relationship(
        back_populates="farm", foreign_keys="Crop.farm_id"
    )

    __table_args__ = (
        CheckConstraint(
            "farm_size_unit IN ('Hectares','Acres')", name="farm_size_unit_values"
        ),
        # Farm name unique per farmer among active farms (§A.2)
        Index(
            "uq_farms_user_id_farm_name_active",
            "user_id",
            "farm_name",
            unique=True,
            postgresql_where=text("is_deleted = false"),
        ),
        Index("ix_farms_user_id_is_deleted", "user_id", "is_deleted"),
        Index("ix_farms_user_id_farm_name", "user_id", "farm_name"),
    )


class CropType(Base, TimestampMixin):
    """Master list of crops, admin-managed (§3)."""

    __tablename__ = "CropTypes"

    crop_type_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    crop_name: Mapped[str] = mapped_column(String(100), nullable=False)
    scientific_name: Mapped[str | None] = mapped_column(String(150))
    description: Mapped[str | None] = mapped_column(Text)
    default_growing_days: Mapped[int | None] = mapped_column(Integer)

    stages: Mapped[list[GrowthStage]] = relationship(back_populates="crop_type")
    crops: Mapped[list[Crop]] = relationship(back_populates="crop_type")


class GrowthStage(Base):
    """Ordered, crop-type-specific growth stages (§4)."""

    __tablename__ = "GrowthStages"

    growth_stage_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    crop_type_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("CropTypes.crop_type_id", ondelete="RESTRICT"),
        nullable=False,
    )
    stage_name: Mapped[str] = mapped_column(String(100), nullable=False)
    sequence_order: Mapped[int] = mapped_column(Integer, nullable=False)
    typical_duration_days: Mapped[int | None] = mapped_column(Integer)
    is_risk_sensitive: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    description: Mapped[str | None] = mapped_column(Text)

    crop_type: Mapped[CropType] = relationship(back_populates="stages")

    __table_args__ = (
        UniqueConstraint(
            "crop_type_id", "sequence_order", name="uq_growthstages_type_sequence"
        ),
    )


class Crop(Base, TimestampMixin):
    """A crop planted on a farm (§5)."""

    __tablename__ = "Crops"

    crop_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    farm_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("Farms.farm_id", ondelete="CASCADE"), nullable=False
    )
    crop_type_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("CropTypes.crop_type_id", ondelete="RESTRICT"),
        nullable=False,
    )
    variety: Mapped[str | None] = mapped_column(String(100))
    planting_date: Mapped[date] = mapped_column(Date, nullable=False)
    expected_harvest_date: Mapped[date | None] = mapped_column(Date)
    growth_stage_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("GrowthStages.growth_stage_id", ondelete="RESTRICT"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default="Growing")
    health_status: Mapped[str] = mapped_column(
        Text, nullable=False, server_default="Healthy"
    )
    risk_level: Mapped[str] = mapped_column(
        Text, nullable=False, server_default="Low"
    )
    sync_version: Mapped[int] = mapped_column(Integer, nullable=False, server_default="1")
    last_modified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_deleted: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    restored_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    deleted_by_farm_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("Farms.farm_id", ondelete="SET NULL")
    )

    farm: Mapped[Farm] = relationship(back_populates="crops", foreign_keys=[farm_id])
    crop_type: Mapped[CropType] = relationship(back_populates="crops")
    records: Mapped[list[FarmRecord]] = relationship(back_populates="crop")
    recommendations: Mapped[list[AIRecommendation]] = relationship(
        back_populates="crop"
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('Growing','Harvested','Failed')", name="crop_status_values"
        ),
        CheckConstraint(
            "health_status IN ('Healthy','At Risk','Critical')",
            name="health_status_values",
        ),
        CheckConstraint(
            "risk_level IN ('Low','Moderate','High','Extreme')",
            name="risk_level_values",
        ),
        Index("ix_crops_farm_id_is_deleted", "farm_id", "is_deleted"),
        Index("ix_crops_crop_type_id", "crop_type_id"),
        Index("ix_crops_growth_stage_id", "growth_stage_id"),
        Index("ix_crops_deleted_by_farm_id", "deleted_by_farm_id"),
    )
