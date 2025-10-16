# Deployment Guide

## 🚀 Production Deployment

This guide covers deploying the Logistics & Fleet Management System to production.

---

## 📋 Pre-deployment Checklist

- [ ] MySQL database server ready
- [ ] Node.js installed on server (v14+)
- [ ] Domain name configured (optional)
- [ ] SSL certificate obtained (for HTTPS)
- [ ] Environment variables prepared
- [ ] Backup strategy in place

---

## 🔧 Backend Deployment

### 1. Server Setup

**Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Install MySQL:**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

### 2. Application Setup

**Clone repository:**
```bash
git clone <your-repo-url>
cd logistics-fleet-management/backend
```

**Install dependencies:**
```bash
npm install --production
```

**Configure environment:**
```bash
nano .env
```

```env
PORT=5000
DB_HOST=localhost
DB_USER=logistics_user
DB_PASSWORD=strong_password_here
DB_NAME=logistics_fleet
JWT_SECRET=very_strong_secret_key_change_this
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

**Initialize database:**
```bash
npm run init-db
```

### 3. Process Management with PM2

**Install PM2:**
```bash
sudo npm install -g pm2
```

**Start application:**
```bash
pm2 start server.js --name logistics-backend
pm2 save
pm2 startup
```

**Monitor:**
```bash
pm2 status
pm2 logs logistics-backend
pm2 monit
```

### 4. Nginx Reverse Proxy

**Install Nginx:**
```bash
sudo apt-get install nginx
```

**Configure:**
```bash
sudo nano /etc/nginx/sites-available/logistics-backend
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Socket.io support
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/logistics-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## 🎨 Frontend Deployment

### Option 1: Static Hosting (Netlify/Vercel)

**Build application:**
```bash
cd frontend
npm install
npm run build
```

**Deploy to Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Environment variables on Netlify:**
- `REACT_APP_API_URL`: https://api.yourdomain.com/api
- `REACT_APP_SOCKET_URL`: https://api.yourdomain.com

### Option 2: Self-hosted with Nginx

**Build:**
```bash
cd frontend
npm install
npm run build
```

**Configure Nginx:**
```bash
sudo nano /etc/nginx/sites-available/logistics-frontend
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/logistics-frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Copy build files:**
```bash
sudo mkdir -p /var/www/logistics-frontend
sudo cp -r build/* /var/www/logistics-frontend/
```

**Enable and restart:**
```bash
sudo ln -s /etc/nginx/sites-available/logistics-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Add SSL:**
```bash
sudo certbot --nginx -d yourdomain.com
```

---

## 🗄️ Database Optimization

### 1. Create Indexes

```sql
-- Add indexes for better query performance
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX idx_deliveries_customer ON deliveries(customer_id);
CREATE INDEX idx_deliveries_scheduled ON deliveries(scheduled_pickup_time, scheduled_delivery_time);
CREATE INDEX idx_tracking_delivery ON tracking(delivery_id);
CREATE INDEX idx_tracking_timestamp ON tracking(timestamp);
```

### 2. Database Backup

**Automated backup script:**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u logistics_user -p logistics_fleet > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -type f -mtime +7 -delete
```

**Add to crontab:**
```bash
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

---

## 🔒 Security Hardening

### 1. Firewall Configuration

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. MySQL Security

```sql
-- Create dedicated user
CREATE USER 'logistics_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON logistics_fleet.* TO 'logistics_user'@'localhost';
FLUSH PRIVILEGES;

-- Disable remote root login
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
FLUSH PRIVILEGES;
```

### 3. Environment Variables

- Never commit `.env` files
- Use strong JWT secrets (32+ characters)
- Rotate secrets periodically
- Use different secrets for dev/prod

### 4. Rate Limiting

Add to backend (install: `npm install express-rate-limit`):

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📊 Monitoring

### 1. Application Monitoring

**PM2 Monitoring:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 2. Server Monitoring

**Install monitoring tools:**
```bash
sudo apt-get install htop
sudo apt-get install nethogs
```

### 3. Database Monitoring

```sql
-- Check slow queries
SHOW FULL PROCESSLIST;

-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

---

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy Backend
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/logistics-backend
          git pull
          npm install --production
          pm2 restart logistics-backend
    
    - name: Build Frontend
      run: |
        cd frontend
        npm install
        npm run build
    
    - name: Deploy Frontend
      uses: netlify/actions/cli@master
      with:
        args: deploy --prod
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 🧪 Post-Deployment Testing

### 1. Health Checks

```bash
# Backend health
curl https://api.yourdomain.com/api/health

# Frontend
curl https://yourdomain.com

# Socket.io
curl https://api.yourdomain.com/socket.io/
```

### 2. Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test API
ab -n 1000 -c 10 https://api.yourdomain.com/api/vehicles
```

### 3. SSL Check

```bash
# Check SSL certificate
openssl s_client -connect api.yourdomain.com:443 -servername api.yourdomain.com
```

---

## 🔧 Maintenance

### Regular Tasks

**Daily:**
- Check PM2 logs: `pm2 logs`
- Monitor disk space: `df -h`

**Weekly:**
- Review error logs
- Check database size
- Verify backups

**Monthly:**
- Update dependencies: `npm audit fix`
- Review and optimize database
- Security updates: `sudo apt-get update && sudo apt-get upgrade`

### Database Maintenance

```sql
-- Optimize tables
OPTIMIZE TABLE deliveries, tracking, vehicles;

-- Analyze tables
ANALYZE TABLE deliveries, tracking, vehicles;

-- Clean old tracking data (older than 30 days)
DELETE FROM tracking WHERE timestamp < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

---

## 🆘 Troubleshooting

### Backend Not Starting

```bash
# Check logs
pm2 logs logistics-backend

# Check port
sudo netstat -tulpn | grep 5000

# Restart
pm2 restart logistics-backend
```

### Database Connection Issues

```bash
# Check MySQL status
sudo systemctl status mysql

# Test connection
mysql -u logistics_user -p logistics_fleet

# Check grants
SHOW GRANTS FOR 'logistics_user'@'localhost';
```

### Socket.io Not Working

- Verify Nginx WebSocket configuration
- Check CORS settings in backend
- Ensure SSL is configured for both HTTP and WS

### High Memory Usage

```bash
# Check process memory
pm2 monit

# Restart if needed
pm2 restart logistics-backend
```

---

## 📱 Mobile Considerations

For mobile access:
1. Ensure responsive design works
2. Test geolocation on mobile browsers
3. Consider PWA implementation
4. Optimize for mobile data usage

---

## 🔮 Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or HAProxy
2. **Multiple Backend Instances**: PM2 cluster mode
3. **Database Replication**: Master-slave setup
4. **Redis for Sessions**: Shared session storage
5. **CDN for Frontend**: CloudFlare or similar

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Optimize database queries
3. Add database indexes
4. Enable caching

---

## 📝 Deployment Checklist

- [ ] Backend deployed and running
- [ ] Frontend built and deployed
- [ ] Database initialized
- [ ] SSL certificates installed
- [ ] Environment variables configured
- [ ] PM2 process running
- [ ] Nginx configured
- [ ] Firewall rules set
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Health checks passing
- [ ] DNS configured
- [ ] Documentation updated

---

**Your Logistics & Fleet Management System is now production-ready! 🚀**
