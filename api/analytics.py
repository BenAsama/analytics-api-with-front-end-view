from fastapi import APIRouter, Depends, Query
from sqlmodel import select, Session
from sqlalchemy import func
from datetime import datetime
from typing import Optional

from api.db.session import get_session
from .models import EventModel

router = APIRouter()

def parse_date(date_str: Optional[str]) -> Optional[datetime]:
    if date_str:
        try:
            return datetime.fromisoformat(date_str)
        except ValueError:
            return None
    return None

@router.get("/pages")
def get_page_stats(
    start: Optional[str] = Query(None), 
    end: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    start_dt = parse_date(start)
    end_dt = parse_date(end)

    query = (
        select(
            EventModel.page,
            func.count().label("views"),
            func.avg(EventModel.duration).label("avg_duration")
        )
        .group_by(EventModel.page)
        .order_by(func.count().desc())
    )

    if start_dt:
        query = query.where(EventModel.time >= start_dt)
    if end_dt:
        query = query.where(EventModel.time <= end_dt)

    return session.exec(query).fetchall()

@router.get("/summary")
def get_event_summary(
    start: Optional[str] = Query(None),
    end: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    start_dt = parse_date(start)
    end_dt = parse_date(end)

    query = select(
        func.count().label("total_events"),
        func.avg(EventModel.duration).label("avg_duration")
    )

    if start_dt:
        query = query.where(EventModel.time >= start_dt)
    if end_dt:
        query = query.where(EventModel.time <= end_dt)

    return session.exec(query).first()

@router.get("/top-pages")
def get_top_pages(
    limit: int = 5,
    start: Optional[str] = Query(None),
    end: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    start_dt = parse_date(start)
    end_dt = parse_date(end)

    query = (
        select(
            EventModel.page,
            func.count().label("views")
        )
        .group_by(EventModel.page)
        .order_by(func.count().desc())
        .limit(limit)
    )

    if start_dt:
        query = query.where(EventModel.time >= start_dt)
    if end_dt:
        query = query.where(EventModel.time <= end_dt)

    return session.exec(query).fetchall()
