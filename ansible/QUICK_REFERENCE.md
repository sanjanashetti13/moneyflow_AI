# 🚀 Money Flow Ansible - Quick Reference Card

## Pre-Flight Checklist

- [ ] Replace `<SERVER_IP>` in `ansible/inventory`
- [ ] Replace `<SERVER_IP>` in `playbooks/deploy-money-flow.yml` (line 21)
- [ ] Replace `<SERVER_IP>` in `playbooks/configure-nginx-proxy.yml` (line 10)
- [ ] Ensure SSH access: `ssh ubuntu@<SERVER_IP>`

---

## Essential Commands

### Test Connectivity
```bash
cd ansible
ansible -i inventory webserver -m ping
```

### Complete Deployment (ONE COMMAND!)
```bash
ansible-playbook -i inventory complete-deployment.yml
```

### Individual Phases
```bash
# Phase 1: Nginx
ansible-playbook -i inventory playbooks/install-nginx.yml

# Phase 2: App Deployment
ansible-playbook -i inventory playbooks/deploy-money-flow.yml

# Phase 3: Reverse Proxy
ansible-playbook -i inventory playbooks/configure-nginx-proxy.yml

# Phase 4: Monitoring
ansible-playbook -i inventory playbooks/monitoring.yml
```

---

## Verification Commands

### On Control Machine
```bash
# Check Ansible version
ansible --version

# Ping server
ansible -i inventory webserver -m ping
```

### On Target Server
```bash
# SSH into server
ssh ubuntu@<SERVER_IP>

# Check services
sudo systemctl status money-flow
sudo systemctl status nginx
sudo systemctl status docker

# View backend logs
sudo journalctl -u money-flow -f

# Test backend
curl http://localhost:5000

# Check Docker containers
docker ps

# View Nginx logs
sudo tail -f /var/log/nginx/money-flow-error.log
```

---

## Important URLs

| Service | URL | Login |
|---------|-----|-------|
| **Money Flow App** | `http://<SERVER_IP>` | Register new account |
| **Nginx Default** | `http://<SERVER_IP>` | (Before proxy config) |
| **Prometheus** | `http://<SERVER_IP>:9090` | No auth |
| **Grafana** | `http://<SERVER_IP>:3001` | admin / admin |
| **cAdvisor** | `http://<SERVER_IP>:8080` | No auth |

---

## File Structure

```
ansible/
├── ansible.cfg                     ← Ansible config
├── inventory                       ← Server IP HERE
├── complete-deployment.yml         ← Master playbook
├── README.md
├── DEPLOYMENT_GUIDE.md
├── playbooks/
│   ├── install-nginx.yml          ← Phase 1
│   ├── deploy-money-flow.yml      ← Phase 2 (UPDATE SERVER_IP)
│   ├── configure-nginx-proxy.yml  ← Phase 3 (UPDATE SERVER_IP)
│   └── monitoring.yml             ← Phase 4
└── templates/
    ├── backend.env.j2
    ├── frontend.env.j2
    ├── money-flow.service.j2
    ├── nginx-money-flow.conf.j2
    ├── docker-compose.yml.j2
    └── prometheus.yml.j2
```

---

## Screenshot Checklist

### Phase 1: Ansible Setup
- [ ] `ansible --version`
- [ ] `cat inventory`
- [ ] `ansible -i inventory webserver -m ping` (showing "pong")

### Phase 2: Nginx
- [ ] Nginx playbook execution
- [ ] Browser: Nginx default page `http://<SERVER_IP>`

### Phase 3: App Deployment
- [ ] Deploy playbook execution
- [ ] `ls -la /var/www/money-flow/` on server
- [ ] `cat /etc/systemd/system/money-flow.service`
- [ ] `sudo systemctl status money-flow`
- [ ] `curl localhost:5000` showing "Backend OK ✔"

### Phase 4: Reverse Proxy
- [ ] `cat /etc/nginx/sites-available/money-flow`
- [ ] `sudo nginx -t` (syntax ok)
- [ ] **Browser: Money Flow App UI** `http://<SERVER_IP>` 🚨 CRITICAL

### Phase 5: Monitoring
- [ ] Monitoring playbook execution
- [ ] `docker ps` showing 4 containers
- [ ] Browser: Prometheus `http://<SERVER_IP>:9090`
- [ ] Browser: Grafana login `http://<SERVER_IP>:3001`
- [ ] Grafana dashboard with graphs

### Phase 6: Final
- [ ] All services running after `sudo reboot`

---

## Common Issues & Fixes

### Ansible ping fails
```bash
# Check SSH key
ssh-copy-id ubuntu@<SERVER_IP>
```

### Backend not starting
```bash
ssh ubuntu@<SERVER_IP>
sudo systemctl restart money-flow
sudo journalctl -u money-flow -n 50
```

### Nginx 502 Bad Gateway
```bash
# Ensure backend is running
sudo systemctl status money-flow
curl localhost:5000
```

### Docker containers not running
```bash
cd /opt/monitoring
docker-compose ps
docker-compose logs
docker-compose up -d
```

---

## Viva Quick Answers

**Q: What is Ansible?**  
A: Configuration management and automation tool using YAML playbooks for idempotent deployments.

**Q: Why reverse proxy?**  
A: Nginx serves static files, proxies API to backend, provides SSL termination, and load balancing.

**Q: Why systemd?**  
A: Auto-starts service on boot, restarts on failure, provides centralized logging.

**Q: Why Docker for monitoring?**  
A: Isolated environments, easy deployment, version control, quick scaling.

**Q: What does Prometheus do?**  
A: Collects and stores time-series metrics from various targets.

**Q: What does Grafana do?**  
A: Visualizes metrics from Prometheus with customizable dashboards.

---

## Technology Stack

- **Frontend:** React (Vite), TailwindCSS
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas (Cloud)
- **Web Server:** Nginx
- **Process Manager:** systemd
- **Automation:** Ansible
- **Monitoring:** Prometheus + Grafana
- **Containerization:** Docker + Docker Compose

---

## Deployment Flow

```
1. Ansible Control Machine
   ↓ (SSH)
2. Ubuntu Server
   ↓ (Installs)
3. Node.js + Nginx + Docker
   ↓ (Deploys)
4. Money Flow App (systemd)
   ↓ (Proxies)
5. Nginx → Backend (5000) + Frontend (static)
   ↓ (Monitors)
6. Prometheus + Grafana (Docker)
```

---

## Final Pre-Viva Check

- [ ] Can access Money Flow app UI
- [ ] Can register and login
- [ ] Prometheus shows all targets UP
- [ ] Grafana shows metrics graphs
- [ ] All services survive reboot
- [ ] All screenshots taken
- [ ] Know the command to re-run deployment

---

**Remember:** The complete deployment command is:
```bash
ansible-playbook -i inventory complete-deployment.yml
```

**Good luck! 🎓**
