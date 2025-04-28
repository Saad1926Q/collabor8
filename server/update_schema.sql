-- Add password and refreshToken columns to users table
ALTER TABLE users
ADD COLUMN password VARCHAR(255),
ADD COLUMN refreshToken VARCHAR(255);
