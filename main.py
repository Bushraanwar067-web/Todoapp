# FastAPI Simple To-Do List Example
# This file demonstrates a basic CRUD API for a To-Do list using FastAPI.
# Students can use this as a starting point to learn about REST APIs and FastAPI features.

from fastapi import FastAPI 
from fastapi import Body

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from typing import List

import os
from pymongo import MongoClient


from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

client = MongoClient(os.getenv("DATABASE_URL"))
DB = client[str(os.getenv("DB_NAME"))]

# Create FastAPI app instance
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],  # Allow requests from any origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# Define the data model for a Todo item
class Todo(BaseModel): # Object representing a To-Do item
    id: str  # Unique identifier for the todo item
    task: str  # Description of the task
    done: bool = False  # Status of the task (default: not done)

# In-memory list to store todos
# In a real app, you would use a database
todos: List[Todo] = [

]

@app.post("/todo/add-item")
def add_item_in_todo(item: Todo):
    todos.append(item)

    print("\nCurrent Todos: ", todos)

    # Database insertion
    DB.todos.insert_one(dict(item))

    return {
        "message": "Item added successfully",
        "item": item,
        "success": True
    }

@app.get("/todo/get-items")
def get_items_from_todo():

    todos_items = []
    
    todos_from_db = DB.todos.find({
        # "done": False
    })
    # todos.clear()  # Clear the in-memory list to avoid duplicates
    for todo in todos_from_db:
        todo["_id"] = str(todo["_id"])  # Convert ObjectId to string
        todos_items.append(todo)


    return {
        "message": "Items retrieved successfully",
        "items": todos_items,
        "total_items": len(todos_items),
        "success": True
    }

        
@app.delete("/todo/delete-item/{item_id}")        
def delete_item_from_todo(item_id: str):
    # MongoDB delete
    result = DB.todos.delete_one({"id": item_id})

    if result.deleted_count > 0:
        return {
            "message": "Item deleted successfully",
            "item_id": item_id,
            "success": True
        }
    else:
        return {
            "message": "Item not found",
            "success": False
        }
    

@app.put("/todo/update-item/{item_id}")
def update_item_in_todo(item_id: str, done: bool = Body(...)):
    result = DB.todos.update_one(
        {"id": item_id}, {"$set": {"done": done}}
    )

    if result.modified_count > 0:
        return {
            "message": f"Task updated. Marked as {'done' if done else 'not done'}",
            "success": True,
            "item_id": item_id,
            "done": done
        }
    else:
        return {
            "message": "Task not found",
            "success": False
        }
     
        
# 1. pip install fastapi uvicorn pydantic
# 2. uvicorn main:app --reload
# 3. Open http://127.0.0.1:8000/docs for interactive API documentation




