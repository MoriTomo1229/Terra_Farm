# Containerize Terra Farm with Docker

This ExecPlan is a living document. Maintain it per `PLANS.md` in the repository root. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept current as work proceeds.

## Purpose / Big Picture

Enable Terra Farm to run entirely inside Docker so contributors and players can start the static web app without installing Node or `http-server` locally. After implementation, a user should be able to execute `docker-compose up` and load `http://localhost:8080/` to play the game, matching the non-Docker experience.

## Progress

- [x] (2025-11-24 23:48Z) Drafted ExecPlan outlining Dockerfile, docker-compose setup, and documentation.
- [x] (2025-11-24 23:51Z) Added `.dockerignore`, `Dockerfile`, and updated `npm run dev` to honor `PORT` and bind `0.0.0.0`.
- [x] (2025-11-24 23:52Z) Created `docker-compose.yml` wiring build, port mapping, and environment passthrough.
- [ ] Validate container startup locally (build + `docker-compose up`); README now includes Docker usage but runtime verification remains.

## Surprises & Discoveries

- None yet; record any unexpected behavior while building or running the container.

## Decision Log

- Decision: Use a Node.js `http-server` container (based on `node:alpine`) instead of Nginx to mirror the existing local workflow and avoid introducing a new web server configuration.
  Rationale: The project already serves static assets via `http-server`; keeping the same server reduces risk and minimizes configuration.
  Date/Author: 2025-11-24 / Coding agent.
- Decision: Allow the server port to be overridden via `PORT` so host and container mappings stay aligned without editing the compose file.
  Rationale: Developers can switch to a non-default port when 8080 is busy while keeping a single source of truth for the running port.
  Date/Author: 2025-11-24 / Coding agent.

## Outcomes & Retrospective

To be completed after implementation and validation; summarize whether Docker workflow matches the local experience and note any remaining risks.

## Context and Orientation

Terra Farm is a static web app rooted at `index.html` with assets under `css/`, `js/`, `data/`, and `images/`. Local development uses `npm run dev`, which runs `http-server` on port 8080. There is no backend state; all data is shipped with the repo. Dockerizing the app requires:
1. Building a Node-based image that installs dependencies and serves the repo root with `http-server` bound to `0.0.0.0`.
2. Providing a `docker-compose.yml` (Compose v1 command `docker-compose`) that builds the image, publishes port 8080, and optionally allows overriding the port via an environment variable.
3. Updating documentation so users know how to build and run the containerized app.

## Plan of Work

Add a `.dockerignore` to keep `node_modules`, npm logs, and build artifacts out of the Docker build context. Create a `Dockerfile` that sets `/app` as the working directory, copies `package*.json`, runs `npm ci` to install `http-server`, copies the remaining project files, and starts the server with `npm run dev` while binding to all interfaces and an overridable port (default 8080). Add a `docker-compose.yml` that defines a `terra-farm` service building from the repo root, mapping `${PORT:-8080}` inside the container to the same host port, and enabling live rebuilds via `docker-compose up --build`. Update `package.json` if needed so the dev script honors a `PORT` environment variable and binds to `0.0.0.0`. Finally, extend `README.md` with concise Docker build/run instructions using `docker-compose` (hyphenated) and expected URLs.

## Concrete Steps

1. From `/Users/moritomo/dev/Terra_Farm`, add `.dockerignore` with common Node exclusions (`node_modules`, npm logs, `.DS_Store`, build cache).
2. Create `Dockerfile` that:
   - Uses `node:18-alpine` (or similar) as the base.
   - Sets `WORKDIR /app`.
   - Copies `package.json` and `package-lock.json`.
   - Runs `npm ci` to install dependencies (including `http-server`).
   - Copies the rest of the repo into `/app`.
   - Exposes port 8080 and sets the default `CMD` to `npm run dev`.
3. Update `package.json` `dev` script to bind `http-server` to `0.0.0.0` and respect `PORT` if set, keeping default 8080.
4. Add `docker-compose.yml` that builds the local Dockerfile, names the service `terra-farm`, maps `${PORT:-8080}:8080`, and forwards `PORT` into the container when provided. Use the `docker-compose` CLI (hyphenated) in all instructions.
5. Update `README.md` with a Docker section describing build/run commands (`docker-compose build`, `docker-compose up -d`), default URL, how to override port, and how to stop/clean up.
6. Validate by running `docker-compose build` then `docker-compose up` locally; verify the site loads at `http://localhost:8080/`. Capture any issues in `Surprises & Discoveries`.
7. Mark completed steps in `Progress`, add notes to `Decision Log` if plans change, and fill `Outcomes & Retrospective` once finished.

## Validation and Acceptance

Acceptance: A user with Docker and docker-compose installed can run the app without Node locally.

- Build: `docker-compose build` from the repo root completes without errors.
- Run: `docker-compose up -d` starts the `terra-farm` service listening on `http://localhost:8080/` (or the overridden port). `docker-compose ps` shows the service healthy.
- Browse: Loading the URL renders Terra Farm and assets (maps, images) correctly.
- Stop/Cleanup: `docker-compose down` stops containers without leaving stray processes.

## Idempotence and Recovery

Docker builds are reproducible; rerunning `docker-compose build` updates the image with new code. Containers can be restarted safely with `docker-compose down` followed by `docker-compose up`. If a build fails mid-way, re-run the same command after addressing the error; no persistent state is written inside the container beyond `node_modules` in the image layer.

## Artifacts and Notes

Expected command outputs for reference:

    $ docker-compose build
    ...
    Successfully built terra-farm

    $ docker-compose ps
    Name                Command               State           Ports
    terra-farm_app_1    "npm run dev"         Up      0.0.0.0:8080->8080/tcp

## Interfaces and Dependencies

- New files: `.dockerignore`, `Dockerfile`, `docker-compose.yml`.
- `package.json` `dev` script must accept `PORT` and bind `0.0.0.0` for container use.
- External dependency: Docker Engine with docker-compose (hyphenated CLI). Base image `node:18-alpine` pulls from Docker Hub at build time.

Plan update note (2025-11-24 23:48Z): Initial ExecPlan drafted to guide Dockerization work and capture baseline decisions.
Plan update note (2025-11-24 23:52Z): Recorded progress after adding Docker artifacts, compose wiring, and documentation updates; validation is still outstanding.
