#!/usr/bin/env python3
import subprocess
import os

os.chdir(r'C:\xampp\htdocs\imperio-crm\evo-crm-clovisvallejr_2')

print("=" * 60)
print("EXECUTANDO REBUILD_FINAL.bat")
print("=" * 60)
print()

result = subprocess.run([r'C:\xampp\htdocs\imperio-crm\evo-crm-clovisvallejr_2\REBUILD_FINAL.bat'], shell=True)

print()
print("=" * 60)
print(f"Script finalizado com código: {result.returncode}")
print("=" * 60)
