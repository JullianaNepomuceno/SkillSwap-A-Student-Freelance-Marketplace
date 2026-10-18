<?php
declare(strict_types=1);

return [
    // XAMPP defaults: MySQL on localhost:3306 with the root account and no password.
    'dsn' => getenv('SKILLSWAP_DB_DSN') ?: 'mysql:host=localhost;port=3306;dbname=skillswap;charset=utf8mb4',
    'username' => getenv('SKILLSWAP_DB_USER') ?: 'root',
    'password' => getenv('SKILLSWAP_DB_PASSWORD') ?: '',
];
