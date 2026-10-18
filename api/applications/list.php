<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';
use SkillSwap\Core\{Auth, Response, Validator};
Response::requireMethod('GET');
$userId = Auth::requireLogin();
$commission = $repository->commission(Validator::id($_GET['commission_id'] ?? null, 'Commission ID'));
if (!$commission) throw new SkillSwap\Exceptions\NotFoundException('Commission not found.');
if ((int) $commission['user_id'] !== $userId) throw new SkillSwap\Exceptions\AuthorizationException('Only the owner can view applications.');
Response::json(['success' => true, 'applications' => $repository->applicationsForCommission((int) $commission['id'])]);
