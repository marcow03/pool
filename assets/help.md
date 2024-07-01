# How to use pool from the command line

### List file(s)
```bash
curl <pool-url>/ls
curl <pool-url>/ls/<filename-or-pattern>
```

### Get file contents (raw)
```bash
curl <pool-url>/cat/<filename>
```

### Push file
```bash
curl <pool-url>/push -k -F files=@<path-to-file>
```

### Pull file(s)
```bash
curl <pool-url>/pull/<filename-or-pattern> -O
```

### Delete file
```bash
curl <pool-url>/rm/<filename>
```
