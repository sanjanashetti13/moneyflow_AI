# Money Flow Ansible Deployment - Complete Checkpoint Guide

This guide maps **exactly** to your checkpoint list for the viva demonstration.

---

## 🔰 PHASE 0: PREPARATION (Before Ansible)

### ✅ Checkpoint 0.1 – Your App Ready

**What to show:**
- Money Flow app is a MERN stack (MongoDB, Express, React, Node.js)
- Backend runs on port 5000
- Frontend runs on port 5173 (development)
- Uses MongoDB Atlas (cloud database)

**Local testing commands:**
```bash
# Backend
cd moneyflow-backend
npm install
node index.js

# Frontend (separate terminal)
cd moneyflow-frontend
npm install
npm run dev
```

**📸 Screenshot:** App running on `http://localhost:5173`

---

### ✅ Checkpoint 0.2 – Ubuntu Server Ready

**Requirements:**
- Ubuntu 20.04/22.04 VM/EC2/Cloud instance
- SSH access configured
- Know your server IP address

**Test SSH access:**
```bash
ssh ubuntu@<YOUR_SERVER_IP>
```

**📸 Screenshot:** Successful SSH login showing `ubuntu@hostname:~$`

---

## 🔰 PHASE 1: Ansible Setup

### ✅ Checkpoint 1.1 – Install Ansible (Control Machine)

**On your Windows machine using WSL/Ubuntu:**
```bash
sudo apt update
sudo apt install ansible -y
ansible --version
```

**Expected output:**
```
ansible [core 2.x.x]
  config file = None
  ...
```

**📸 Screenshot:** `ansible --version` command output

---

### ✅ Checkpoint 1.2 – Inventory File

**Location:** `ansible/inventory`

**View the file:**
```bash
cd ansible
cat inventory
```

**Content shows:**
```ini
[webserver]
<SERVER_IP> ansible_user=ubuntu ansible_python_interpreter=/usr/bin/python3

[webserver:vars]
ansible_ssh_common_args='-o StrictHostKeyChecking=no'
```

**Before running:** Replace `<SERVER_IP>` with your actual IP!

**📸 Screenshot:** Inventory file content

---

### ✅ Checkpoint 1.3 – Test Connectivity

**Command:**
```bash
ansible -i inventory webserver -m ping
```

**Expected SUCCESS output:**
```
<YOUR_IP> | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

**📸 Screenshot:** Successful ping output showing "pong"

---

## 🔰 PHASE 2: Nginx Installation Playbook

### ✅ Checkpoint 2.1 – Create Playbook

**Location:** `ansible/playbooks/install-nginx.yml`

**View the playbook:**
```bash
cat playbooks/install-nginx.yml
```

**Key tasks in the playbook:**
- Install Nginx
- Enable Nginx
- Start Nginx

**Run the playbook:**
```bash
ansible-playbook -i inventory playbooks/install-nginx.yml
```

**Expected output:**
```
PLAY [Install and Configure Nginx] *************

TASK [Update apt cache] ************************
ok: [<SERVER_IP>]

TASK [Install Nginx] ***************************
changed: [<SERVER_IP>]

TASK [Enable Nginx service] ********************
ok: [<SERVER_IP>]

TASK [Start Nginx service] *********************
changed: [<SERVER_IP>]

PLAY RECAP *************************************
<SERVER_IP> : ok=X changed=X
```

**📸 Screenshots:**
1. Playbook file content
2. Successful execution with green "ok" and "changed" status

---

### ✅ Checkpoint 2.2 – Verify Nginx

**Open browser and navigate to:**
```
http://<YOUR_SERVER_IP>
```

**You should see:**
```
Welcome to nginx!

