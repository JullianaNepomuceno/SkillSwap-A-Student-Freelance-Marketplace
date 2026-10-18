<?php
declare(strict_types=1);

namespace SkillSwap\Core;

use SkillSwap\Exceptions\AuthorizationException;

final class Auth
{
    public static function requireLogin(): int
    {
        if (empty($_SESSION['user_id'])) {
            Response::json(['success' => false, 'message' => 'Authentication required.'], 401);
        }
        return (int) $_SESSION['user_id'];
    }

    public static function login(int $userId): void
    {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
    }

    public static function logout(): void
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], (bool) $params['secure'], (bool) $params['httponly']);
        }
        session_destroy();
    }

    public static function currentId(): ?int
    {
        return isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
    }
}
