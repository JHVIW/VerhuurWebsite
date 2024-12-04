from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, Literal, List
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str

class ProductBase(BaseModel):
    name: str
    description: str
    category: str
    price: dict
    stockTotal: int
    imageUrl: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: str
    stockAvailable: int

class Address(BaseModel):
    street: str
    city: str
    state: str
    zipCode: str
    country: str

class CustomerBase(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    homeAddress: Address
    deliveryAddress: Optional[Address] = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: str
    joinDate: str

class RentalItem(BaseModel):
    productId: str
    quantity: int
    dailyPrice: float
    deposit: float

class RentalBase(BaseModel):
    customerId: str
    items: List[RentalItem]
    startDate: str
    endDate: str
    totalPrice: float
    totalDeposit: float
    deliveryAddress: Optional[Address] = None

class RentalCreate(RentalBase):
    pass

class RentalUpdate(BaseModel):
    status: Optional[Literal['active', 'overdue', 'completed', 'cancelled']] = None
    items: Optional[List[RentalItem]] = None
    totalPrice: Optional[float] = None
    totalDeposit: Optional[float] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    deliveryAddress: Optional[Address] = None

class Rental(RentalBase):
    id: str
    status: Literal['active', 'overdue', 'completed', 'cancelled']