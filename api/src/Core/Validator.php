<?php
declare(strict_types=1);

namespace SkillSwap\Core;

use SkillSwap\Exceptions\ValidationException;

final class Validator
{
    public static function text(array $data, string $key, int $max, bool $required = true): ?string
    {
        $value = trim((string) ($data[$key] ?? ''));
        if ($required && $value === '') {
            throw new ValidationException(ucwords(str_replace('_', ' ', $key)) . ' is required.');
        }
        if (mb_strlen($value) > $max) {
            throw new ValidationException(ucwords(str_replace('_', ' ', $key)) . ' is too long.');
        }
        return $value === '' ? null : $value;
    }

    public static function email(array $data): string
    {
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new ValidationException('A valid email is required.');
        }
        return $email;
    }

    public static function id(mixed $value, string $label = 'ID'): int
    {
        $id = filter_var($value, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if ($id === false) {
            throw new ValidationException($label . ' must be a positive integer.');
        }
        return (int) $id;
    }
}
