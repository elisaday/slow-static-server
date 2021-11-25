# slow-static-server
A simple HTTP static resource server with latency for testing purpose.

## Install

```shell
npm i -g slow-static-server
```

## Usage

```shell
$ slow-static-server -h

Description

  A simple HTTP static resource server with latency for testing purpose.

Usage

  slow-http-server [options]

Options

  -h, --help              Display this usage guide.
  -s, --speed number      Transfer speed in `speed` KB per second [8192]
  -p, --port number       Port to use [8080]
  -r, --root-dir string   Root directory [./]
```