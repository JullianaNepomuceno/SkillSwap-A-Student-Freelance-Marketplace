<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';
use SkillSwap\Core\{Auth, Response, Validator};
Response::requireMethod('POST');
$id = Validator::id($_GET['id'] ?? null, 'Commission ID');
if (!$repository->deleteCommission($id, Auth::requireLogin())) throw new SkillSwap\Exceptions\AuthorizationException('Only the owner can delete this commission.');
Response::json(['success' => true]);
