<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';
use SkillSwap\Core\Response;
use SkillSwap\Core\Auth;
Response::requireMethod('POST');
$user = $service->login(Response::input());
Auth::login((int) $user['id']);
unset($user['password_hash']);
Response::json(['success' => true, 'user' => $user]);
