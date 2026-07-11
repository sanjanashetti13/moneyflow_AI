# Money Flow Ansible Deployment Guide

Complete Ansible automation for deploying the Money Flow MERN stack application with Nginx reverse proxy, systemd service management, and Docker-based monitoring (Prometheus + Grafana).

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Checkpoint Execution](#checkpoint-execution)
- [Troubleshooting](#troubleshooting)
- [Important URLs](#important-urls)

---

## Prerequisites

### Control Machine (Your Computer)
- Ansible installed (`ansible --version`)
- SSH key access to Ubuntu server
- Git (optional, for version control)

### Target Server (Ubuntu)
- Ubuntu 20.04 or 22.04 LTS
- SSH access with sudo privileges
- Minimum 2GB RAM, 20GB disk space
- Ports: 80, 5000, 9090, 3001 accessible

---

## Quick Start

### Step 1: Update Server IP

Edit the inventory file and replace `<SERVER_IP>` with your actual server IP:

```bash
cd ansible
nano inventory
```

Change:
```ini
[webserver]
<SERVER_IP> ansible_user=ubuntu ansible_python_interpreter=/usr/bin/python3
```

To (example):
```ini
[webserver]
203.0.113.50 ansible_user=ubuntu ansible_python_interpreter=/usr/bin/python3
```

### Step 2: Update Server IP in Playbooks

Update server IP in these files:
- `playbooks/deploy-money-flow.yml` (line 21)
- `playbooks/configure-nginx-proxy.yml` (line 10)

Replace `<SERVER_IP>` with your actual IP address.

### Step 3: Test Connectivity

```bash
ansible -i inventory webserver -m ping
```

**Expected output:**
```
<SERVER_IP> | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

### Step 4: Run Complete Deployment

```bash
ansible-playbook -i inventory complete-deployment.yml
```

This will execute all phases automatically:
1. Install Nginx
2. Deploy Money Flow application
3. Configure Nginx reverse proxy
4. Deploy monitoring stack

---

## Checkpoint Execution

### 🔰 PHASE 0: Preparation

#### Checkpoint 0.1 – Your App Ready ✅
Already completed - App exists in `moneyflow-backend` and `moneyflow-frontend`

#### Checkpoint 0.2 – Ubuntu Server Ready ✅
Test SSH access:
```bash
ssh ubuntu@<SERVER_IP>
```

---

### 🔰 PHASE 1: Ansible Setup

#### Checkpoint 1.1 – Install Ansible (Control Machine)

On your **local machine** (Windows - use WSL or Ubuntu VM):
```bash
sudo apt update
sudo apt install ansible -y
ansible --version
```

📸 **Screenshot**: `ansible --version` output

#### Checkpoint 1.2 – Inventory File

Already created at `ansible/inventory`

📸 **Screenshot**: Content of inventory file
```bash
cat ansible/inventory
```

#### Checkpoint 1.3 – Test Connectivity

```bash
cd ansible
ansible -i inventory webserver -m ping
```

📸 **Screenshot**: Ping success output

---

### 🔰 PHASE 2: Nginx Installation Playbook

#### Checkpoint 2.1 – Create Playbook

Already created at `ansible/playbooks/install-nginx.yml`

Run the playbook:
```bash
ansible-playbook -i inventory playbooks/install-nginx.yml
```

📸 **Screenshots**:
- Playbook file content
- Successful execution output

#### Checkpoint 2.2 – Verify Nginx

Open in browser:
```
http://<SERVER_IP>
```

📸 **Screenshot**: Nginx default "Welcome to nginx!" page

---

### 🔰 PHASE 3: Money Flow App Deployment (MOST IMPORTANT)

#### Checkpoint 3.1 – Deployment Playbook Created

Already created at `ansible/playbooks/deploy-money-flow.yml`

View the playbook:
```bash
cat playbooks/deploy-money-flow.yml
```

📸 **Screenshot**: Playbook file content

#### Checkpoint 3.2 – App Code Deployment

Run the deployment:
```bash
ansible-playbook -i inventory playbooks/deploy-money-flow.yml
```

Verify on server:
```bash
ssh ubuntu@<SERVER_IP>
ls -la /var/www/money-flow/
```

📸 **Screenshot**: Server directory listing showing `backend` and `frontend`

#### Checkpoint 3.3 – Install App Dependencies

This is automated in the playbook. Check the output for:
- "Install backend dependencies"
- "Install frontend dependencies"

📸 **Screenshot**: npm install task success output

#### Checkpoint 3.4 – systemd Service for Money Flow App

Service file created at `/etc/systemd/system/money-flow.service`

Check service status:
```bash
ssh ubuntu@<SERVER_IP>
sudo systemctl status money-flow
```

📸 **Screenshots**:
- Service file content: `cat /etc/systemd/system/money-flow.service`
- Service status output

#### Checkpoint 3.5 – App Running (Internal Port)

Test backend:
```bash
ssh ubuntu@<SERVER_IP>
curl http://localhost:5000
```

Expected response: `Backend OK ✔`

📸 **Screenshot**: curl response output

---

### 🔰 PHASE 4: Nginx Reverse Proxy

#### Checkpoint 4.1 – Nginx Config via Ansible

Run the proxy configuration:
```bash
ansible-playbook -i inventory playbooks/configure-nginx-proxy.yml
```

View config on server:
```bash
ssh ubuntu@<SERVER_IP>
cat /etc/nginx/sites-available/money-flow
sudo nginx -t
```

📸 **Screenshots**:
- Config file content
- `nginx -t` success output

#### Checkpoint 4.2 – Public Access 🚨 VERY IMPORTANT

Open browser:
```
http://<SERVER_IP>
```

You should see the **Money Flow App UI** (login/register page)

📸 **Screenshot**: Money Flow app running via Nginx

---

### 🔰 PHASE 5: Monitoring with Ansible + Docker

#### Checkpoint 5.1 – Monitoring Playbook

Already created at `ansible/playbooks/monitoring.yml`

📸 **Screenshot**: Playbook file content

#### Checkpoint 5.2 – Start Monitoring Stack

Run the monitoring playbook:
```bash
ansible-playbook -i inventory playbooks/monitoring.yml
```

📸 **Screenshot**: Successful execution output

#### Checkpoint 5.3 – Prometheus UI

Open browser:
```
http://<SERVER_IP>:9090
```

📸 **Screenshot**: Prometheus dashboard (Targets, Graph)

#### Checkpoint 5.4 – Grafana UI

Open browser:
```
http://<SERVER_IP>:3001
```

Login credentials:
- Username: `admin`
- Password: `admin`

📸 **Screenshot**: Grafana home page

#### Checkpoint 5.5 – Metrics Visualization

In Grafana:
1. Add Prometheus datasource: `http://prometheus:9090`
2. Import dashboard ID: `1860` (Node Exporter Full)
3. View graphs

📸 **Screenshot**: Grafana dashboards showing CPU, memory, container stats

---

### 🔰 PHASE 6: Final Verification (Viva Ready)

#### Checkpoint 6.1 – Reboot Test

Reboot the server:
```bash
ssh ubuntu@<SERVER_IP>
sudo reboot
```

Wait 2-3 minutes, then verify:
1. Money Flow app: `http://<SERVER_IP>`
2. Prometheus: `http://<SERVER_IP>:9090`
3. Grafana: `http://<SERVER_IP>:3001`

Check service status:
```bash
ssh ubuntu@<SERVER_IP>
sudo systemctl status money-flow
sudo systemctl status nginx
sudo systemctl status docker
docker ps
```

📸 **Screenshot**: All services running after reboot

---

## Troubleshooting

### Issue: Ansible ping fails
**Solution**: Check SSH key, ensure `ubuntu` user has sudo access
```bash
ssh-copy-id ubuntu@<SERVER_IP>
```

### Issue: Frontend build fails
**Solution**: Ensure Node.js 20.x is installed
```bash
ssh ubuntu@<SERVER_IP>
node --version  # Should be v20.x
```

### Issue: Backend not starting
**Solution**: Check logs
```bash
ssh ubuntu@<SERVER_IP>
sudo journalctl -u money-flow -f
```

### Issue: Nginx 502 Bad Gateway
**Solution**: Ensure backend is running
```bash
sudo systemctl restart money-flow
curl localhost:5000
```

### Issue: Docker containers not starting
**Solution**: Check Docker status
```bash
sudo systemctl status docker
cd /opt/monitoring
docker-compose logs
```

---

## Important URLs

After deployment, access these URLs (replace `<SERVER_IP>`):

| Service | URL | Credentials |
|---------|-----|-------------|
| Money Flow App | `http://<SERVER_IP>` | Register new account |
| Prometheus | `http://<SERVER_IP>:9090` | No auth |
| Grafana | `http://<SERVER_IP>:3001` | admin / admin |
| cAdvisor | `http://<SERVER_IP>:8080` | No auth |

---

## Re-running Individual Phases

You can run specific phases using tags:

```bash
# Only install Nginx
ansible-playbook -i inventory complete-deployment.yml --tags "phase1"

# Only deploy app
ansible-playbook -i inventory complete-deployment.yml --tags "phase2"

# Only configure proxy
ansible-playbook-i inventory complete-deployment.yml --tags "phase3"

# Only deploy monitoring
ansible-playbook -i inventory complete-deployment.yml --tags "phase4"
```

---

## Files Structure

```
ansible/
├── ansible.cfg                          # Ansible configuration
├── inventory                            # Server inventory
├── complete-deployment.yml              # Master playbook
├── README.md                            # This file
├── DEPLOYMENT_GUIDE.md                  # Detailed guide
├── playbooks/
│   ├── install-nginx.yml               # Phase 1
│   ├── deploy-money-flow.yml           # Phase 2
│   ├── configure-nginx-proxy.yml       # Phase 3
│   └── monitoring.yml                  # Phase 4
└── templates/
    ├── backend.env.j2                  # Backend environment vars
    ├── frontend.env.j2                 # Frontend environment vars
    ├── money-flow.service.j2           # systemd service
    ├── nginx-money-flow.conf.j2        # Nginx config
    ├── docker-compose.yml.j2           # Monitoring stack
    └── prometheus.yml.j2               # Prometheus config
```

---

## Support

For issues:
1. Check logs: `sudo journalctl -u money-flow -f`
2. Verify services: `sudo systemctl status money-flow nginx docker`
3. Check Ansible output for errors
4. Review `/var/log/nginx/money-flow-error.log`

---

**Made with ❤️ for Ansible Activity - Money Flow Deployment**
