from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class OrderItemBase(BaseModel):
    medicine_id: int
    quantity: int

class OrderItemSchema(OrderItemBase):
    id: int
    medicine_name: str
    unit_price: float
    subtotal: float

    class Config:
        from_attributes = True

class OrderSimpleSchema(BaseModel):
    id: int
    token: str
    status: str
    total_amount: Optional[float]
    created_at: datetime
    phone: Optional[str] = None

    class Config:
        from_attributes = True

class OrderDetailSchema(OrderSimpleSchema):
    items: List[OrderItemSchema] = []
    prescription_url: Optional[str] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    approved_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class OrderApprovalPayload(BaseModel):
    items: List[OrderItemBase]

class StatusUpdate(BaseModel):
    status: str

class AlertCreate(BaseModel):
    disease_name: str
    region: str
    threat_level: str  # e.g., Low, Medium, High

class SupportMessageBase(BaseModel):
    sender: str
    content: str

