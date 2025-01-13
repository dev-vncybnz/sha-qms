<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

final class QueueStatusEnum extends Enum
{
    const PENDING = 0;
    const IN_PROGRESS = 1;
    const COMPLETED = 2;
}
