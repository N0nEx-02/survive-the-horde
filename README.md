# Survive the Horde

A browser-based survival roguelike.

## Running locally

Serve the project directory with PHP:

```powershell
php -S localhost:8000
```

Open `http://localhost:8000/`.

## Database configuration

Set these environment variables before starting PHP:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASS
```

Import `schema.sql` to create the MySQL table. Database credentials must not be committed to source control.
