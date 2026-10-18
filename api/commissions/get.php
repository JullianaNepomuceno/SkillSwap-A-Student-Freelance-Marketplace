<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';
use SkillSwap\Core\{Auth, Response, Validator};
Auth::requireLogin();
Response::requireMethod('GET');
$id = Validator::id($_GET['id'] ?? null, 'Commission ID');
$repository->closeCommissionIfAccepted($id);
$commission = $repository->commission($id);
if (!$commission) throw new SkillSwap\Exceptions\NotFoundException('Commission not found.');
$isOwner = (int) $commission['user_id'] === Auth::currentId();
$result = ['commission' => $commission, 'is_owner' => $isOwner];
if ($isOwner) $result['applications'] = $repository->applicationsForCommission($id);
if (!$isOwner) {
    $result['accepted_contact'] = $repository->acceptedContact($id, Auth::currentId());
    $result['my_application'] = $repository->applicationForUser($id, Auth::currentId());
}
Response::json(['success' => true] + $result);
