<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';
use SkillSwap\Core\{Auth, Response, Validator};
Response::requireMethod('POST');
$data = Response::input();
$service->updateApplication(Validator::id($_GET['id'] ?? null, 'Application ID'), Auth::requireLogin(), (string) ($data['status'] ?? ''));
Response::json(['success' => true]);
