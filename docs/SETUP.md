# Setup Guide

## Requirements

- PHP 8.0 or newer
- MySQL 8.0+ or MariaDB 10.4+
- Apache (bundled with XAMPP/WAMP) or PHP's built-in server
- A modern browser

## 1. Get the code

```bash
git clone https://github.com/<your-username>/skillswap.git
cd skillswap
```

The static frontend pages are in `app/`. Shared styles are in `app/css/`, and browser scripts are in `app/js/`. The HTML pages remain at the root of `app/`.

## 2. Create the database

**Option A: command line**
```bash
mysql -u root -p < database/skillswap.sql
```

**Option B: phpMyAdmin**
1. Open `http://localhost/phpmyadmin`.
2. Go to the **Import** tab.
3. Choose `database/skillswap.sql` and click **Go**.

## 3. Configure the connection

Configure the API connection in `api/config/config.php`, or set these environment variables:

```php
SKILLSWAP_DB_DSN=mysql:host=localhost;port=3306;dbname=skillswap;charset=utf8mb4
SKILLSWAP_DB_USER=root
SKILLSWAP_DB_PASSWORD=
```

The committed defaults automatically connect to the local XAMPP `skillswap` database. Start Apache and MySQL in XAMPP first. Do not commit real credentials.

## 4. Run the app

**With XAMPP/WAMP:** copy the folder into `htdocs` (or `www`), start Apache and MySQL, then open `http://localhost/skillswap/`.

**With PHP's built-in server:**
```bash
php -S localhost:8000
```
Then open `http://localhost:8000/`.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| "Database connection failed" | Check MySQL is running and the API DSN/user/password configuration |
| Blank page | Enable `display_errors` in `php.ini` while developing |
| Chart does not appear | Confirm the Chart.js script loads (check the browser console) |
| Foreign key error on import | Make sure the `commissions` table is created before `applications` |
