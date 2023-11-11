CREATE TABLE chatbots (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    status VARCHAR(255),
    prompt_message VARCHAR(255),
    enhanced_privacy INT,   -- Use INT to represent boolean
    smart_sync INT,         -- Use INT to represent boolean
    created_at DATETIME,    -- Assuming DATETIME data type for date and time
    updated_at DATETIME,    -- Assuming DATETIME data type for date and time
    deleted_at DATETIME,    -- Assuming DATETIME data type for date and time
    swagger_url VARCHAR(255),
    is_premade_demo_template INT  -- Use INT to represent boolean
);
