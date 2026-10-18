<?php
declare(strict_types=1);

namespace SkillSwap\Repositories;

use PDO;

final class MarketplaceRepository
{
    public function __construct(private PDO $db) {}

    public function findUserByEmail(string $email): ?array
    {
        $statement = $this->db->prepare('SELECT * FROM users WHERE email = ?');
        $statement->execute([$email]);
        return $statement->fetch() ?: null;
    }

    public function user(int $id): ?array
    {
        $statement = $this->db->prepare('SELECT id, full_name, email, role, created_at FROM users WHERE id = ?');
        $statement->execute([$id]);
        return $statement->fetch() ?: null;
    }

    public function createUser(string $name, string $email, string $hash, string $role): int
    {
        $statement = $this->db->prepare('INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)');
        $statement->execute([$name, $email, $hash, $role]);
        return (int) $this->db->lastInsertId();
    }

    public function commissions(array $filters): array
    {
        $where = ["c.status = 'Open'"];
        $params = [];
        if (!empty($filters['category'])) { $where[] = 'c.category = ?'; $params[] = $filters['category']; }
        if (!empty($filters['keyword'])) { $where[] = '(c.title LIKE ? OR c.description LIKE ?)'; $term = '%' . $filters['keyword'] . '%'; $params[] = $term; $params[] = $term; }
        if (isset($filters['min_budget']) && $filters['min_budget'] !== '') { $where[] = 'c.budget >= ?'; $params[] = (float) $filters['min_budget']; }
        if (isset($filters['max_budget']) && $filters['max_budget'] !== '') { $where[] = 'c.budget <= ?'; $params[] = (float) $filters['max_budget']; }
        $sort = ($filters['sort'] ?? '') === 'budget_asc' ? 'c.budget ASC' : (($filters['sort'] ?? '') === 'budget_desc' ? 'c.budget DESC' : 'c.created_at DESC');
        $limit = min(max((int) ($filters['limit'] ?? 12), 1), 50);
        $offset = max((int) ($filters['offset'] ?? 0), 0);
        $sql = 'SELECT c.*, u.full_name AS owner_name, COUNT(a.id) AS applicant_count
                FROM commissions c
                JOIN users u ON u.id = c.user_id
                LEFT JOIN applications a ON a.commission_id = c.id
                WHERE ' . implode(' AND ', $where) . " GROUP BY c.id ORDER BY $sort LIMIT $limit OFFSET $offset";
        $statement = $this->db->prepare($sql);
        $statement->execute($params);
        return $statement->fetchAll();
    }

    public function openCommissionCount(): int
    {
        $statement = $this->db->query("SELECT COUNT(*) FROM commissions WHERE status = 'Open'");
        return (int) $statement->fetchColumn();
    }

