"""Knowledge Base articles and weather rules.

Mirrors `database-design.md` §11, including the three named composite
constraints: `kb_rule_complete`, `kb_action_matches_category`, and
`kb_conditions_shape`.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from models.farms import CropType, GrowthStage
    from models.users import User

# The 12 documented action keys and the category each belongs to
# (`docs/ai-engine.md` §8.1). `kb_action_matches_category` enforces the pairing.
_ACTION_CATEGORY_PAIRS = (
    "('SKIP_IRRIGATION','Irrigation'),"
    "('IRRIGATE_NOW','Irrigation'),"
    "('DRAIN_FIELD','Irrigation'),"
    "('DELAY_FERTILIZER','Fertilizer'),"
    "('RESUME_FERTILIZER','Fertilizer'),"
    "('DELAY_PLANTING','Planting'),"
    "('PLANT_NOW','Planting'),"
    "('HARVEST_EARLY','Harvest'),"
    "('DELAY_HARVEST','Harvest'),"
    "('SHADE_OR_MIST','General'),"
    "('STAKE_OR_SUPPORT','General'),"
    "('MONITOR_AND_INSPECT','General')"
)


class KnowledgeBase(Base, TimestampMixin):
    """A prose article, optionally carrying a machine-readable rule (§11)."""

    __tablename__ = "KnowledgeBase"

    knowledge_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    crop_type_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("CropTypes.crop_type_id", ondelete="RESTRICT"),
        nullable=False,
    )
    growth_stage_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("GrowthStages.growth_stage_id", ondelete="RESTRICT")
    )
    category: Mapped[str] = mapped_column(Text, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    reference: Mapped[str | None] = mapped_column(String(255))
    # `none_as_null` is essential: a prose-only article must store SQL NULL, not
    # the JSON literal `null`, or `kb_rule_complete` and `kb_conditions_shape`
    # both reject the row. This is bind behaviour only — the DDL is unchanged.
    conditions: Mapped[dict | list | None] = mapped_column(
        JSONB(none_as_null=True)
    )
    action_key: Mapped[str | None] = mapped_column(Text)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, server_default="100")
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default="Draft")
    created_by: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("Users.user_id", ondelete="SET NULL")
    )

    crop_type: Mapped[CropType] = relationship()
    growth_stage: Mapped[GrowthStage | None] = relationship()
    author: Mapped[User | None] = relationship()

    __table_args__ = (
        CheckConstraint(
            "category IN ('Planting','Irrigation','Fertilizer','Harvest','General')",
            name="kb_category_values",
        ),
        CheckConstraint(
            "status IN ('Draft','Published','Archived')", name="kb_status_values"
        ),
        # A row is either prose-only (both null) or a complete rule (both set).
        CheckConstraint(
            "(conditions IS NULL AND action_key IS NULL) OR "
            "(conditions IS NOT NULL AND action_key IS NOT NULL)",
            name="kb_rule_complete",
        ),
        # The action must belong to the row's category.
        CheckConstraint(
            "action_key IS NULL OR (action_key, category) IN (" + _ACTION_CATEGORY_PAIRS + ")",
            name="kb_action_matches_category",
        ),
        # Every condition row uses a catalog metric and operator.
        CheckConstraint(
            "conditions IS NULL OR "
            "(jsonb_typeof(conditions) = 'array' AND NOT jsonb_path_exists(conditions, "
            "'$[*][*] ? (@.metric <> \"rain_probability\" && @.metric <> \"wind_speed\" "
            "&& @.metric <> \"temperature\" && @.metric <> \"humidity\")') AND "
            "NOT jsonb_path_exists(conditions, "
            "'$[*][*] ? (@.operator <> \"gte\" && @.operator <> \"lte\" "
            "&& @.operator <> \"between\")'))",
            name="kb_conditions_shape",
        ),
        Index("ix_knowledgebase_type_category", "crop_type_id", "category"),
        # Rule-engine resolution (partial index, §A.5)
        Index(
            "ix_knowledgebase_resolution",
            "crop_type_id",
            "category",
            "priority",
            postgresql_where=text(
                "conditions IS NOT NULL AND status = 'Published'"
            ),
        ),
        # Article search (§A.5)
        Index(
            "ix_knowledgebase_search",
            text("to_tsvector('english', title || ' ' || content)"),
            postgresql_using="gin",
        ),
    )
