# Local module composition

These boundaries compose modules inside one Express process using one MySQL pool. They do not expose RPC/HTTP hosts or separate databases. Entry: index.js; route-facing compatibility adapter: legacy-adapter.js. The pre-refactor service architecture is preserved in archive/microservices-20261029/project at the repository root.
