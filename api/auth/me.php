<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';
use SkillSwap\Core\{Auth, Response};
Response::requireMethod('GET');
$id = Auth::requireLogin();
Response::json(['success' => true, 'user' => $repository->user($id)]);
