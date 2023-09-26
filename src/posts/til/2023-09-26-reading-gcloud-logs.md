---
title: Reading logs from GKE
date: 2023-09-26
tags: ["TIL", "tips&tricks", "GCP", "GKE"]
---

_Today I Learnt_ how to read JSON logs from Google Kubernetes Engine.

At work, we run a lot of services inside GKE. I wanted to figure out a nice way of reading our application logs, which are stored in JSON format.

I have previously used the _Logs Explorer_ tool in the GCP console but wanted to see if there was a way using the `gcloud` CLI.

## Fetching the logs using the gcloud CLI

Thankfully the CLI has a [`gcloud logging read`](https://cloud.google.com/sdk/gcloud/reference/logging/read) command for doing just this.

To start with, I used the following base command:

```shell
gcloud logging read --project=my-project --freshness=1h --limit=100 --format=json
```

In this command:
- `--project` limits the query to the specific project I'm interested in
- `--freshness=1h` will just show me logs from the previous hour (this can obviously be changed if we want to search in a larger time window)
- `--limit=100` will limit the log entries to the 100 most recent
- `--format=json` will return the logs in JSON format, which will make them easier to process

With this base command, we can add a number of filters to get just the log entries we're interested in. (The logging query language is quite powerful; you can find the documentation [here](https://cloud.google.com/logging/docs/view/logging-query-language))

In my case, I wanted to filter by a particular cluster name, Kubernetes pod label and a regex search on the actual log message, so used something like this:

```shell
gcloud logging read --project=my-project --freshness=1h --limit=100 --format=json \
'labels.k8s-pod/app=my-app AND resource.labels.cluster_name=my-cluster AND jsonPayload."log.message"=~"Request \w+ complete"'
```

This gave me JSON array of logs, which looked something like:

```json
[
    {
        "insertId": "zdic3bbzfuqxeosb",
        "jsonPayload": {
            "client_host": "35.191.19.100",
            "correlation_id": "5312279a-aed5-4b4b-b425-f27ec9a53d55",
            "log.level": "INFO",
            "log.message": "Request 2e59c032-0cc7-4cf6-8c30-0f2ad443a351 complete",
            "log.source.file": "app.py:309",
            "log.source.module": "app.services.execute",
            "log.time.iso8601": "2023-09-26T13:31:57.468574+00:00",
            "log.time.timestamp": 1695735117.468574,
            "request_method": "POST",
            "request_path": "/run",
            "user_agent": "axios/1.5.0"
        },
        "labels": {
            "compute.googleapis.com/resource_name": "gke-my-app-pool-730b810c-z4sx",
            "k8s-pod/app": "my-app",
            "k8s-pod/pod-template-hash": "967cdb65"
        },
        "logName": "projects/my-project/logs/stderr",
        "receiveTimestamp": "2023-09-26T13:31:58.540652867Z",
        "resource": {
            "labels": {
                "cluster_name": "my-cluster",
                "container_name": "my-app",
                "location": "europe-west4",
                "namespace_name": "default",
                "pod_name": "my-app-967cdb65-dv2b5",
                "project_id": "my-project"
            },
            "type": "k8s_container"
        },
        "severity": "ERROR",
        "timestamp": "2023-09-26T13:31:57.468713091Z"
    }
]
```

The next step was to parse these logs into a format that made them a bit more readable.

## Using `jq` to parse the logs

To parse the list of JSON logs entries, I used the ever-dependable [`jq`](https://jqlang.github.io/jq/).

What I wanted to do was to extract the raw log message and the timestamp for each log entry and output just a single line.

Looking through the `jq` docs to refresh my memory, and with (more than a little) help from my favourite AI assistant (the amazing [Phind](https://www.phind.com)) I was able to use the following jq query:

```shell
jq -r 'reverse | .[] | .jsonPayload | "\(.["log.time.iso8601"]) - \(.["log.message"])"'
```

Taking each part of this in turn:
- `-r` just gives us a raw string back rather than a JSON-encoded one
- `reverse` will reverse the order of the log entries (I find it more natural to see the newest entry last, as if I were reading a standard log file. Unfortunately we can't do this directly in the `gcloud logging read` command since [we're using the `--freshness` option](https://cloud.google.com/sdk/gcloud/reference/logging/read#--freshness))
- `|` is used to pipe the result from each individual filter into the next one
- `.[]` iterates over each item in the array
- `.jsonPayload` extracts the `jsonPayload` field from each object
- `"\(.["log.time.iso8601"]) - \(.["log.message"])"` is a string interpolation expression which will just output the `log.time.iso8601` and `log.message` fields, separated by a hyphen. (Note that we must use `.["log.time.iso8601"]` rather than `.log.time.iso8601` since the actual field name contains `'.'`)

Putting this all together we have the following command:

```shell
gcloud logging read --project=my-project --freshness=1h --limit=100 --format=json \
'labels.k8s-pod/app=my-app AND resource.labels.cluster_name=my-cluster AND jsonPayload."log.message"=~"Request \w+ complete"' | \
jq -r 'reverse | .[] | .jsonPayload | "\(.["log.time.iso8601"]) - \(.["log.message"])"'
```

which produces something like:

```plain
2023-09-26T12:03:24.648816+00:00 - Request 2e59c032-0cc7-4cf6-8c30-0f2ad443a351 complete
2023-09-26T12:03:47.547654+00:00 - Request 46ff6383-7a23-4c8b-969c-5272f40dff90 complete
2023-09-26T12:03:48.598261+00:00 - Request a8c6ff31-bd4f-43f9-aa1c-e4ca1f260fd9 complete
2023-09-26T12:05:31.395843+00:00 - Request bc73dc78-f692-40bc-a7a9-0a829d621e77 complete
```


