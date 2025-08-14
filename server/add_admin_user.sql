-- SQL script to add an admin user
-- The password is 'admin123' hashed with bcrypt (10 salt rounds)
-- You can run this in pgAdmin's Query Tool

INSERT INTO "User" ("id", "email", "password", "name", "role", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(), -- Generate a UUID
  'your_email@example.com', -- Change this to your desired admin email
  '$2b$10$8TsXUH5UL7QroOSeIXxKz.Phe3a2S/oOQdV0sRNML6TNyrXYpcRsO', -- This is 'my_secure_password' hashed with bcrypt
  'Your Name', -- Change this to your desired admin name
  'admin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- If you want to add another admin user with a different email, copy the INSERT statement and change the email and name
