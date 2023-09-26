# rossgray.co.uk

My personal website built using [Eleventy](https://www.11ty.dev/).

## Hosting

This site is hosted on [Cloudflare Pages](https://pages.cloudflare.com/).

It is set up to deploy on pushes to `main`.

## Development

Instructions so I don't forget how to build the site!

I'm using [`nvm`](https://github.com/nvm-sh/nvm) to manage Node.js versions so before running any npm commands one first needs to run:

```shell
nvm use
```

Then to ensure all dependencies are installed:

```shell
npm install
```

To run the server locally:

```shell
npm run start
```