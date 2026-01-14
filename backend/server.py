from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import barcode as barcode_lib
from barcode.writer import ImageWriter
from io import BytesIO
import base64

# --------------------------------------------------
# Environment setup
# --------------------------------------------------

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.getenv("MONGO_URL")
db_name = os.getenv("DB_NAME")

if not mongo_url or not db_name:
    raise RuntimeError("MONGO_URL or DB_NAME not set in environment")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# --------------------------------------------------
# FastAPI app
# --------------------------------------------------

app = FastAPI(title="Inventory API")
api_router = APIRouter(prefix="/api")

# --------------------------------------------------
# Models
# --------------------------------------------------

class ItemCreate(BaseModel):
    name: str


class ItemHistory(BaseModel):
    action: str
    timestamp: str


class Item(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    name: str
    barcode: str
    status: str
    created_at: str
    checked_in_at: Optional[str] = None
    checked_out_at: Optional[str] = None
    history: List[ItemHistory] = []

# --------------------------------------------------
# Routes
# --------------------------------------------------

@api_router.post("/items", response_model=Item)
async def create_item(item_input: ItemCreate):
    item_id = str(uuid.uuid4())
    barcode_value = f"INV{item_id[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()

    item_doc = {
        "id": item_id,
        "name": item_input.name,
        "barcode": barcode_value,
        "status": "in",
        "created_at": now,
        "checked_in_at": now,
        "checked_out_at": None,
        "history": [
            {"action": "created", "timestamp": now}
        ]
    }

    await db.items.insert_one(item_doc)
    return Item(**item_doc)


@api_router.get("/items", response_model=List[Item])
async def get_items(
    search: Optional[str] = None,
    status: Optional[str] = None
):
    query = {}

    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"barcode": {"$regex": search, "$options": "i"}}
        ]

    if status and status != "all":
        query["status"] = status

    items = await db.items.find(query, {"_id": 0}).to_list(1000)
    return [Item(**item) for item in items]


@api_router.get("/items/{barcode_value}", response_model=Item)
async def get_item(barcode_value: str):
    item = await db.items.find_one(
        {"barcode": barcode_value},
        {"_id": 0}
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return Item(**item)


@api_router.post("/items/{barcode_value}/checkin", response_model=Item)
async def checkin_item(barcode_value: str):
    item = await db.items.find_one({"barcode": barcode_value})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if item["status"] == "in":
        raise HTTPException(status_code=400, detail="Item is already checked in")

    now = datetime.now(timezone.utc).isoformat()
    history_entry = {"action": "checked_in", "timestamp": now}

    await db.items.update_one(
        {"barcode": barcode_value},
        {
            "$set": {
                "status": "in",
                "checked_in_at": now
            },
            "$push": {"history": history_entry}
        }
    )

    updated_item = await db.items.find_one(
        {"barcode": barcode_value},
        {"_id": 0}
    )
    return Item(**updated_item)


@api_router.post("/items/{barcode_value}/checkout", response_model=Item)
async def checkout_item(barcode_value: str):
    item = await db.items.find_one({"barcode": barcode_value})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if item["status"] == "out":
        raise HTTPException(status_code=400, detail="Item is already checked out")

    now = datetime.now(timezone.utc).isoformat()
    history_entry = {"action": "checked_out", "timestamp": now}

    await db.items.update_one(
        {"barcode": barcode_value},
        {
            "$set": {
                "status": "out",
                "checked_out_at": now
            },
            "$push": {"history": history_entry}
        }
    )

    updated_item = await db.items.find_one(
        {"barcode": barcode_value},
        {"_id": 0}
    )
    return Item(**updated_item)

@api_router.delete("/items/{barcode_value}", status_code=204)
async def delete_item(barcode_value: str):
    item = await db.items.find_one({"barcode": barcode_value})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    await db.items.delete_one({"barcode": barcode_value})
    return

@api_router.get("/items/{barcode_value}/barcode-image")
async def get_barcode_image(barcode_value: str):
    try:
        CODE128 = barcode_lib.get_barcode_class("code128")
        code128 = CODE128(barcode_value, writer=ImageWriter())

        buffer = BytesIO()
        code128.write(buffer)
        buffer.seek(0)

        image_base64 = base64.b64encode(buffer.read()).decode("utf-8")
        return {
            "image": f"data:image/png;base64,{image_base64}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --------------------------------------------------
# App setup
# --------------------------------------------------

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
