#!/bin/bash
set -e

# Log everything
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "=== Starting User Data Script ==="

# Update system
dnf update -y

# Install Python and pip
dnf install -y python3.11 python3.11-pip git

# Create app directory
mkdir -p /opt/taskmanager
cd /opt/taskmanager

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install Python packages
pip install --upgrade pip
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic pydantic-settings python-dotenv

# Create environment file
cat > /opt/taskmanager/.env << 'EOF'
DATABASE_URL=postgresql://${db_username}:${db_password}@${db_host}:${db_port}/${db_name}
CORS_ORIGINS=*
EOF

# Create a simple health check while waiting for deployment
cat > /opt/taskmanager/health.py << 'EOF'
from fastapi import FastAPI
app = FastAPI()

@app.get("/health")
def health():
    return {"status": "healthy", "message": "Backend placeholder - deploy your app!"}

@app.get("/")
def root():
    return {"message": "Task Manager API - Deploy your application to /opt/taskmanager"}
EOF

# Create systemd service
cat > /etc/systemd/system/taskmanager.service << 'EOF'
[Unit]
Description=Task Manager FastAPI Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/taskmanager
Environment="PATH=/opt/taskmanager/venv/bin"
EnvironmentFile=/opt/taskmanager/.env
ExecStart=/opt/taskmanager/venv/bin/uvicorn health:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl daemon-reload
systemctl enable taskmanager
systemctl start taskmanager

echo "=== User Data Script Complete ==="
