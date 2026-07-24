from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from sqlalchemy import or_

from database import get_db
from models.organization import Organization

from schemas.organization import (
    OrganizationResponse,
    OrganizationUpdate
)


router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"]
)



# ==================================================
# GET ORGANIZATIONS
# GET /organizations
# ==================================================

@router.get(
    "",
    response_model=list[OrganizationResponse]
)
def get_organizations(
    search: str | None = None,
    db: Session = Depends(get_db)
):

    query = db.query(Organization)


    if search:
        query = query.filter(
            or_(
                Organization.name.ilike(
                    f"%{search}%"
                ),
                Organization.org_code.ilike(
                    f"%{search}%"
                )
            )
        )


    return query.all()



# ==================================================
# GET SINGLE ORGANIZATION
# GET /organizations/{id}
# ==================================================

@router.get(
    "/{organization_id}",
    response_model=OrganizationResponse
)
def get_organization(
    organization_id: UUID,
    db: Session = Depends(get_db)
):

    organization = (
        db.query(Organization)
        .filter(
            Organization.id == organization_id
        )
        .first()
    )


    if not organization:
        raise HTTPException(
            status_code=404,
            detail="Organization not found"
        )


    return organization



# ==================================================
# UPDATE ORGANIZATION
# PUT /organizations/{id}
# ==================================================

@router.put(
    "/{organization_id}",
    response_model=OrganizationResponse
)
def update_organization(
    organization_id: UUID,
    body: OrganizationUpdate,
    db: Session = Depends(get_db)
):

    organization = (
        db.query(Organization)
        .filter(
            Organization.id == organization_id
        )
        .first()
    )


    if not organization:
        raise HTTPException(
            status_code=404,
            detail="Organization not found"
        )


    if body.name is not None:
        organization.name = body.name


    if body.type is not None:
        organization.type = body.type


    if body.timezone is not None:
        organization.timezone = body.timezone


    if body.date_format is not None:
        organization.date_format = body.date_format


    if body.language is not None:
        organization.language = body.language


    db.commit()
    db.refresh(organization)


    return organization