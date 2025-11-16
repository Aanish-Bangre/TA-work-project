-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'coordinator')),
  department TEXT CHECK (department IN ('science', 'commerce', 'interdisciplinary', 'humanities', NULL)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insert demo users
-- Note: In production, passwords should be hashed. For demo purposes, using plain text.

-- Admins (4 departments - all have admin role)
INSERT INTO users (username, password, role, department) VALUES
('admin_science', 'science123', 'admin', 'science'),
('admin_commerce', 'commerce123', 'admin', 'commerce'),
('admin_interdisciplinary', 'interdisciplinary123', 'admin', 'interdisciplinary'),
('admin_humanities', 'humanities123', 'admin', 'humanities');

-- Coordinators (example coordinators for each department)
INSERT INTO users (username, password, role, department) VALUES
('coord_science_1', 'coord123', 'coordinator', 'science'),
('coord_science_2', 'coord123', 'coordinator', 'science'),
('coord_commerce_1', 'coord123', 'coordinator', 'commerce'),
('coord_commerce_2', 'coord123', 'coordinator', 'commerce'),
('coord_interdisciplinary_1', 'coord123', 'coordinator', 'interdisciplinary'),
('coord_interdisciplinary_2', 'coord123', 'coordinator', 'interdisciplinary'),
('coord_humanities_1', 'coord123', 'coordinator', 'humanities'),
('coord_humanities_2', 'coord123', 'coordinator', 'humanities');

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (true);

-- You can add more restrictive policies as needed
