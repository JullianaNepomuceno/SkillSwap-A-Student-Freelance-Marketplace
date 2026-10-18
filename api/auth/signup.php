<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';
use SkillSwap\Core\Response;
Response::requireMethod('POST');
$id = $service->signup(Response::input());
SkillSwap\Core\Auth::login($id);
Response::json(['success' => true, 'user' => $repository->user($id)], 201);
