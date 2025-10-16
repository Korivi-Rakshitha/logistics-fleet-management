# 🚀 Complete Deployment Guide - Logistics Fleet Management

## 📋 Table of Contents

1. [Quick Deploy (Render + Vercel)](#quick-deploy)
2. [Deploy to Heroku](#deploy-to-heroku)
3. [Deploy to VPS (DigitalOcean/AWS)](#deploy-to-vps)
4. [Deploy with Docker](#deploy-with-docker)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)

---

## 🎯 Option 1: Quick Deploy (Render + Vercel) - RECOMMENDED

### **Backend on Render (Free)**

#### **Step 1: Prepare Backend**

1. **Create `package.json` start script in backend:**

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

2. **Update CORS in `backend/server.js`:**

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-url.vercel.app'  // Add your Vercel URL
  ],
  credentials: true
}));
```

#### **Step 2: Deploy to Render**

1. **Push code to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/logistics-fleet.git
git push -u origin main
```

2. **Go to [Render.com](https://render.com)**
   - Sign up/Login
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `logistics-fleet-management`

3. **Configure Service:**
   - **Name:** `logistics-fleet-backend`
   - **Region:** Oregon (US West)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Add Environment Variables:**
   ```
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-change-this
   NODE_ENV=production
   ```

5. **Click "Create Web Service"**

6. **Wait for deployment** (5-10 minutes)

7. **Copy your backend URL:** `https://logistics-fleet-backend.onrender.com`

---

### **Frontend on Vercel (Free)**

#### **Step 1: Prepare Frontend**

1. **Update API URL in `frontend/src/services/api.js`:**

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://logistics-fleet-backend.onrender.com/api';
```

2. **Create `.env.production` in frontend folder:**

```env
REACT_APP_API_URL=https://logistics-fleet-backend.onrender.com/api
```

3. **Build test locally:**
```bash
cd frontend
npm run build
```

#### **Step 2: Deploy to Vercel**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
cd frontend
vercel
```

3. **Follow prompts:**
   - Set up and deploy? `Y`
   - Which scope? (your account)
   - Link to existing project? `N`
   - Project name: `logistics-fleet`
   - Directory: `./`
   - Override settings? `N`

4. **Production deployment:**
```bash
vercel --prod
```

5. **Your app is live!** 🎉
   - Frontend: `https://logistics-fleet.vercel.app`
   - Backend: `https://logistics-fleet-backend.onrender.com`

---

## 🎯 Option 2: Deploy to Heroku

### **Backend Deployment**

1. **Install Heroku CLI:**
```bash
npm install -g heroku
```

2. **Login to Heroku:**
```bash
heroku login
```

3. **Create Heroku app:**
```bash
cd backend
heroku create logistics-fleet-backend
```

4. **Add MySQL addon:**
```bash
heroku addons:create jawsdb:kitefin
```

5. **Set environment variables:**
```bash
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production
```

6. **Create `Procfile` in backend:**
```
web: node server.js
```

7. **Deploy:**
```bash
git init
git add .
git commit -m "Deploy to Heroku"
heroku git:remote -a logistics-fleet-backend
git push heroku main
```

8. **Open app:**
```bash
heroku open
```

### **Frontend Deployment**

Same as Vercel steps above, or use Heroku:

```bash
cd frontend
heroku create logistics-fleet-frontend
heroku buildpacks:set mars/create-react-app
git push heroku main
```

---

## 🎯 Option 3: Deploy to VPS (DigitalOcean/AWS/Linode)

### **Prerequisites**

- Ubuntu 20.04+ server
- Root/sudo access
- Domain name (optional)

### **Step 1: Server Setup**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation
```

### **Step 2: Setup MySQL Database**

```bash
sudo mysql -u root -p

CREATE DATABASE logistics_fleet;
CREATE USER 'logistics_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON logistics_fleet.* TO 'logistics_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### **Step 3: Deploy Backend**

```bash
# Clone repository
cd /var/www
git clone https://github.com/yourusername/logistics-fleet.git
cd logistics-fleet/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
```

**Add to .env:**
```env
PORT=5000
DB_HOST=localhost
DB_USER=logistics_user
DB_PASSWORD=strong_password
DB_NAME=logistics_fleet
JWT_SECRET=your-super-secret-key
NODE_ENV=production
```

```bash
# Run database migrations
node utils/updateDb-driver-verification.js

# Start with PM2
pm2 start server.js --name logistics-backend
pm2 save
pm2 startup
```

### **Step 4: Deploy Frontend**

```bash
cd /var/www/logistics-fleet/frontend

# Update API URL
nano .env.production
# Add: REACT_APP_API_URL=http://your-server-ip:5000/api

# Build
npm install
npm run build

# Copy build to Nginx
sudo cp -r build/* /var/www/html/
```

### **Step 5: Configure Nginx**

```bash
sudo nano /etc/nginx/sites-available/logistics-fleet
```

**Add configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket for Socket.io
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/logistics-fleet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **Step 6: Setup SSL (Optional but Recommended)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

---

## 🎯 Option 4: Deploy with Docker

### **Step 1: Create Dockerfiles**

**Backend Dockerfile:**

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

**Frontend Dockerfile:**

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Frontend nginx.conf:**

```nginx
server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri /index.html;
    }
}
```

### **Step 2: Create docker-compose.yml**

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: logistics_fleet
      MYSQL_USER: logistics_user
      MYSQL_PASSWORD: userpassword
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DB_HOST=mysql
      - DB_USER=logistics_user
      - DB_PASSWORD=userpassword
      - DB_NAME=logistics_fleet
      - JWT_SECRET=your-secret-key
      - NODE_ENV=production
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

### **Step 3: Deploy**

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🔐 Environment Variables

### **Backend (.env)**

```env
# Server
PORT=5000
NODE_ENV=production

# Database (MySQL)
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=logistics_fleet

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# CORS (Optional)
ALLOWED_ORIGINS=https://your-frontend-url.com
```

### **Frontend (.env.production)**

```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

---

## ✅ Post-Deployment Checklist

### **1. Test All Features**

- [ ] User registration (Customer, Driver, Admin)
- [ ] Login with all roles
- [ ] Admin passkey verification
- [ ] Driver document verification
- [ ] Create delivery
- [ ] Assign driver to delivery
- [ ] Track delivery
- [ ] Real-time updates (Socket.io)
- [ ] Map functionality

### **2. Security**

- [ ] Change default admin password
- [ ] Change admin passkey from `1234`
- [ ] Use strong JWT secret (min 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Regular database backups

### **3. Performance**

- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Database indexing
- [ ] PM2 cluster mode (for VPS)

### **4. Monitoring**

- [ ] Set up error logging (Sentry)
- [ ] Monitor server resources
- [ ] Database backup automation
- [ ] Uptime monitoring

---

## 🔧 Common Issues & Solutions

### **Issue: CORS Error**

**Solution:** Update backend CORS configuration:
```javascript
app.use(cors({
  origin: ['https://your-frontend-url.com'],
  credentials: true
}));
```

### **Issue: Database Connection Failed**

**Solution:** Check environment variables and database credentials

### **Issue: Build Fails**

**Solution:** 
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### **Issue: Socket.io Not Working**

**Solution:** Ensure WebSocket is properly proxied in Nginx

---

## 📊 Deployment Comparison

| Platform | Cost | Ease | Database | SSL | Best For |
|----------|------|------|----------|-----|----------|
| **Render + Vercel** | Free | ⭐⭐⭐⭐⭐ | SQLite/External | Auto | Quick deploy |
| **Heroku** | $7-25/mo | ⭐⭐⭐⭐ | Included | Auto | Startups |
| **VPS** | $5-20/mo | ⭐⭐⭐ | Self-managed | Manual | Full control |
| **Docker** | Varies | ⭐⭐⭐ | Container | Manual | Scalability |

---

## 🎯 Recommended: Render + Vercel

**Why?**
- ✅ Completely free
- ✅ Auto SSL
- ✅ Easy setup
- ✅ Auto deployments from Git
- ✅ Good performance
- ✅ No server management

**Steps:**
1. Push to GitHub
2. Connect Render for backend
3. Connect Vercel for frontend
4. Done! 🎉

---

## 📝 Quick Commands Reference

```bash
# Local development
npm run dev

# Build frontend
npm run build

# Start production
npm start

# PM2 commands
pm2 start server.js
pm2 logs
pm2 restart all
pm2 stop all

# Docker commands
docker-compose up -d
docker-compose logs -f
docker-compose down

# Git deployment
git add .
git commit -m "Deploy"
git push origin main
```

---

## 🆘 Need Help?

1. Check logs: `pm2 logs` or `docker-compose logs`
2. Verify environment variables
3. Test database connection
4. Check firewall/security groups
5. Review Nginx configuration

---

**Your app is ready for production! 🚀**

Choose the deployment option that best fits your needs and follow the steps above.
