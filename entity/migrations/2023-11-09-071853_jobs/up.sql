CREATE TABLE jobs (
  id VARCHAR(255) PRIMARY KEY,
  queue VARCHAR(255),
  payload VARCHAR(255),
  attempts TINYINT,
  reserved_at INT,
  available_at INT,
  created_at INT  
);