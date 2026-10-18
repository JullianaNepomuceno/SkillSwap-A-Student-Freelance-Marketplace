<?php
declare(strict_types=1);

use SkillSwap\Core\Database;
use SkillSwap\Core\Response;
use SkillSwap\Exceptions\{AuthorizationException, ConflictException, NotFoundException, ValidationException};

session_start();
spl_autoload_register(static function (string $class): void {
    $prefix = 'SkillSwap\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }
    $file = __DIR__ . '/src/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
    if (is_file($file)) {
        require $file;
    }
});

set_exception_handler(static function (Throwable $exception): never {
    $status = match (true) {
        $exception instanceof ValidationException => 422,
        $exception instanceof AuthorizationException => 403,
        $exception instanceof NotFoundException => 404,
        $exception instanceof ConflictException => 409,
        default => 500,
    };
    if ($status === 500) {
        error_log($exception->getMessage());
        $message = 'An unexpected server error occurred.';
    } else {
        $message = $exception->getMessage();
    }
    Response::json(['success' => false, 'message' => $message], $status);
});

$pdo = Database::connect(require __DIR__ . '/config/config.php');
$repository = new SkillSwap\Repositories\MarketplaceRepository($pdo);
$service = new SkillSwap\Services\MarketplaceService($repository, $pdo);
