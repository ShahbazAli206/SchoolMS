-- SchoolMS Demo Data - Test Users
-- All demo users have password: password123
-- The hash below is bcryptjs hash of 'password123'

INSERT INTO users (name, email, phone, username, password, role, is_active) VALUES
('Admin User', 'admin@schoolms.com', '9876543210', 'admin', '$2a$10$TQ5Gx/1YjLvMi.3KjDU3lOyh4eFpYgp8Z2qvJJXlqJ8F6T7F5PLVG', 'admin', 1),
('John Doe', 'john@schoolms.com', '9876543211', 'john_teacher', '$2a$10$TQ5Gx/1YjLvMi.3KjDU3lOyh4eFpYgp8Z2qvJJXlqJ8F6T7F5PLVG', 'teacher', 1),
('Alice Smith', 'alice@schoolms.com', '9876543212', 'alice_student', '$2a$10$TQ5Gx/1YjLvMi.3KjDU3lOyh4eFpYgp8Z2qvJJXlqJ8F6T7F5PLVG', 'student', 1),
('Bob Wilson', 'bob@schoolms.com', '9876543213', 'bob_parent', '$2a$10$TQ5Gx/1YjLvMi.3KjDU3lOyh4eFpYgp8Z2qvJJXlqJ8F6T7F5PLVG', 'parent', 1);
