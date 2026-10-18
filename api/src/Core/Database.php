<?php
declare(strict_types=1);

namespace SkillSwap\Core;

use PDO;
use PDOException;

final class Database
{
    public static function connect(array $config): PDO
    {
        if (!in_array('mysql', PDO::getAvailableDrivers(), true)) {
            throw new \RuntimeException('The PHP MySQL PDO driver is not enabled. Enable pdo_mysql in the PHP configuration used by Apache.');
        }

        try {
            return new PDO($config['dsn'], $config['username'], $config['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $exception) {
            error_log($exception->getMessage());
            throw new \RuntimeException('Database connection failed.');
        }
    }
}
