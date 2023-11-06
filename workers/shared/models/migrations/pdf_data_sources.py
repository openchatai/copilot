from sqlalchemy import create_engine

# Assuming you have already imported the necessary SQLAlchemy modules and defined the PdfDataSource class

# Define the SQL to create the PdfDataSource table
create_table_sql = """
CREATE TABLE pdf_data_sources (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER REFERENCES chatbots(id),
    files JSON,
    files_info JSON,
    folder_name VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE ON UPDATE NOW(),
    ingest_status VARCHAR(255) DEFAULT 'success'
);
"""

# Define the SQL to create an index if needed
# create_index_sql = """
# CREATE INDEX pdf_data_sources_index ON pdf_data_sources (column_name);
# """

# Create a database connection and execute the SQL statements
engine = create_engine('your_database_connection_url')
conn = engine.connect()

try:
    conn.execute(create_table_sql)
    # Uncomment the following line to create an index if needed
    # conn.execute(create_index_sql)
finally:
    conn.close()
