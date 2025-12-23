#!/bin/bash
cd /opt/taskmanager

# Download backend code from S3
aws s3 cp s3://task-manager-frontend-c4el7g0r/backend-deploy.zip .
unzip -o backend-deploy.zip

# Install dependencies
source venv/bin/activate
pip install -r requirements.txt

# Create production .env (API key should be set via AWS Systems Manager or manually)
cat > /opt/taskmanager/.env << 'EOF'
DATABASE_URL=postgresql://taskadmin:YOUR_DB_PASSWORD@YOUR_RDS_ENDPOINT:5432/taskmanager
CORS_ORIGINS=*
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
EOF

# Update systemd service to point to actual app
cat > /etc/systemd/system/taskmanager.service << 'EOF'
[Unit]
Description=AI-Powered Task Manager FastAPI Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/taskmanager
Environment="PATH=/opt/taskmanager/venv/bin"
EnvironmentFile=/opt/taskmanager/.env
ExecStart=/opt/taskmanager/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Restart service
systemctl daemon-reload
systemctl restart taskmanager
sleep 2
systemctl status taskmanager
