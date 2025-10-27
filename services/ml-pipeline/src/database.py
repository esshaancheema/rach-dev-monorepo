import sqlalchemy as sa
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from databases import Database
from .config import settings

# Create database URL
DATABASE_URL = settings.DATABASE_URL

# Create database instance
database = Database(DATABASE_URL)

# Create SQLAlchemy engine
engine = sa.create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Create metadata
metadata = sa.MetaData()

# Define tables
ml_models = sa.Table(
    "ml_models",
    metadata,
    sa.Column("id", sa.String, primary_key=True),
    sa.Column("model_type", sa.String, nullable=False),
    sa.Column("version", sa.String, nullable=False),
    sa.Column("status", sa.String, nullable=False),
    sa.Column("performance_metrics", sa.JSON),
    sa.Column("training_date", sa.DateTime),
    sa.Column("deployment_date", sa.DateTime),
    sa.Column("feature_names", sa.JSON),
    sa.Column("target_names", sa.JSON),
    sa.Column("hyperparameters", sa.JSON),
    sa.Column("model_path", sa.String),
    sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    sa.Column("updated_at", sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
)

predictions = sa.Table(
    "predictions",
    metadata,
    sa.Column("id", sa.String, primary_key=True),
    sa.Column("model_id", sa.String, sa.ForeignKey("ml_models.id")),
    sa.Column("model_type", sa.String, nullable=False),
    sa.Column("user_id", sa.String),
    sa.Column("project_id", sa.String),
    sa.Column("features", sa.JSON, nullable=False),
    sa.Column("predictions", sa.JSON, nullable=False),
    sa.Column("confidence_scores", sa.JSON),
    sa.Column("metadata", sa.JSON),
    sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
)

training_jobs = sa.Table(
    "training_jobs",
    metadata,
    sa.Column("id", sa.String, primary_key=True),
    sa.Column("model_type", sa.String, nullable=False),
    sa.Column("status", sa.String, nullable=False),
    sa.Column("progress", sa.Float, default=0.0),
    sa.Column("training_config", sa.JSON),
    sa.Column("hyperparameters", sa.JSON),
    sa.Column("performance_metrics", sa.JSON),
    sa.Column("error_message", sa.Text),
    sa.Column("results", sa.JSON),
    sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    sa.Column("started_at", sa.DateTime),
    sa.Column("completed_at", sa.DateTime),
)

data_ingestion_jobs = sa.Table(
    "data_ingestion_jobs",
    metadata,
    sa.Column("id", sa.String, primary_key=True),
    sa.Column("source", sa.String, nullable=False),
    sa.Column("data_type", sa.String, nullable=False),
    sa.Column("status", sa.String, nullable=False),
    sa.Column("progress", sa.Float, default=0.0),
    sa.Column("source_config", sa.JSON),
    sa.Column("target_location", sa.String),
    sa.Column("transformation_rules", sa.JSON),
    sa.Column("records_processed", sa.Integer, default=0),
    sa.Column("error_message", sa.Text),
    sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    sa.Column("started_at", sa.DateTime),
    sa.Column("completed_at", sa.DateTime),
)

feature_stores = sa.Table(
    "feature_stores",
    metadata,
    sa.Column("id", sa.String, primary_key=True),
    sa.Column("feature_group", sa.String, nullable=False),
    sa.Column("feature_name", sa.String, nullable=False),
    sa.Column("feature_type", sa.String, nullable=False),
    sa.Column("description", sa.Text),
    sa.Column("feature_definition", sa.JSON),
    sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    sa.Column("updated_at", sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
)

model_performance_logs = sa.Table(
    "model_performance_logs",
    metadata,
    sa.Column("id", sa.String, primary_key=True),
    sa.Column("model_id", sa.String, sa.ForeignKey("ml_models.id")),
    sa.Column("model_type", sa.String, nullable=False),
    sa.Column("period", sa.String, nullable=False),
    sa.Column("metrics", sa.JSON),
    sa.Column("drift_detection", sa.JSON),
    sa.Column("prediction_distribution", sa.JSON),
    sa.Column("error_analysis", sa.JSON),
    sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
)

# Database dependency
async def get_database():
    return database

# Helper functions
async def execute_query(query, values=None):
    """Execute a query and return results"""
    return await database.fetch_all(query=query, values=values)

async def execute_one(query, values=None):
    """Execute a query and return one result"""
    return await database.fetch_one(query=query, values=values)

async def execute_insert(query, values=None):
    """Execute an insert query"""
    return await database.execute(query=query, values=values)

async def execute_update(query, values=None):
    """Execute an update query"""
    return await database.execute(query=query, values=values)

async def execute_delete(query, values=None):
    """Execute a delete query"""
    return await database.execute(query=query, values=values)