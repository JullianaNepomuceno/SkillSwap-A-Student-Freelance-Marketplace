<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';
use SkillSwap\Core\{Auth, Response, Validator};
Response::requireMethod('POST');
$data = Response::input();
$status = (string) ($data['status'] ?? '');
$id = Validator::id($_GET['id'] ?? null, 'Commission ID');
$service->updateCommissionStatus($id, Auth::requireLogin(), $status);
Response::json(['success' => true]);
