<?php
declare(strict_types=1);

namespace SkillSwap\Services;

use PDO;
use PDOException;
use SkillSwap\Core\Validator;
use SkillSwap\Exceptions\{AuthorizationException, ConflictException, NotFoundException, ValidationException};
use SkillSwap\Repositories\MarketplaceRepository;

final class MarketplaceService
{
    public function __construct(private MarketplaceRepository $repository, private PDO $db) {}

    public function signup(array $data): int
    {
        $name = Validator::text($data, 'full_name', 100);
        $email = Validator::email($data);
        $password = (string) ($data['password'] ?? '');
        $role = (string) ($data['role'] ?? '');
        if (strlen($password) < 8) throw new ValidationException('Password must be at least 8 characters.');
        if (!in_array($role, ['earn', 'find-help', 'both'], true)) throw new ValidationException('Invalid account goal.');
        if (($data['confirm_password'] ?? $password) !== $password) throw new ValidationException('Passwords do not match.');
        if (!in_array((string) ($data['terms'] ?? ''), ['1', 'on', 'true'], true)) throw new ValidationException('You must agree to the terms.');
        if ($this->repository->findUserByEmail($email)) {
            throw new ConflictException('An account with that email already exists.');
        }

        try {
            return $this->repository->createUser($name, $email, password_hash($password, PASSWORD_DEFAULT), $role);
        } catch (PDOException $exception) {
            // Keep the database unique constraint as the final protection against
            // two simultaneous signups using the same email.
            if ($exception->getCode() === '23000') {
                throw new ConflictException('An account with that email already exists.');
            }
            throw $exception;
        }
    }

    public function login(array $data): array
    {
        $user = $this->repository->findUserByEmail(Validator::email($data));
        if (!$user || !password_verify((string) ($data['password'] ?? ''), $user['password_hash'])) throw new AuthorizationException('Invalid email or password.');
        return $user;
    }

    public function createCommission(int $userId, array $data): int
    {
        $validated = $this->commissionData($data);
        return $this->repository->createCommission($userId, $validated);
    }

    public function updateCommission(int $id, int $userId, array $data): void
    {
        if (!$this->repository->commission($id)) throw new NotFoundException('Commission not found.');
        if (!$this->repository->updateCommission($id, $userId, $this->commissionData($data))) throw new AuthorizationException('Only the owner can update this commission.');
    }

    public function apply(int $commissionId, int $userId, array $data): int
    {
        $commission = $this->repository->commission($commissionId);
        if (!$commission) throw new NotFoundException('Commission not found.');
        if ((int) $commission['user_id'] === $userId) throw new AuthorizationException('You cannot apply to your own commission.');
        if ($commission['status'] !== 'Open') throw new ConflictException('Applications are closed for this commission.');
        if ($this->repository->applicationExists($commissionId, $userId)) throw new ConflictException('You have already applied to this commission.');
        $proposal = Validator::text($data, 'proposal', 2000);
        $rate = filter_var($data['proposed_rate'] ?? null, FILTER_VALIDATE_FLOAT);
        if ($rate === false || $rate <= 0) throw new ValidationException('Proposed rate must be greater than zero.');
        if ((float) $rate > (float) $commission['budget']) throw new ValidationException('Proposed rate cannot exceed the commission budget.');
        $this->db->beginTransaction();
        try {
            $id = $this->repository->createApplication($commissionId, $userId, $proposal, (float) $rate);
            $this->repository->addNotification((int) $commission['user_id'], $commissionId, 'application_received', 'A student applied to your commission "' . $commission['title'] . '".');
            $this->db->commit();
            return $id;
        } catch (\Throwable $exception) {
            $this->db->rollBack();
            throw $exception;
        }
    }

