from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

STUDENT_DEMO_PIN = os.getenv("STUDENT_DEMO_PIN", "2026")
ADMIN_ID = os.getenv("ADMIN_ID", "collegeadmin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "CollegeDemo@2026")
AICTE_ADMIN_ID = os.getenv("AICTE_ADMIN_ID", "aicteadmin")
AICTE_ADMIN_PASSWORD = os.getenv("AICTE_ADMIN_PASSWORD", "AICTEDemo@2026")


@router.post("/student/login", response_model=schemas.TokenResponse)
def student_login(login: schemas.StudentLoginRequest, db: Session = Depends(get_db)):
    if login.demo_pin != STUDENT_DEMO_PIN:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid demo PIN")

    student = db.query(models.Student).filter(models.Student.demo_id == login.demo_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Demo ID not found — only predefined accounts are allowed")

    user = db.query(models.UserAccount).filter(
        models.UserAccount.student_id == student.id,
        models.UserAccount.role == "student"
    ).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account inactive")

    token = auth.create_access_token(
        data={"sub": str(user.id), "role": "student", "student_id": student.id},
        expires_delta=timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480")))
    )
    return schemas.TokenResponse(
        access_token=token, token_type="bearer", role="student",
        user_id=user.id, demo_id=student.demo_id, full_name=student.full_name
    )


@router.post("/admin/login", response_model=schemas.TokenResponse)
def admin_login(login: schemas.AdminLoginRequest, db: Session = Depends(get_db)):
    if login.admin_id != ADMIN_ID or login.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid administrator credentials")

    user = db.query(models.UserAccount).filter(
        models.UserAccount.username == ADMIN_ID,
        models.UserAccount.role == "admin"
    ).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Admin account not seeded. Run seed.py first.")

    token = auth.create_access_token(
        data={"sub": str(user.id), "role": "admin"},
        expires_delta=timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480")))
    )
    return schemas.TokenResponse(
        access_token=token, token_type="bearer", role="admin",
        user_id=user.id, full_name="College Administrator"
    )


@router.post("/aicte-admin/login", response_model=schemas.TokenResponse)
def aicte_admin_login(login: schemas.AicteAdminLoginRequest, db: Session = Depends(get_db)):
    if login.admin_id != AICTE_ADMIN_ID or login.password != AICTE_ADMIN_PASSWORD:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid AICTE administrator credentials")

    user = db.query(models.UserAccount).filter(
        models.UserAccount.username == AICTE_ADMIN_ID,
        models.UserAccount.role == "aicte_admin"
    ).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AICTE administrator account not seeded. Run seed.py first.",
        )

    token = auth.create_access_token(
        data={"sub": str(user.id), "role": "aicte_admin"},
        expires_delta=timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480")))
    )
    return schemas.TokenResponse(
        access_token=token, token_type="bearer", role="aicte_admin",
        user_id=user.id, full_name="AICTE Administrator"
    )


@router.get("/me")
def get_me(current_user: models.UserAccount = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    resp = {"user_id": current_user.id, "role": current_user.role, "username": current_user.username}
    if current_user.student_id:
        student = db.query(models.Student).filter(models.Student.id == current_user.student_id).first()
        if student:
            resp.update({"demo_id": student.demo_id, "full_name": student.full_name, "student_id": student.id})
    return resp


@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
