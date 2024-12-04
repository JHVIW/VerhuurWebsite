from fastapi import FastAPI, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import json
import os
from datetime import datetime, timedelta
from typing import List, Optional
from pathlib import Path
from uuid import uuid4

from models import (
    Product, ProductCreate,
    Customer, CustomerCreate,
    Rental, RentalCreate, RentalUpdate,
    User, UserCreate,
    Token, TokenData,
    LoginRequest
)
from auth import (
    get_current_user,
    create_access_token,
    verify_password,
    get_password_hash,
    oauth2_scheme
)

# Create data directory if it doesn't exist
DATA_DIR = Path("backend/data")
DATA_DIR.mkdir(exist_ok=True)

# Initialize data files if they don't exist
def init_data_file(filename: str, initial_data: list = None):
    file_path = DATA_DIR / filename
    if not file_path.exists():
        with open(file_path, 'w') as f:
            json.dump(initial_data or [], f)

# Initialize all data files
init_data_file("products.json")
init_data_file("customers.json")
init_data_file("rentals.json")
init_data_file("users.json", [
    {
        "id": "1",
        "email": "admin@example.com",
        "name": "Admin User",
        "role": "admin",
        "hashed_password": get_password_hash("admin")
    }
])

app = FastAPI(title="Rental Management System API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data access functions
def read_json_file(filename: str) -> list:
    with open(DATA_DIR / filename, 'r') as f:
        return json.load(f)

def write_json_file(filename: str, data: list):
    with open(DATA_DIR / filename, 'w') as f:
        json.dump(data, f, indent=2)

# Auth endpoints
@app.post("/api/auth/token", response_model=Token)
async def login_for_access_token(email: str = Form(...), password: str = Form(...)):
    users = read_json_file("users.json")
    user = next((u for u in users if u["email"] == email), None)
    
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

# Products endpoints
@app.get("/api/products", response_model=List[Product])
async def get_products(current_user: User = Depends(get_current_user)):
    return read_json_file("products.json")

@app.post("/api/products", response_model=Product)
async def create_product(product: ProductCreate, current_user: User = Depends(get_current_user)):
    products = read_json_file("products.json")
    new_product = {
        "id": str(uuid4()),
        **product.dict(),
        "stockAvailable": product.stockTotal
    }
    products.append(new_product)
    write_json_file("products.json", products)
    return new_product

@app.put("/api/products/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_update: ProductCreate,
    current_user: User = Depends(get_current_user)
):
    products = read_json_file("products.json")
    product_idx = next((i for i, p in enumerate(products) if p["id"] == product_id), None)
    
    if product_idx is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Preserve the current stockAvailable value
    current_stock_available = products[product_idx].get("stockAvailable", 0)
    stock_difference = product_update.stockTotal - products[product_idx]["stockTotal"]
    new_stock_available = current_stock_available + stock_difference
    
    updated_product = {
        **products[product_idx],
        **product_update.dict(),
        "id": product_id,
        "stockAvailable": new_stock_available
    }
    products[product_idx] = updated_product
    write_json_file("products.json", products)
    return updated_product

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: str, current_user: User = Depends(get_current_user)):
    products = read_json_file("products.json")
    products = [p for p in products if p["id"] != product_id]
    write_json_file("products.json", products)
    return {"message": "Product deleted"}

# Customers endpoints
@app.get("/api/customers", response_model=List[Customer])
async def get_customers(current_user: User = Depends(get_current_user)):
    return read_json_file("customers.json")

@app.post("/api/customers", response_model=Customer)
async def create_customer(customer: CustomerCreate, current_user: User = Depends(get_current_user)):
    customers = read_json_file("customers.json")
    new_customer = {
        "id": str(uuid4()),
        **customer.dict(),
        "joinDate": datetime.now().isoformat()
    }
    customers.append(new_customer)
    write_json_file("customers.json", customers)
    return new_customer

