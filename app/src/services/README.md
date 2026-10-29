# Internal services

The running Express monolith starts in src/server.js. Current business implementations live in src/modules and are composed locally by src/boundaries. Classes in this directory are internal helpers and the in-memory unit-test domain, not independently deployed microservices. See app/docs/MONOLITH.md from the repository root.
