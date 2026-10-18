<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';
use SkillSwap\Core\{Auth, Response};
Response::requireMethod('POST');
Auth::logout();
Response::json(['success' => true]);
