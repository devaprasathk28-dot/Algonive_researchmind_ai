from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.database import schemas
from app.auth.dependencies import get_current_user_optional
from app.workspaces import workspace_crud

router = APIRouter()

@router.post("/workspaces", response_model=schemas.Workspace)
def create_new_workspace(
    payload: schemas.WorkspaceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to create a workspace"
        )
    return workspace_crud.create_workspace(
        db,
        user_id=current_user.id,
        name=payload.name,
        description=payload.description or ""
    )

@router.get("/workspaces/{user_id}", response_model=List[schemas.Workspace])
def get_user_workspaces(
    user_id: int,
    db: Session = Depends(get_db)
):
    return workspace_crud.get_workspaces(db, user_id=user_id)

@router.delete("/workspaces/{workspace_id}")
def delete_workspace(
    workspace_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    # Verify workspace exists and belongs to user
    workspace = workspace_crud.get_workspace(db, workspace_id)
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    if current_user and workspace.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this workspace"
        )
        
    success = workspace_crud.delete_workspace(db, workspace_id)
    return {"success": success}

@router.get("/workspaces/{workspace_id}/stats")
def get_workspace_statistics(
    workspace_id: int,
    db: Session = Depends(get_db)
):
    return workspace_crud.get_workspace_stats(db, workspace_id)

@router.post("/workspaces/suggest/{user_id}")
def suggest_workspace(
    user_id: int,
    parsed_paper: dict,
    db: Session = Depends(get_db)
):
    from app.workspaces import workspace_pipeline
    return workspace_pipeline.classify_paper_workspace_suggestion(db, user_id, parsed_paper)

@router.post("/workspaces/assign/{paper_id}/{workspace_id}")
def assign_paper_to_workspace(
    paper_id: int,
    workspace_id: int,
    db: Session = Depends(get_db)
):
    from app.database import models
    paper = db.query(models.ResearchPaper).filter(models.ResearchPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    paper.workspace_id = workspace_id
    db.commit()
    db.refresh(paper)
    return {"success": True, "workspace_id": workspace_id}


