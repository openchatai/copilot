CREATE TABLE pdf_data_sources (
  id VARCHAR(255) PRIMARY KEY,
  chatbot_id VARCHAR(255),
  files JSON, 
  files_info JSON,
  folder_name VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  ingest_status VARCHAR(255)
);