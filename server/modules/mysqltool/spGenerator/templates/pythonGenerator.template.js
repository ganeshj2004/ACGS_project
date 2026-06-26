export function generatePythonStack(meta) {
  const parent = meta.parent || {};
  const table = parent.table || "YOUR_TABLE";
  
  return `
# GENERATED PYTHON (FASTAPI) STACK FOR: ${table}
# Created at: ${new Date().toLocaleString()}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import get_db

router = APIRouter(prefix="/${table.toLowerCase()}", tags=["${table}"])

@router.get("/")
def get_all(db: Session = Depends(get_db)):
    return db.execute("SELECT * FROM ${table}").fetchall()

@router.post("/save")
def create_record(data: dict, db: Session = Depends(get_db)):
    # Calling the SQL Stored Procedure
    db.execute(f"CALL ${parent.name}(... )")
    db.commit()
    return {"status": "success", "message": "Record saved using Python/FastAPI"}
`;
}
