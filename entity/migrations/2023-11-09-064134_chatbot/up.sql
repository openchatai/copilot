CREATE TABLE chatbots (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    status VARCHAR(255),
    prompt_message VARCHAR(255),
    enhanced_privacy BOOLEAN,
    smart_sync BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    swagger_url VARCHAR(255),
    is_premade_demo_template BOOLEAN
);
