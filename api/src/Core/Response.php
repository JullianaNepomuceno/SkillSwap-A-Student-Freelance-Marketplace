<?php
declare(strict_types=1);

namespace SkillSwap\Core;

use SkillSwap\Exceptions\ValidationException;

final class Response
{
    public static function json(array $payload, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function requireMethod(string $method): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== $method) {
            header('Allow: ' . $method);
            self::json(['success' => false, 'message' => 'Method not allowed.'], 405);
        }
    }

    public static function input(): array
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (str_contains($contentType, 'application/json')) {
            $data = json_decode((string) file_get_contents('php://input'), true);
            if (!is_array($data)) {
                throw new ValidationException('Invalid JSON request body.');
            }
            return $data;
        }
        return $_POST;
    }
}
