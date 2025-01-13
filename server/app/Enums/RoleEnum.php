<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

final class RoleEnum extends Enum
{
    const CASHIER = 0;
    const REGISTRAR = 1;
    const ADMIN = 2;
}
