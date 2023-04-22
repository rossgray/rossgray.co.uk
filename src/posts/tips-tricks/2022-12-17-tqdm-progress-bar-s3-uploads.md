---
title: Creating a progress bar for uploads to an S3 presigned URL using tqdm
date: 2022-12-17
tags: ["tips&tricks", "Python"]
---

The [tqdm](https://tqdm.github.io) library is a helpful Python library for creating progress bars. I needed to create a progress bar for an upload to an S3 presigned URL. Presigned URLs are a way to grant someone permission to perform an action on an object in S3 (such as uploading or reading a file). You can find out more info on them [here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html).

`tqdm` does have a mechanism of using a callback to update a progress bar and this can be used to monitor the progress of file downloads and uploads. They even have an example of how to do this in their [docs](https://github.com/tqdm/tqdm#hooks-and-callbacks):

```python
import requests, os
from tqdm import tqdm

eg_link = "https://caspersci.uk.to/matryoshka.zip"
response = requests.get(eg_link, stream=True)
with tqdm.wrapattr(open(os.devnull, "wb"), "write",
                   miniters=1, desc=eg_link.split('/')[-1],
                   total=int(response.headers.get('content-length', 0))) as fout:
    for chunk in response.iter_content(chunk_size=4096):
        fout.write(chunk)
```

The problem in my use case was that I wanted to use the [httpx](https://www.python-httpx.org/) library (which is fantastic BTW) and I couldn’t upload the data using multipart form data (S3 doesn’t support this, at least from what I could see).

I tried using `tqdm`'s `CallbackIOWrapper` but `httpx` expects the `content` argument to be a file-like object so this didn’t work. Therefore I decided to build something similar but inheriting from Python’s `BytesIO` class:

```python
class CallbackBytesIO(io.BytesIO):

    def __init__(self, callback: Callable, initial_bytes: bytes):
        self._callback = callback
        super().__init__(initial_bytes)

    def read(self, size=-1) -> bytes:
        data = super().read(size)
        self._callback(len(data))
        return data
```

This works by effectively providing the same interface as `BytesIO` but wrapping the `read(...)` method, which gets called by `httpx` as it uploads the file data. The wrapped method will update the progress bar each time it gets called.

This was my final code:

```python
file_size = os.path.getsize(file_path)
progress_bar = tqdm(
    desc="Uploading file"
    unit="B",
    unit_scale=True,
    total=file_size,
    unit_divisor=1024,
)

with open(file_path, "rb") as f:
    data = CallbackBytesIO(progress.update, f.read())

response = httpx.put(
    upload_url,
    content=data,
)
```
