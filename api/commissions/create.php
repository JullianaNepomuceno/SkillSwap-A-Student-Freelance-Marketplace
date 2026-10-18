<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';
use SkillSwap\Core\{Auth, Response};
Response::requireMethod('POST');
$id = $service->createCommission(Auth::requireLogin(), Response::input());
Response::json(['success' => true, 'id' => $id], 201);
