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

## 2. Create the database

**Option A: command line**
```bash
mysql -u root -p < database/schema.sql
```

**Option B: phpMyAdmin**
1. Open `http://localhost/phpmyadmin`.
2. Go to the **Import** tab.
3. Choose `database/schema.sql` and click **Go**.

## 3. Configure the connection

Edit `includes/db.php`:

```php
<?php
$host = 'localhost';
$db   = 'skillswap';
$user = 'root';
$pass = '';          // set your MySQL password

$mysqli = new mysqli($host, $user, $pass, $db);
if ($mysqli->connect_errno) {
    die('Database connection failed.');
}
$mysqli->set_charset('utf8mb4');
```

> Do not commit real credentials. Keep them out of version control (for example in a git-ignored `config.local.php`).

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
| "Database connection failed" | Check MySQL is running and the credentials in `includes/db.php` |
| Blank page | Enable `display_errors` in `php.ini` while developing |
| Chart does not appear | Confirm the Chart.js script loads (check the browser console) |
| Foreign key error on import | Make sure the `gigs` table is created before `applications` |
