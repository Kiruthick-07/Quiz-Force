# MongoDB Local Setup Guide

## Quick Installation on Windows

### Method 1: Download MongoDB Community Server
1. Go to https://www.mongodb.com/try/download/community
2. Select Windows, Version 7.0+, MSI
3. Download and run the installer
4. Choose "Complete" installation
5. Check "Install MongoDB as a Service"
6. Check "Install MongoDB Compass" (GUI tool)

### Method 2: Using Chocolatey (if installed)
```powershell
choco install mongodb
```

### Method 3: Using winget
```powershell
winget install MongoDB.Server
```

## Start MongoDB Service

### Option A: Windows Service (Recommended)
MongoDB should start automatically as a Windows service after installation.

To check if running:
```powershell
Get-Service mongodb
```

To start/stop manually:
```powershell
Start-Service mongodb
Stop-Service mongodb
```

### Option B: Manual Start
```powershell
# Navigate to MongoDB bin directory (usually):
cd "C:\Program Files\MongoDB\Server\7.0\bin"

# Start MongoDB
mongod --dbpath "C:\data\db"
```

## Verify Installation

1. Open Command Prompt or PowerShell
2. Run: `mongosh` or `mongo`
3. You should see MongoDB shell prompt

## Create Database Directory (if needed)
```powershell
mkdir C:\data\db
```

## Test Connection
```javascript
// In MongoDB shell (mongosh)
show dbs
use quizforce
db.test.insertOne({message: "Hello World"})
db.test.find()
```

## Troubleshooting

### Port 27017 in use?
```powershell
netstat -an | findstr 27017
```

### Service not starting?
1. Check Windows Event Viewer
2. Ensure C:\data\db directory exists
3. Run Command Prompt as Administrator

### Connection refused?
1. Check if MongoDB service is running
2. Try connecting to 127.0.0.1:27017
3. Check firewall settings

## Default Connection Details
- **Host**: localhost
- **Port**: 27017  
- **Connection String**: `mongodb://localhost:27017/quizforce`

## MongoDB Compass (GUI)
After installation, you can use MongoDB Compass to visualize your data:
- Open MongoDB Compass
- Connect to: `mongodb://localhost:27017`
- Browse your `quizforce` database

## Quick Test Commands
```bash
# Test if MongoDB is accessible
curl http://localhost:27017

# Should return: "It looks like you are trying to access MongoDB over HTTP"
```