If you see this page, the nginx web server is successfully installed and working.
```

**📸 Screenshot:** Nginx default welcome page in browser

---

## 🔰 PHASE 3: Money Flow App Deployment (MOST IMPORTANT)

### ✅ Checkpoint 3.1 – Deployment Playbook Created

**Location:** `ansible/playbooks/deploy-money-flow.yml`

**View tasks:**
```bash
cat playbooks/deploy-money-flow.yml | grep "name:"
```

**Key tasks included:**
- ✅ Install Node.js (v20.x)
- ✅ Create app user (`moneyflow`)
- ✅ Create app directory (`/var/www/money-flow`)
- ✅ Copy backend and frontend code
- ✅ Install dependencies
- ✅ Build frontend
- ✅ Create systemd service

**📸 Screenshot:** Playbook file showing task names

---

### ✅ Checkpoint 3.2 – App Code Deployment

**BEFORE running:** Update server IP in `playbooks/deploy-money-flow.yml`:
```yaml
server_ip: "<SERVER_IP>"  # Line 21 - REPLACE THIS
```

**Run deployment:**
```bash
ansible-playbook -i inventory playbooks/deploy-money-flow.yml
```

**Verify on server:**
```bash
ssh ubuntu@<SERVER_IP>
ls -la /var/www/money-flow/
```

**Expected output:**
```
drwxr-xr-x 4 moneyflow moneyflow 4096 Jan  8 15:00 .
drwxr-xr-x 3 root      root      4096 Jan  8 15:00 ..
drwxr-xr-x 3 moneyflow moneyflow 4096 Jan  8 15:00 backend
drwxr-xr-x 4 moneyflow moneyflow 4096 Jan  8 15:00 frontend
```

**📸 Screenshot:** Server directory listing showing backend and frontend folders

---

### ✅ Checkpoint 3.3 – Install App Dependencies

**Check playbook output for these tasks:**
```
TASK [Install backend dependencies] ************
changed: [<SERVER_IP>]

TASK [Install frontend dependencies] ***********
changed: [<SERVER_IP>]
```

**Verify manually (optional):**
```bash
ssh ubuntu@<SERVER_IP>
ls /var/www/money-flow/backend/node_modules/
ls /var/www/money-flow/frontend/node_modules/
```

**📸 Screenshot:** Ansible task showing npm install success

---

### ✅ Checkpoint 3.4 – systemd Service for Money Flow App

**Service file location:** `/etc/systemd/system/money-flow.service`

**View the service file:**
```bash
ssh ubuntu@<SERVER_IP>
cat /etc/systemd/system/money-flow.service
```

**Key content:**
```ini
[Unit]
Description=Money Flow Backend Application
After=network.target

[Service]
Type=simple
User=moneyflow
WorkingDirectory=/var/www/money-flow/backend
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Check service status:**
```bash
sudo systemctl status money-flow
```

**Expected output:**
```
● money-flow.service - Money Flow Backend Application
     Loaded: loaded (/etc/systemd/system/money-flow.service; enabled)
     Active: active (running) since Wed 2026-01-08 15:30:45 UTC
   Main PID: 12345 (node)
      Tasks: 11
     Memory: 45.2M
```

**📸 Screenshots:**
1. Service file content
2. `systemctl status money-flow` showing "active (running)"

---

### ✅ Checkpoint 3.5 – App Running (Internal Port)

**Test backend internally:**
```bash
ssh ubuntu@<SERVER_IP>
curl http://localhost:5000
```

**Expected response:**
```
Backend OK ✔
```

**Also test API endpoint:**
```bash
curl http://localhost:5000/api/currency
```

**Expected:** JSON response with currency data

**📸 Screenshot:** curl command and response showing "Backend OK ✔"

---

## 🔰 PHASE 4: Nginx Reverse Proxy

### ✅ Checkpoint 4.1 – Nginx Config via Ansible

**BEFORE running:** Update server IP in `playbooks/configure-nginx-proxy.yml`:
```yaml
server_ip: "<SERVER_IP>"  # Line 10 - REPLACE THIS
```

**Run the proxy configuration:**
```bash
ansible-playbook -i inventory playbooks/configure-nginx-proxy.yml
```

**View Nginx config on server:**
```bash
ssh ubuntu@<SERVER_IP>
cat /etc/nginx/sites-available/money-flow
```

**Key configuration:**
- Serves frontend from `/var/www/money-flow/frontend/dist`
- Proxies `/api/*` to `localhost:5000`
- Proxies `/auth/*` to `localhost:5000`

