#!/usr/bin/env pwsh
# Script para verificar status do Docker e serviços

Write-Host "=== EVO CRM DOCKER STATUS ===" -ForegroundColor Cyan

Write-Host "`n1. Verificando Docker..." -ForegroundColor Yellow
docker --version

Write-Host "`n2. Status dos Containers..." -ForegroundColor Yellow
docker compose ps

Write-Host "`n3. Verificando conectividade da API (CRM)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 5
    Write-Host "✓ CRM API respondendo: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ CRM API não responde: $_" -ForegroundColor Red
}

Write-Host "`n4. Verificando conectividade da API (Auth)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 5
    Write-Host "✓ Auth API respondendo: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ Auth API não responde: $_" -ForegroundColor Red
}

Write-Host "`n5. Verificando Processor..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/docs" -TimeoutSec 5
    Write-Host "✓ Processor respondendo: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ Processor não responde: $_" -ForegroundColor Red
}

Write-Host "`n6. Verificando Core Service..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5555" -TimeoutSec 5
    Write-Host "✓ Core Service respondendo: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ Core Service não responde: $_" -ForegroundColor Red
}

Write-Host "`n7. Verificando Bot Runtime..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5
    Write-Host "✓ Bot Runtime respondendo: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ Bot Runtime não responde: $_" -ForegroundColor Red
}

Write-Host "`n8. Logs recentes (CRM)..." -ForegroundColor Yellow
docker compose logs --tail=20 evo-crm

Write-Host "`n=== FIM DA VERIFICAÇÃO ===" -ForegroundColor Cyan
