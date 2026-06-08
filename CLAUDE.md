# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MeteoCollector is a TypeScript/Node.js service that polls IMGW (Polish Meteorological Agency) for weather warnings and exposes them via a REST API and optionally publishes them to Home Assistant via MQTT. It runs a cron job that detects warning changes and can fire events to an external gateway.

## Commands

```bash
npm run build          # Clean + compile TypeScript to build/
npm run start          # Compile and start
npm run start:auto     # Dev mode: nodemon watch + auto-rebuild
npm test               # Run all tests (Jest)
npm run lint           # ESLint
npm run format         # Prettier (write)
npm run test:syntax    # Format + lint check (CI-style)
```

Run a single test file:

```bash
npx jest test/unit/WarningsCronService.test.ts
```

Docker (development):

```bash
docker-compose up
```

## Architecture

```
src/
├── index.ts                    # Entrypoint — wires Express + IoC, starts cron
├── application/                # Orchestration layer (WeatherApplication)
├── controllers/                # routing-controllers HTTP layer (@JsonController)
├── services/                   # Business logic (WarningsService, WarningsCronService, HomeAssistantMqttService)
├── payloads/                   # DTOs returned by services / exposed via API
├── models/                     # Raw data models from IMGW API (IMGWWarningModel)
├── helper/                     # Stateless utility classes (LocationHelper, TimeHelper)
├── plugin/                     # Optional feature modules (StylesPlugin)
└── infrastructure/
    ├── env/                    # envalid-validated env config (Env.ts + specs/)
    ├── errors/                 # Custom error classes (HttpClientError)
    ├── http/                   # HttpClient (got wrapper) + Query Objects
    ├── ioc/                    # Inversify container, TYPES symbols, bindings
    ├── logger/                 # Winston logger settings
    ├── mqtt/                   # MqttClient wrapper + topic helpers
    ├── enum/                   # TerritoryEnum
    └── types/                  # Shared TypeScript types
```

**Request flow:** `Controller → Application → Service → HttpClient → IMGW API`

**Cron flow:** `WarningsCronService` (on schedule) → `WeatherApplication.getWarnings()` → signature diff check → POST to event gateway + MQTT publish

## Dependency Injection (Inversify)

All managed classes use `@injectable()`. Inject dependencies as class properties with `@inject(TYPES.X)` — the project uses **property injection, not constructor injection**.

Every new binding must be:

1. Added as a `Symbol.for(...)` entry in `src/infrastructure/ioc/Types.ts`
2. Registered in `src/infrastructure/ioc/inversify.config.ts` (`.inSingletonScope()` is the default)

```typescript
@injectable()
export class MyService {
  @inject(TYPES.Logger)
  private readonly logger: Logger;

  @inject(TYPES.HttpClient)
  private readonly httpClient: HttpClient;
}
```

Controllers are loaded via `controllerModule` (Inversify `ContainerModule`) in `ControllerModule.ts` and must also be listed in the `controllers` array in `index.ts`.

## HTTP Query Pattern

All outbound HTTP calls go through `HttpClient.execute(query)`. Requests are encapsulated in Query Objects implementing `QueryableInterface`:

```typescript
export class MyHttpQuery implements QueryableInterface {
  public getQuery(): QueryInterface {
    return {url: '...', method: 'GET', headers: {'Content-Type': 'application/json'}};
  }
}
```

## Environment Variables

Env is validated at startup by `envalid`. Add new variables to the appropriate spec file:

- `src/infrastructure/env/specs/Strings.ts`
- `src/infrastructure/env/specs/Booleans.ts`
- `src/infrastructure/env/specs/Numbers.ts`

Access via `import Env from '../infrastructure/env/Env'` — never `process.env` directly.

Key variables: `WARNINGS_TERRITORY`, `WARNINGS_CRON_SCHEDULE`, `ENABLE_WARNINGS_CRON`, `ENABLE_HA_MQTT`, `MQTT_URL`, `EVENT_GATEWAY`, `API_PORT`.

## Testing

- Framework: Jest + ts-jest
- Test files: `test/unit/**/*.test.ts` (mirror `src/`)
- Mocking: manual `jest.fn()` — no automock or `@automock/jest`
- External modules (`node-cron`, `got`, `fs`) are mocked with `jest.mock()` at the top of test files
- Dependencies are injected directly onto the service instance via `(service as any).logger = ...` — no DI container in tests

## Code Style

- TypeScript strict mode, target ES2020
- All class members must have explicit access modifiers (`public`, `protected`, `private`)
- Semicolons always; single quotes for strings; no trailing commas in objects
- Curly braces always required (`curly: 'error'`)
- No `console.*` — use the injected `winston` Logger
- Unused imports are a lint error (`unused-imports/no-unused-imports`)
- `@typescript-eslint/explicit-member-accessibility` is enforced

## Signature-based Deduplication

`WarningsCronService` persists a JSON signature of the last-seen warnings to `data/last_warnings_signature.json`. An event is only sent to the gateway when the signature changes. The `data/` directory is gitignored (runtime state).