@app.put("/api/customers/{customer_id}", response_model=Customer)
async def update_customer(
    customer_id: str,
    customer_update: CustomerCreate,
    current_user: User = Depends(get_current_user)
):
    customers = read_json_file("customers.json")
    customer_idx = next((i for i, c in enumerate(customers) if c["id"] == customer_id), None)
    
    if customer_idx is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    updated_customer = {
        **customers[customer_idx],
        **customer_update.dict(),
        "id": customer_id
    }
    customers[customer_idx] = updated_customer
    write_json_file("customers.json", customers)
    return updated_customer

@app.delete("/api/customers/{customer_id}")
async def delete_customer(customer_id: str, current_user: User = Depends(get_current_user)):
    customers = read_json_file("customers.json")
    customers = [c for c in customers if c["id"] != customer_id]
    write_json_file("customers.json", customers)
    return {"message": "Customer deleted"}

# Rentals endpoints
@app.get("/api/rentals", response_model=List[Rental])
async def get_rentals(current_user: User = Depends(get_current_user)):
    return read_json_file("rentals.json")

@app.post("/api/rentals", response_model=Rental)
async def create_rental(rental: RentalCreate, current_user: User = Depends(get_current_user)):
    rentals = read_json_file("rentals.json")
    products = read_json_file("products.json")
    
    # Check product availability and update stock for each item
    for item in rental.items:
        product_idx = next((i for i, p in enumerate(products) if p["id"] == item.productId), None)
        if product_idx is None:
            raise HTTPException(status_code=404, detail=f"Product {item.productId} not found")
        
        if products[product_idx]["stockAvailable"] < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for product {products[product_idx]['name']}"
            )
        
        # Decrease available stock
        products[product_idx]["stockAvailable"] -= item.quantity
    
    # Save updated product stock
    write_json_file("products.json", products)
    
    new_rental = {
        "id": str(uuid4()),
        **rental.dict(),
        "status": "active"
    }
    rentals.append(new_rental)
    write_json_file("rentals.json", rentals)
    return new_rental

@app.put("/api/rentals/{rental_id}", response_model=Rental)
async def update_rental(
    rental_id: str,
    rental_update: RentalUpdate,
    current_user: User = Depends(get_current_user)
):
    rentals = read_json_file("rentals.json")
    products = read_json_file("products.json")
    
    rental_idx = next((i for i, r in enumerate(rentals) if r["id"] == rental_id), None)
    if rental_idx is None:
        raise HTTPException(status_code=404, detail="Rental not found")
    
    current_rental = rentals[rental_idx]
    
    # If status is being updated to completed
    if rental_update.status == "completed" and current_rental["status"] != "completed":
        # Return items to stock
        for item in current_rental["items"]:
            product_idx = next((i for i, p in enumerate(products) if p["id"] == item["productId"]), None)
            if product_idx is not None:
                products[product_idx]["stockAvailable"] += item["quantity"]
        write_json_file("products.json", products)
    
    updated_rental = {
        **current_rental,
        **(rental_update.dict(exclude_unset=True)),
        "id": rental_id
    }
    rentals[rental_idx] = updated_rental
    write_json_file("rentals.json", rentals)
    return updated_rental

@app.delete("/api/rentals/{rental_id}")
async def delete_rental(rental_id: str, current_user: User = Depends(get_current_user)):
    rentals = read_json_file("rentals.json")
    rental = next((r for r in rentals if r["id"] == rental_id), None)
    
    if rental and rental["status"] == "active":
        # Return items to stock
        products = read_json_file("products.json")
        for item in rental["items"]:
            product_idx = next((i for i, p in enumerate(products) if p["id"] == item["productId"]), None)
            if product_idx is not None:
                products[product_idx]["stockAvailable"] += item["quantity"]
        write_json_file("products.json", products)
    
    rentals = [r for r in rentals if r["id"] != rental_id]
    write_json_file("rentals.json", rentals)
    return {"message": "Rental deleted"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)