---
title: Python multiprocessing using a different Python executable
date: 2023-01-27
tags: ["TIL", "tips&tricks", "Python"]
---

_Today I Learnt_ how to run Python child processes using a different Python executable from the parent process.

This is probably only going to be useful in very rare cases, but I learnt that when using the Python `multiprocessing` library, you can actually run the child process using a different Python executable from that of the parent process.

One (fairly major, but understandable) limitation of this approach is that the child process must run an executable with the same minor version of Python as the parent (e.g. you can't run a child process using Python 3.11 when the parent process is running Python 3.9).

However, this approach could be useful if you wanted to use a different virtual environment in the child process to that of the parent.

In order to set the executable that the child process will use, you need to use the `set_executable` function from the `multiprocessing` package. (Note that the [documentation](https://docs.python.org/3/library/multiprocessing.html#multiprocessing.set_executable) on this feature is very minimal).

One important gotcha I found, when trying to use this together with a different virtual environment, is that the virtual environment's packages do not seem to be present on the `sys.path` by default, so you need to explicitly add them (which is what the `sys.path.append(sysconfig.get_path("platlib"))` line does in the code below).

Here's a working example of how this can be used:

```python
import multiprocessing
import sys
import sysconfig
from multiprocessing import Process


def main():
    # Try to get httpx version from current process.
    # This will fail since httpx is not installed in this environment
    print("In main venv:")
    print_httpx_version()

    print()

    # Get httpx version from child venv where it is installed
    multiprocessing.set_executable("./venv-child/bin/python")
    proc = Process(target=print_httpx_version)
    print("In child venv:")
    proc.start()


def print_httpx_version():
    # For some reason when starting a subprocess using a different Python
    # executable it doesn't add the venv's Python modules directory to sys.path
    # so this 'hack' will do this
    sys.path.append(sysconfig.get_path("platlib"))

    print(f"Python executable = {sys.executable}")
    try:
        import httpx

        print(httpx.__version__)
    except ImportError:
        print("httpx not installed")


if __name__ == "__main__":
    main()
```

[Link to GitHub Gist](https://gist.github.com/rossgray/e3a2ca13fff68107bc7839c2b194ceb8)

Which produces the following output:

```plain
In main venv:
Python executable = /Users/ross/.pyenv/versions/3.11.1/bin/python
httpx not installed

In child venv:
Python executable = /Users/ross/dev/tmp/multiproc/venv-child/bin/python
0.24.0
```
