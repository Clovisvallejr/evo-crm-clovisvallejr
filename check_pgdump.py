import paramiko
import sys

host = '155.117.47.244'
user = 'administrator'
password = 'tW%CJS8$h*'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=user, password=password)

commands = """
sudo -S bash -c 'docker exec evo-crm-clovisvallejr_2-evo-crm-1 pg_dump --version'
"""
stdin, stdout, stderr = ssh.exec_command(commands)
stdin.write(password + '\n')
stdin.flush()
print("STDOUT:", stdout.read().decode('utf-8', errors='ignore'))
print("STDERR:", stderr.read().decode('utf-8', errors='ignore'))
ssh.close()
