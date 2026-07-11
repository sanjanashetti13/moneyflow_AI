#!/bin/bash

# Money Flow - Complete Deployment Script
# This script runs the master Ansible playbook to set up:
# 1. Nginx Server
# 2. Money Flow App (Backend + Frontend)
# 3. Nginx Reverse Proxy
# 4. Monitoring (Prometheus + Grafana)

echo "===================================================="
echo "🚀 Starting Money Flow Complete Deployment..."
echo "===================================================="

# Check if we are in the right directory
if [ ! -f "complete-deployment.yml" ]; then
    echo "❌ Error: Please run this script from the 'ansible' directory."
    exit 1
fi

# Show current IP for verification
MY_IP=$(hostname -I | awk '{print $1}')
echo "📌 Current WSL IP: $MY_IP"
echo "👉 Make sure this matches your inventory file!"
echo "----------------------------------------------------"

# Run the master playbook
# Note: -K (capital K) asks for sudo (become) password
export ANSIBLE_CONFIG=./ansible.cfg
ansible-playbook -i inventory complete-deployment.yml -K

echo "----------------------------------------------------"
echo "✅ Script Finished!"
echo "===================================================="
