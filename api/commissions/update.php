<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';
use SkillSwap\Core\{Auth, Response, Validator};
Response::requireMethod('POST');
$service->updateCommission(Validator::id($_GET['id'] ?? null, 'Commission ID'), Auth::requireLogin(), Response::input());
Response::json(['success' => true]);