**Test Nginx configuration:**
```bash
sudo nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**📸 Screenshots:**
1. Nginx config file content
2. `nginx -t` success message

---

### ✅ Checkpoint 4.2 – Public Access 🚨 VERY IMPORTANT

**Open browser and navigate to:**
```
http://<YOUR_SERVER_IP>
```

**You should see:**
- Money Flow application homepage
- Login/Register interface
- Modern UI with forms

**Test registration:**
1. Click "Sign Up" or "Register"
2. Enter email and password
3. Register successfully
4. Login with credentials

**📸 Screenshot:** Money Flow app UI in browser (THIS IS CRITICAL FOR VIVA!)

---

## 🔰 PHASE 5: Monitoring with Ansible + Docker

### ✅ Checkpoint 5.1 – Monitoring Playbook

**Location:** `ansible/playbooks/monitoring.yml`

**View playbook:**
```bash
cat playbooks/monitoring.yml | grep "name:" | head -20
```

**Key tasks:**
- Install Docker
- Install Docker Compose
- Create monitoring directory
- Copy docker-compose.yml
- Copy prometheus.yml
- Start monitoring stack

**📸 Screenshot:** Playbook file showing Docker installation tasks

---

### ✅ Checkpoint 5.2 – Start Monitoring Stack

**Run monitoring playbook:**
```bash
ansible-playbook -i inventory playbooks/monitoring.yml
```

**Expected output:**
```
TASK [Install Docker] **************************
changed: [<SERVER_IP>]

TASK [Install Docker Compose] ******************
changed: [<SERVER_IP>]

TASK [Start monitoring stack] ******************
changed: [<SERVER_IP>]
```

**Verify on server:**
```bash
ssh ubuntu@<SERVER_IP>
docker ps
```

**Expected containers:**
- prometheus
- grafana
- node-exporter
- cadvisor

**📸 Screenshot:** Ansible playbook execution success

---

### ✅ Checkpoint 5.3 – Prometheus UI

**Open browser:**
```
http://<YOUR_SERVER_IP>:9090
```

**You should see:**
- Prometheus dashboard
- Navigation: Graph, Alerts, Status
- Query interface

**Test a query:**
1. In the query box, type: `up`
2. Click "Execute"
3. You should see metrics for all targets

**Check targets:**
- Go to Status → Targets
- All targets should show "UP" in green

**📸 Screenshot:** Prometheus dashboard showing query results or targets page

---

### ✅ Checkpoint 5.4 – Grafana UI

**Open browser:**
```
http://<YOUR_SERVER_IP>:3001
```

**Login credentials:**
- Username: `admin`
- Password: `admin`

**First login:**
- You'll be prompted to change password
- You can skip or set a new password

**You should see:**
- Grafana welcome page
- "Add your first data source" prompt
- Navigation sidebar

**📸 Screenshot:** Grafana home page after login

---

### ✅ Checkpoint 5.5 – Metrics Visualization

**Add Prometheus data source:**
1. Click "Add data source"
2. Select "Prometheus"
3. URL: `http://prometheus:9090`
4. Click "Save & Test"

**Import dashboard:**
1. Click "+" → Import
2. Enter dashboard ID: `1860` (Node Exporter Full)
3. Select Prometheus datasource
4. Click "Import"

**You should see graphs for:**
- CPU usage
- Memory usage
- Disk I/O
- Network traffic
- System load

**📸 Screenshot:** Grafana dashboard showing CPU, memory, and system metrics graphs

---

## 🔰 PHASE 6: Final Verification (Viva Ready)

### ✅ Checkpoint 6.1 – Reboot Test

**Reboot the server:**
```bash
ssh ubuntu@<SERVER_IP>
sudo reboot
```

**Wait 2-3 minutes for server to restart**

**After reboot, verify ALL services auto-start:**

**1. Money Flow app:**
```
http://<YOUR_SERVER_IP>
```
Should load the app immediately

**2. Check systemd services:**
```bash
ssh ubuntu@<SERVER_IP>
sudo systemctl status money-flow
sudo systemctl status nginx
sudo systemctl status docker
```

