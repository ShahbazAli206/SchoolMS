# 🚀 SchoolMS - Complete Setup & Run Guide

## 📋 Prerequisites
- ✅ Node.js v22.11.0+ installed
- ✅ Android Studio & SDK installed
- ✅ Android device connected (USB debugging enabled)
- ✅ MySQL 8.4 installed
- ✅ All source code downloaded

## 🗄️ Database Setup

### Option 1: Automatic Setup (Windows PowerShell as Administrator)
```bash
cd "C:\Users\M. Shahbaz Ali\Desktop\Projects\MobileApps\SchoolMS-Backend"
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --console
# In a new admin PowerShell:
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root < schema.sql
```

### Option 2: Manual MySQL Setup (Recommended)
1. **Start MySQL Command Prompt:**
   ```bash
   "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -p
   # Press Enter if no password set
   ```

2. **Create Database:**
   ```sql
   CREATE DATABASE school_management_db;
   USE school_management_db;
   SOURCE C:\Users\M. Shahbaz Ali\Desktop\Projects\MobileApps\SchoolMS-Backend\schema.sql;
   ```

3. **Exit MySQL:**
   ```
   EXIT;
   ```

### Option 3: Quick CLI Command
```bash
cd "C:\Users\M. Shahbaz Ali\Desktop\Projects\MobileApps\SchoolMS-Backend"
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS school_management_db;"
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root school_management_db < schema.sql
```

---

## ⚙️ Backend Configuration

### 1. Update `.env` File
Edit `SchoolMS-Backend/.env`:
```env
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=school_management_db
DB_USER=root
DB_PASSWORD=
# ↑ Set your MySQL root password here (if you set one)

# JWT (Change these in production!)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long_here_!!
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_characters_long_here_!!
JWT_REFRESH_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://10.0.2.2:5000,http://localhost:5000,*

# Firebase (Optional - Push Notifications)
# Set FIREBASE_SERVICE_ACCOUNT if you have Firebase configured
# Leave blank to disable push notifications in development
```

### 2. Verify Backend Dependencies
```bash
cd "C:\Users\M. Shahbaz Ali\Desktop\Projects\MobileApps\SchoolMS-Backend"
npm install
```

---

## 🚀 Start Backend Server

### Terminal 1: Backend Server
```bash
cd "C:\Users\M. Shahbaz Ali\Desktop\Projects\MobileApps\SchoolMS-Backend"
npm run dev
```

**Expected Output:**
```
[nodemon] 3.1.14
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node server.js`
✓ Database connection successful
✓ Server running on http://localhost:5000
```

---

## 📱 Mobile App Deployment

### Prerequisites
1. **USB Debugging Enabled** on your Android phone:
   - Settings → Developer Options → USB Debugging ✓
   
2. **Connected to Same Network** (for development):
   - Phone & Laptop should be on same WiFi (for hot reload)

### Terminal 2: Metro Bundler (React Native)
```bash
cd "C:\Users\M. Shahbaz Ali\Desktop\Projects\MobileApps\SchoolMS"
npm run start
```

**Expected Output:**
```
Welcome to Metro!
Fast - Scalable - Integrated
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                       ┃
┃  To reload the app press 'r' or 'R'                  ┃
┃  To open developer menu press 'd' or 'D'             ┃
┃  To quit press 'Ctrl + C'                            ┃
┃                                                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Terminal 3: Build & Deploy to Android Device
```bash
cd "C:\Users\M. Shahbaz Ali\Desktop\Projects\MobileApps\SchoolMS"
npx react-native run-android
```

**Wait for:**
1. Gradle download & build (5-15 minutes first time)
2. APK installation on device
3. App launch

---

## 🧪 Testing the App

### Create Test User
Use the app to register as a new user OR access backend directly:

```bash
# Login endpoint (POST)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@schoolms.com",
    "password": "password123"
  }'
```

### Default Test Credentials
The database schema includes demo users. After schema import:
- **Email:** admin@schoolms.com
- **Password:** password123
- **Role:** Admin

---

## 📝 Troubleshooting

### ❌ Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:**
```bash
# Check if MySQL is running
netstat -ano | findstr :3306

# If not running, start manually:
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --console
```

### ❌ Port 5000 Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in .env to 5001
```

### ❌ Android Device Not Found
```
error: no devices/emulators found
```
**Solution:**
```bash
# Reconnect USB cable
# Enable USB Debugging on phone
adb devices  # Should show your device
adb kill-server
adb start-server
```

### ❌ Metro Bundler Errors
```bash
# Clear cache and rebuild
cd SchoolMS
npm run start -- --reset-cache
```

---

## 🎯 Verify Everything is Working

### 1. Check Backend API
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"ok"}
```

### 2. Check Database
```bash
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -e "SELECT COUNT(*) FROM school_management_db.users;"
# Should return: count of users (at least 1)
```

### 3. Check Device Connection
```bash
adb devices
# Should show your device with "device" status
```

---

## 📱 First Login on App

Once the app launches:
1. **See Login Screen** ✓
2. **Enter Email:** admin@schoolms.com
3. **Enter Password:** password123
4. **Tap Login** 
5. **Wait for OTP** (check terminal for console logs)
6. **Enter OTP** (default: 123456)
7. **See Admin Dashboard** ✓

---

## 🔥 Common Commands Cheatsheet

```bash
# Backend
npm run dev                    # Start backend with hot reload
npm run start                  # Start backend without hot reload
npm test                       # Run tests

# Mobile
npm run start                  # Start Metro bundler
npm run android                # Build & deploy to Android
npm run ios                    # Build & deploy to iOS (Mac only)
npm run lint                   # Check code style

# Database
npm run db:migrate            # Run migrations (if setup)
npm run db:seed               # Seed test data

# ADB Commands
adb devices                    # List connected devices
adb logcat                     # View device logs
adb shell                      # Access device shell
```

---

## ✅ Full Checklist

- [ ] MySQL installed & running
- [ ] Database created (`school_management_db`)
- [ ] Schema imported
- [ ] `.env` file configured
- [ ] Backend dependencies installed (`npm install`)
- [ ] Backend server running (`npm run dev`)
- [ ] Android device connected & USB debugging on
- [ ] Metro bundler running (`npm run start`)
- [ ] App deployed to device (`npx react-native run-android`)
- [ ] App launching on device
- [ ] Can login with test credentials
- [ ] Admin Dashboard visible

---

## 🎓 Next Steps After First Launch

1. **Create new users** in Admin Module
2. **Assign roles** (Teacher, Student, Parent)
3. **Test features** (Chat, Assignments, Marks, etc.)
4. **Check logs** in Terminal 1 for backend activity
5. **Monitor device** logs: `adb logcat | grep -i error`

---

## 📞 Need Help?

Check the following:
1. Terminal output for error messages
2. Device logs: `adb logcat`
3. Network connectivity (same WiFi)
4. MySQL status: `netstat -ano | findstr :3306`

**Good luck! 🚀**
