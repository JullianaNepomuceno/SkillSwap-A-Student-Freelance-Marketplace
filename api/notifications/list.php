<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';
use SkillSwap\Core\{Auth, Response};
Response::requireMethod('GET');
$notifications = $repository->notifications(Auth::requireLogin());
Response::json(['success' => true, 'notifications' => $notifications, 'unread_count' => count(array_filter($notifications, static fn(array $n): bool => !(bool) $n['is_read']))]);
