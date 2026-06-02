# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

---

### Added

### Changed

### Removed

---

## [1.3.0] - 2026.06.02

### ADDED

- Add HealthController with `/health` and `/alive` endpoints, update dependencies

## [1.2.0] - 2026.04.22

### ADDED

- Introduced MQTT integration for Home Assistant.
- Added `HomeAssistantMqttService` and `MqttClient` bindings.

### CHANGED

- Upgraded dependencies, including `mqtt`, `multer`, and others.
- Adjusted type registrations in the IoC container.

## [1.1.0] - 2026.02.16

### Added

- Added `getErrorMessage` method to `WarningsResponsePayload`.
- Add WarningsCronService and integrate cron-based warnings handling
- Introduced `WarningsCronService` to manage cron-based warnings notifications.
- Integrated environmental configurations for warnings cron setup.
- Added utility functions and HTTP query for posting warning events.
- Enhanced error handling in `HttpClient`.
- Configured jest for unit testing and added GitHub Actions workflow for CI.

### Changed

- Updated GitHub Actions workflow to support all tag formats.
- Enhanced initial run logging in `WarningsCronService`.
- Upgraded `multer` and other dependencies; removed outdated packages.
- Migrated Dockerfile to Node.js 24.13.0.
- Updated dependencies in `package.json`.

## [v1.0.0] - 2025.01.10

- Production release of the service
