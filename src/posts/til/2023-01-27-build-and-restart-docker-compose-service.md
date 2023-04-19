---
title: How to rebuild and restart a running Docker Compose service
date: 2023-01-27
tags: ["TIL", "tips&tricks", "Docker"]
---

_Today I Learnt_ how to correctly rebuild and restart a running Docker Compose service.

I had a set of services running under Docker Compose and needed to rebuild and restart one of these services as I had made some changes and wanted the service redeployed without stopping and starting everything.

I thought I might be able to do something like the following:

```plain
docker compose build my-service
docker compose restart my-service
```

However, for some reason this didn't seem to work. After a quick bit of searching online I found the following command which did what I wanted:

```plain
docker compose up -d --no-deps --build --force-recreate my-service
```
