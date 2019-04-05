# Radix API Contract Testing

This application provides [contract testing](https://martinfowler.com/bliki/ContractTest.html) of the [Radix API](https://github.com/equinor/radix-api) and consumer projects. This document is for Radix developers, or anyone interested in poking around.

## Windows notes

If using Windows, you need at least Windows 10 Creators Update.

There is currently [a problem](https://github.com/docker/for-win/issues/56) with Docker that prevents auto-reload of the development server from working when source files change. A simple workaround is to use [a little watcher process](https://github.com/FrodeHus/docker-windows-volume-watcher/releases).

## Running, building

Good news: for development, you only need [Docker](https://store.docker.com/search?type=edition&offering=community) and a [code editor](https://code.visualstudio.com/)! To start the development environment:

    docker-compose up

This builds a Docker image `radix-api-contract-testing-dev`, runs it in the container `radix-api-contract-testing-dev_container`, mounts the local directory into `/app` in the container, and runs `npm run nodemon`, which watches for changes and serves the app on port 3000. The debugger also runs on port 9222.

Stop the server with Ctrl+C, but also run `docker-compose down` to clean the Docker state.

**Important**: the `node_modules` and `workspace` directories are **not** mapped to the host (if you don't have `node_modules` locally, it will be created but it will remain empty and [it will not map](https://stackoverflow.com/questions/29181032/add-a-volume-to-docker-but-exclude-a-sub-folder) between local and container environments). NPM commands must be run in the container, even if you have NPM installed on the host. To run a command in the container:

    docker exec -ti radix-api-contract-testing-dev_container <command>

For instance:

    docker exec -ti radix-api-contract-testing-dev_container npm install --save left-pad

To get a shell:

    docker exec -ti radix-api-contract-testing-dev_container sh

If you need to nuke `node_modules` or `workspace` you can stop the container and run:

    docker container rm radix-api-contract-testing-dev_container
    docker volume rm radix-api-contract-testing-dev_node-modules
    docker volume rm radix-api-contract-testing-dev_workspace

If you change `package.json` (e.g. add a dependency), or want to force a clean dev environment, you will need to rebuild the dev image:

    docker-compose up --build

## Deploying

This is a Radix application. Commits to `master` will trigger a build and deployment to the only (`prod`) environment.

## Project configuration

The GitHub repos for `radix-web-console` and `radix-api` require a [webhook](https://developer.github.com/webhooks/) each, with the following settings:

- Payload URL: `https://radix-api-contract-testing.app.radix.equinor.com/webhook`
- Content type: `application/json`
- Secret: The same as used in the [Secerts](#secrets) section below
- Events: Just the `push` event

## Secrets

The application requires one environment variable, `GITHUB_SHARED_SECRET`, that should be defined as a Radix secret in production. For local development, instead of an environment variable you can create the file `/config/local.json` (this won't be added to git), and specify the value as such:

```json
{
  "githubSharedSecret": "secret-value-here"
}
```

## Folder structure

The base directory is organised as defined by Create React App. Within `/src`, however:

- `/project-*/`:
- `/static/`:
- `/views/`:
- `/index.js`: Entry point for the app

## Coding standards

Coding standards are enforced by [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/). Please use appropriate plugins for your editor:

- [ESLint for VS Code](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [ESLint for Sublime Text](https://github.com/SublimeLinter/SublimeLinter-eslint)
- [ESLint for Atom](https://atom.io/packages/linter-eslint)
- [Prettier for VS Code](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Prettier for Sublime Text](https://github.com/danreeves/sublime-prettier)
- [Prettier for Atom](https://atom.io/packages/prettier-atom)

To get ESLint to run properly from your editor you will need to have it set up in your local environment (not the dev Docker container). You can do that by running:

    npm install --only=dev && npm install --no-save eslint

Note the "no save" `eslint` installation — this is to avoid a conflict with the version within the Docker container, which sometimes does not work from within a code editor.

## Production build

The production build is containerised in the project's `Dockerfile`. To run the build image locally:

    docker build -t radix-api-contract-testing-prod .
    docker run --name radix-api-contract-testing-prod_container --rm -p 8080:80 radix-api-contract-testing-prod

The web server will be available on http://localhost:8080
