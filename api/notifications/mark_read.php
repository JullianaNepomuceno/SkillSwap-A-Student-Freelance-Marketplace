<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';
use SkillSwap\Core\{Auth, Response, Validator};
Response::requireMethod('POST');
$id = isset($_GET['id']) ? Validator::id($_GET['id'], 'Notification ID') : null;
$repository->markNotificationsRead(Auth::requireLogin(), $id);
Response::json(['success' => true]);
