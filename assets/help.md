# How to use pool from the command line

## List file(s)

```bash
curl -skL <pool-url>/ls
curl -skL <pool-url>/ls/<filename-or-pattern>
```

## Get file contents (raw)

```bash
curl -skL <pool-url>/cat/<filename>
```

## Push file

```bash
curl -skL <pool-url>/push -F files=@<path-to-file>
```

## Pull file(s)

```bash
curl -skL <pool-url>/pull/<filename-or-pattern> -O
```

## Delete file

```bash
curl -skL <pool-url>/rm/<filename>
```
