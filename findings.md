# Findings: Local Docker Environment Setup

## 2026-06-26: Initial Discovery
- **Context:** The production Evo-GO instance on VPS is unreachable/blocking access. The user wants to run Evo-GO locally alongside the CRM.
- **Docker Compose:** The root `docker-compose.yml` orchestrates `evo-crm`, `evo-auth`, `postgres`, `redis`, `evo-core`, `evo-processor`, `evo-bot-runtime`, `evo-frontend`. It is currently missing `evolution-go`.
- **Evo-Go Project:** The Evolution API project is located at `evolution-go/`. It contains the main API in Go and a Manager in React (`evolution-go-manager/`).
- **Integration:** The CRM's Core service (`evo-core`) connects to Evolution. If we run `evolution-go` locally, we'll map it to a port (e.g., 4000) and link the services.
