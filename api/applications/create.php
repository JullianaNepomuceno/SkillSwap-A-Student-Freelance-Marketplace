<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';
use SkillSwap\Core\{Auth, Response, Validator};
Response::requireMethod('POST');
$id = $service->apply(Validator::id($_GET['commission_id'] ?? null, 'Commission ID'), Auth::requireLogin(), Response::input());
Response::json(['success' => true, 'id' => $id], 201);
