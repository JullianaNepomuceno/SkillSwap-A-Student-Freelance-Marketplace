<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';
use SkillSwap\Core\{Auth, Response};
Response::requireMethod('GET');
Auth::requireLogin();
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
Response::json([
    'success' => true,
    'commissions' => $repository->commissions($_GET),
    'total' => $repository->openCommissionCount(),
]);
