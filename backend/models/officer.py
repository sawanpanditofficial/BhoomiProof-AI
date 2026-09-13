import json
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, String, Text
from database import Base


class Officer(Base):
    __tablename__ = "officers"

    id = Column(String(50), primary_key=True, index=True)
    officer_id = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(100), nullable=False)
    jurisdiction = Column(String(200), nullable=True)
    department = Column(String(200), nullable=True)
    email = Column(String(255), index=True, nullable=True)
    phone = Column(String(50), nullable=True)
    password_hash = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_super_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(String(100), default="Never")
    permissions = Column(Text, nullable=True)  # JSON-encoded dict of permissions

    def to_dict(self):
        perms = {}
        if self.permissions:
            try:
                perms = json.loads(self.permissions)
            except Exception:
                perms = {}
        return {
            "id": self.id,
            "officer_id": self.officer_id,
            "name": self.name,
            "role": self.role,
            "jurisdiction": self.jurisdiction or "",
            "department": self.department or "",
            "email": self.email or self.officer_id,
            "phone": self.phone or "",
            "is_active": self.is_active,
            "is_super_admin": self.is_super_admin,
            "created_at": self.created_at.isoformat() if self.created_at else "",
            "last_login": self.last_login or "Never",
            "permissions": perms,
        }
