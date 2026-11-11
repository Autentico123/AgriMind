"""Per-crop activity records.

Mirrors `database-design.md` §9.
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
    Text,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

if TYPE_CHECKING:
    from models.farms import Crop


class FarmRecord(Base):
    """One logged activity on a crop (§9)."""

    __tablename__ = "FarmRecords"

    record_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    crop_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("Crops.crop_id", ondelete="CASCADE"), nullable=False
    )
    activity_type: Mapped[str] = mapped_column(Text, nullable=False)
    activity_date: Mapped[date] = mapped_column(Date, nullable=False)
    quantity: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    unit: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    sync_version: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="1"
    )
    last_modified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_deleted: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    crop: Mapped[Crop] = relationship(back_populates="records")

    __table_args__ = (
        CheckConstraint(
            "activity_type IN "
            "('Planting','Irrigation','Fertilizer','Harvest','Pesticide','Pruning','Note')",
            name="activity_type_values",
        ),
        CheckConstraint(
            "unit IS NULL OR unit IN ('kg','L','sacks')", name="unit_values"
        ),
        Index(
            "ix_farmrecords_crop_activity_date",
            "crop_id",
            text("activity_date DESC"),
        ),
    )
