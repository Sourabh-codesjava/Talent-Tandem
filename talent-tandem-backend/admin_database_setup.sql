-- Admin Matching Rules Table
CREATE TABLE IF NOT EXISTS admin_matching_rules (
    id BIGSERIAL PRIMARY KEY,
    skill_match_threshold DOUBLE PRECISION DEFAULT 0.7,
    availability_match_weight DOUBLE PRECISION DEFAULT 0.3,
    rating_weight DOUBLE PRECISION DEFAULT 0.4,
    experience_weight DOUBLE PRECISION DEFAULT 0.3,
    max_matching_distance INTEGER DEFAULT 50,
    enable_location_matching BOOLEAN DEFAULT TRUE,
    custom_rules TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Audit Logs Table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL,
    admin_username VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(255),
    target_id BIGINT,
    details TEXT,
    ip_address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skill Clusters Table
CREATE TABLE IF NOT EXISTS skill_clusters (
    id BIGSERIAL PRIMARY KEY,
    cluster_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skill Cluster Mapping Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS skill_cluster_mapping (
    cluster_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (cluster_id, skill_id),
    FOREIGN KEY (cluster_id) REFERENCES skill_clusters(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Add suspension fields to users table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='is_suspended') THEN
        ALTER TABLE users ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='suspension_reason') THEN
        ALTER TABLE users ADD COLUMN suspension_reason TEXT;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_users_is_suspended ON users(is_suspended);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insert default AI matching rules
INSERT INTO admin_matching_rules (
    skill_match_threshold,
    availability_match_weight,
    rating_weight,
    experience_weight,
    max_matching_distance,
    enable_location_matching,
    custom_rules
) VALUES (
    0.7,
    0.3,
    0.4,
    0.3,
    50,
    TRUE,
    '{"minSessionsForRating": 5, "preferVerifiedMentors": true}'
) ON CONFLICT DO NOTHING;
