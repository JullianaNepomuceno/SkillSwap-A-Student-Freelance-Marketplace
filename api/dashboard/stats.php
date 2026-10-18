<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';
use SkillSwap\Core\{Auth, Response};
Response::requireMethod('GET');
Response::json(['success' => true] + $repository->dashboard(Auth::requireLogin()));