    public function commission(int $id): ?array
    {
        $statement = $this->db->prepare('SELECT c.*, u.full_name AS owner_name, u.email AS owner_email, COUNT(a.id) AS application_count
            FROM commissions c
            JOIN users u ON u.id = c.user_id
            LEFT JOIN applications a ON a.commission_id = c.id
            WHERE c.id = ?
            GROUP BY c.id');
        $statement->execute([$id]);
        return $statement->fetch() ?: null;
    }

    public function createCommission(int $userId, array $data): int
    {
        $statement = $this->db->prepare('INSERT INTO commissions (user_id, title, category, description, budget, deadline) VALUES (?, ?, ?, ?, ?, ?)');
        $statement->execute([$userId, $data['title'], $data['category'], $data['description'], $data['budget'], $data['deadline']]);
        return (int) $this->db->lastInsertId();
    }

    public function updateCommission(int $id, int $userId, array $data): bool
    {
        $statement = $this->db->prepare('UPDATE commissions SET title = ?, category = ?, description = ?, budget = ?, deadline = ? WHERE id = ? AND user_id = ?');
        $statement->execute([$data['title'], $data['category'], $data['description'], $data['budget'], $data['deadline'], $id, $userId]);
        return $statement->rowCount() > 0;
    }

    public function deleteCommission(int $id, int $userId): bool
    {
        $statement = $this->db->prepare('DELETE FROM commissions WHERE id = ? AND user_id = ?');
        $statement->execute([$id, $userId]);
        return $statement->rowCount() > 0;
    }

    public function setCommissionStatus(int $id, int $userId, string $status): bool
    {
        $statement = $this->db->prepare('UPDATE commissions SET status = ? WHERE id = ? AND user_id = ?');
        $statement->execute([$status, $id, $userId]);
        return $statement->rowCount() > 0;
    }

    public function closeCommissionAfterAcceptance(int $id): bool
    {
        $statement = $this->db->prepare("UPDATE commissions SET status = 'In Progress' WHERE id = ? AND status = 'Open'");
        $statement->execute([$id]);
        return $statement->rowCount() > 0;
    }

    public function closeCommissionIfAccepted(int $id): void
    {
        $statement = $this->db->prepare(
            "UPDATE commissions c
             SET c.status = 'In Progress'
             WHERE c.id = ? AND c.status = 'Open'
               AND EXISTS (
                 SELECT 1 FROM applications a
                 WHERE a.commission_id = c.id AND a.status = 'Accepted'
               )"
        );
        $statement->execute([$id]);
    }

    public function applicationsForCommission(int $commissionId): array
    {
        $statement = $this->db->prepare('SELECT a.*, u.full_name AS applicant_name, u.email AS applicant_email FROM applications a JOIN users u ON u.id = a.user_id WHERE a.commission_id = ? ORDER BY a.created_at DESC');
        $statement->execute([$commissionId]);
        return $statement->fetchAll();
    }

    public function acceptedContact(int $commissionId, int $userId): ?array
    {
        $statement = $this->db->prepare(
            'SELECT owner.full_name AS owner_name, owner.email AS owner_email,
                    applicant.full_name AS applicant_name, applicant.email AS applicant_email
             FROM applications a
             JOIN commissions c ON c.id = a.commission_id
             JOIN users owner ON owner.id = c.user_id
             JOIN users applicant ON applicant.id = a.user_id
             WHERE a.commission_id = ? AND a.user_id = ? AND a.status = \'Accepted\''
        );
        $statement->execute([$commissionId, $userId]);
        return $statement->fetch() ?: null;
    }

    public function application(int $id): ?array
    {
        $statement = $this->db->prepare('SELECT a.*, c.user_id AS owner_id, c.title, c.status AS commission_status, u.full_name AS applicant_name FROM applications a JOIN commissions c ON c.id = a.commission_id JOIN users u ON u.id = a.user_id WHERE a.id = ?');
        $statement->execute([$id]);
        return $statement->fetch() ?: null;
    }

    public function createApplication(int $commissionId, int $userId, string $proposal, float $rate): int
    {
        $statement = $this->db->prepare('INSERT INTO applications (commission_id, user_id, proposal, proposed_rate) VALUES (?, ?, ?, ?)');
        $statement->execute([$commissionId, $userId, $proposal, $rate]);
        return (int) $this->db->lastInsertId();
    }

    public function applicationExists(int $commissionId, int $userId): bool
    {
        $statement = $this->db->prepare('SELECT 1 FROM applications WHERE commission_id = ? AND user_id = ?');
        $statement->execute([$commissionId, $userId]);
        return (bool) $statement->fetchColumn();
    }

    public function setApplicationStatus(int $id, string $status): void
    {
        $statement = $this->db->prepare('UPDATE applications SET status = ? WHERE id = ?');
        $statement->execute([$status, $id]);
    }

    public function addNotification(int $userId, ?int $commissionId, string $type, string $message): void
    {
        $statement = $this->db->prepare('INSERT INTO notifications (user_id, commission_id, type, message) VALUES (?, ?, ?, ?)');
        $statement->execute([$userId, $commissionId, $type, $message]);
    }

    public function notifications(int $userId): array
    {
        $statement = $this->db->prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC');
        $statement->execute([$userId]);
        return $statement->fetchAll();
    }

    public function markNotificationsRead(int $userId, ?int $id = null): void
    {
        $sql = $id ? 'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?' : 'UPDATE notifications SET is_read = 1 WHERE user_id = ?';
        $statement = $this->db->prepare($sql);
        $statement->execute($id ? [$id, $userId] : [$userId]);
    }

    public function dashboard(int $userId): array
    {
        $statement = $this->db->prepare("SELECT
            SUM(status = 'Open') AS posted, SUM(status = 'In Progress') AS in_progress,
            SUM(status = 'Completed') AS completed,
            (SELECT COUNT(*) FROM applications a JOIN commissions ac ON ac.id = a.commission_id WHERE ac.user_id = ?) AS total_applications
            FROM commissions WHERE user_id = ?");
        $statement->execute([$userId, $userId]);
        $metrics = $statement->fetch() ?: [];
        $statement = $this->db->prepare('SELECT c.*, COUNT(a.id) AS application_count FROM commissions c LEFT JOIN applications a ON a.commission_id = c.id WHERE c.user_id = ? GROUP BY c.id ORDER BY c.created_at DESC');
        $statement->execute([$userId]);
        $commissions = $statement->fetchAll();

        $statement = $this->db->prepare(
            "SELECT DATE(a.created_at) AS application_date, COUNT(*) AS application_count
             FROM applications a
             JOIN commissions c ON c.id = a.commission_id
             WHERE c.user_id = ?
               AND DATE(a.created_at) BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND CURDATE()
             GROUP BY DATE(a.created_at)
             ORDER BY application_date"
        );
        $statement->execute([$userId]);
        $activityRows = $statement->fetchAll();
        $activityByDate = [];
        foreach ($activityRows as $row) {
            $activityByDate[$row['application_date']] = (int) $row['application_count'];
        }

        $activity = [];
        $start = new \DateTimeImmutable('today -6 days');
        for ($day = 0; $day < 7; $day++) {
            $date = $start->modify("+$day days");
            $dateKey = $date->format('Y-m-d');
            $activity[] = [
                'date' => $dateKey,
                'label' => $date->format('D'),
                'count' => $activityByDate[$dateKey] ?? 0,
            ];
        }

        return [
            'metrics' => $metrics,
            'commissions' => $commissions,
            'activity' => $activity,
            'activity_start' => $start->format('M j, Y'),
            'activity_end' => (new \DateTimeImmutable('today'))->format('M j, Y'),
        ];
    }

    public function profile(int $userId): array
    {
        $user = $this->user($userId);
        $query = function (string $table, string $order) use ($userId): array {
            $statement = $this->db->prepare("SELECT * FROM $table WHERE user_id = ? ORDER BY $order");
            $statement->execute([$userId]);
            return $statement->fetchAll();
        };
        return ['user' => $user, 'profile' => $this->single('profiles', $userId), 'education' => $query('education_entries', 'sort_order, id'), 'experience' => $query('experience_entries', 'sort_order, id'), 'skills' => $query('user_skills', 'category, skill_name')];
    }

    private function single(string $table, int $userId): ?array
    {
        $statement = $this->db->prepare("SELECT * FROM $table WHERE user_id = ?");
        $statement->execute([$userId]);
        return $statement->fetch() ?: null;
    }
}
