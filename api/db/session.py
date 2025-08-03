from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "postgresql://postgres:12345678@localhost:5432/analytics_db"
engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
