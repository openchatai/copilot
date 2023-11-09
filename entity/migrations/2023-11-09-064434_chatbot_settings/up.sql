CREATE TABLE chatbot_settings (
  id VARCHAR(255) PRIMARY KEY,
  chatbot_id CHAR(36), 
  name VARCHAR(255),
  value VARCHAR(255),
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);