All should show "active (running)"

**3. Check Docker containers:**
```bash
docker ps
```

All 4 containers should be running:
- prometheus
- grafana
- node-exporter
- cadvisor

**4. Test monitoring:**
- Prometheus: `http://<YOUR_IP>:9090`
- Grafana: `http://<YOUR_IP>:3001`

**📸 Screenshot:** Terminal showing all services "active (running)" after reboot

---

## 🔰 PHASE 7: Documentation (Marks Booster)

### Screenshots to Include in Record

**Create a document/PPT with these screenshots:**

1. ✅ **Inventory file** - `cat ansible/inventory`
2. ✅ **Ping success** - `ansible -i inventory webserver -m ping`
3. ✅ **Nginx playbook execution** - Terminal output
4. ✅ **Nginx default page** - Browser screenshot
5. ✅ **Deploy playbook execution** - Terminal output
6. ✅ **systemd service status** - `systemctl status money-flow`
7. ✅ **Money Flow app UI** - **MOST IMPORTANT** - Browser screenshot
8. ✅ **Nginx config file** - `cat /etc/nginx/sites-available/money-flow`
9. ✅ **Nginx test success** - `nginx -t` output
10. ✅ **Monitoring playbook execution** - Terminal output
11. ✅ **Docker containers running** - `docker ps` output
12. ✅ **Prometheus dashboard** - Browser screenshot
13. ✅ **Grafana login page** - Browser screenshot
14. ✅ **Grafana metrics graphs** - Dashboard with CPU/memory graphs
15. ✅ **Reboot test** - Services running after reboot

---

## 🎯 Quick Command Reference

**Complete deployment (one command):**
```bash
cd ansible
ansible-playbook -i inventory complete-deployment.yml
```

**Individual phases:**
```bash
# Phase 1: Nginx only
ansible-playbook -i inventory playbooks/install-nginx.yml

# Phase 2: App only
ansible-playbook -i inventory playbooks/deploy-money-flow.yml

# Phase 3: Proxy only
ansible-playbook -i inventory playbooks/configure-nginx-proxy.yml

# Phase 4: Monitoring only
ansible-playbook -i inventory playbooks/monitoring.yml
```

**Verification commands:**
```bash
# Check all services
ssh ubuntu@<SERVER_IP> "sudo systemctl status money-flow nginx docker"

# Check Docker containers
ssh ubuntu@<SERVER_IP> "docker ps"

# Test backend
ssh ubuntu@<SERVER_IP> "curl localhost:5000"

# View logs
ssh ubuntu@<SERVER_IP> "sudo journalctl -u money-flow -n 50"
```

---

## 🎓 Viva Questions & Answers

**Q: What is Ansible?**
A: Ansible is an open-source automation tool for configuration management, application deployment, and task automation using YAML playbooks.

**Q: Why use Ansible over manual deployment?**
A: Ansible provides idempotent, repeatable, and version-controlled deployments, reducing human errors and deployment time.

**Q: What is a reverse proxy?**
A: A reverse proxy (Nginx) sits between clients and backend servers, forwarding requests to the backend and returning responses to clients. Benefits include load balancing, SSL termination, and static file serving.

**Q: Why systemd service?**
A: systemd manages services in Linux, ensuring the app starts on boot, restarts on failure, and provides centralized logging.

**Q: What is Prometheus?**
A: Prometheus is an open-source monitoring system that collects metrics from targets and stores time-series data.

**Q: What is Grafana?**
A: Grafana is a visualization platform that creates dashboards from data sources like Prometheus.

**Q: Why MongoDB Atlas?**
A: Cloud-hosted, fully managed MongoDB, eliminating the need to install and maintain MongoDB on the server, with built-in backups and scaling.

---

## ✅ DONE!

You now have:
- ✅ Complete Ansible automation
- ✅ Money Flow app deployed
- ✅ Nginx reverse proxy configured
- ✅ systemd service management
- ✅ Prometheus + Grafana monitoring
- ✅ Auto-start on reboot
- ✅ All checkpoints covered

**Good luck with your viva! 🎓**
