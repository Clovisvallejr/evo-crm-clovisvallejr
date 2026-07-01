import paramiko
import sys

host = '155.117.47.244'
user = 'administrator'
password = r'tW%CJS8$h*'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(host, username=user, password=password)
    
    script = """#!/bin/bash
sudo docker logs --tail 200 evo-crm-clovisvallejr_2-evo-processor-1 | grep -i "error"
"""
    
    cmd = f"cat << 'EOF' > /tmp/fix_db.sh\n{script}\nEOF\nchmod +x /tmp/fix_db.sh && sudo -S /tmp/fix_db.sh"
    stdin, stdout, stderr = ssh.exec_command(cmd)
    stdin.write(password + '\n')
    stdin.flush()
    
    for line in iter(stdout.readline, ""):
        sys.stdout.buffer.write(line.encode('utf-8', errors='replace'))
        sys.stdout.flush()
    for line in iter(stderr.readline, ""):
        sys.stdout.buffer.write(line.encode('utf-8', errors='replace'))
        sys.stdout.flush()

except Exception as e:
    print("Error:", e)
finally:
    ssh.close()
