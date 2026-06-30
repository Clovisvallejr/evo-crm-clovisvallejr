import paramiko
import sys
import time

host = '155.117.47.244'
user = 'administrator'
password = 'tW%CJS8$h*'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=user, password=password)

commands = """
sudo -S bash -c '
cd /root/n8n-evogo
sed -i "/N8N_PROTOCOL=https/a \      - N8N_SECURE_COOKIE=false" docker-compose.yml
docker compose up -d
'
"""
stdin, stdout, stderr = ssh.exec_command(commands)
stdin.write(password + '\n')
stdin.flush()
print("STDOUT:", stdout.read().decode('utf-8', errors='ignore'))
print("STDERR:", stderr.read().decode('utf-8', errors='ignore'))
ssh.close()