    public function updateApplication(int $id, int $userId, string $status): void
    {
        if (!in_array($status, ['Accepted', 'Rejected'], true)) throw new ValidationException('Invalid application status.');
        $application = $this->repository->application($id);
        if (!$application) throw new NotFoundException('Application not found.');
        if ((int) $application['owner_id'] !== $userId) throw new AuthorizationException('Only the commission owner can review applications.');
        if ($application['commission_status'] !== 'Open') throw new ConflictException('Applications can only be reviewed while the commission is open.');
        if ($status === 'Accepted' && $application['status'] === 'Accepted') throw new ConflictException('This application is already accepted.');
        $type = $status === 'Accepted' ? 'application_accepted' : 'application_rejected';
        $this->db->beginTransaction();
        try {
            $applications = $status === 'Accepted' ? $this->repository->applicationsForCommission((int) $application['commission_id']) : [];
            if ($status === 'Accepted') {
                foreach ($applications as $other) {
                    if ((int) $other['id'] !== (int) $id && $other['status'] === 'Accepted') {
                        throw new ConflictException('Another applicant is already accepted for this commission.');
                    }
                }
            }
            $this->repository->setApplicationStatus($id, $status);
            $this->repository->addNotification((int) $application['user_id'], (int) $application['commission_id'], $type, 'Your application for "' . $application['title'] . '" was ' . strtolower($status) . '.');
            if ($status === 'Accepted') {
                foreach ($applications as $other) {
                    if ((int) $other['id'] !== (int) $id && $other['status'] === 'Pending') {
                        $this->repository->setApplicationStatus((int) $other['id'], 'Rejected');
                        $this->repository->addNotification((int) $other['user_id'], (int) $application['commission_id'], 'application_rejected', 'Your application for "' . $application['title'] . '" was rejected because another applicant was accepted.');
                    }
                }
                $this->repository->closeCommissionAfterAcceptance((int) $application['commission_id']);
            }
            $this->db->commit();
        } catch (\Throwable $exception) {
            $this->db->rollBack();
            throw $exception;
        }
    }

    public function updateCommissionStatus(int $id, int $userId, string $status): void
    {
        if (!in_array($status, ['Open', 'In Progress', 'Completed'], true)) throw new ValidationException('Invalid commission status.');
        $commission = $this->repository->commission($id);
        if (!$commission) throw new NotFoundException('Commission not found.');
        if ((int) $commission['user_id'] !== $userId) throw new AuthorizationException('Only the owner can change this commission status.');
        $this->db->beginTransaction();
        try {
            $this->repository->setCommissionStatus($id, $userId, $status);
            if ($status === 'Completed') {
                $applications = $this->repository->applicationsForCommission($id);
                foreach ($applications as $application) {
                    if ($application['status'] === 'Accepted') {
                        $this->repository->addNotification((int) $application['user_id'], $id, 'commission_completed', '"' . $commission['title'] . '" has been marked completed.');
                    }
                }
            }
            $this->db->commit();
        } catch (\Throwable $exception) {
            $this->db->rollBack();
            throw $exception;
        }
    }

    private function commissionData(array $data): array
    {
        $category = (string) ($data['category'] ?? '');
        $categories = ['Coding & IT', 'Arts & Design', 'Writing & Research', 'Tutoring & Review', 'Media & Content'];
        if (!in_array($category, $categories, true)) throw new ValidationException('Invalid commission category.');
        $budget = filter_var($data['budget'] ?? null, FILTER_VALIDATE_FLOAT);
        $deadline = (string) ($data['deadline'] ?? '');
        $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $deadline);
        if ($budget === false || $budget <= 0) throw new ValidationException('Budget must be greater than zero.');
        if (!$date || $date->format('Y-m-d') !== $deadline || $date < new \DateTimeImmutable('today')) throw new ValidationException('Deadline must be a valid date today or later.');
        return ['title' => Validator::text($data, 'title', 150), 'category' => $category, 'description' => Validator::text($data, 'description', 10000), 'budget' => $budget, 'deadline' => $deadline];
    }
}
