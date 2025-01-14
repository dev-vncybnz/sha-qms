<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

final class RoleEnum extends Enum
{
    const ADMIN = 'admin';
    const CASHIER = 'cashier';
    const REGISTRAR = 'registrar';
    const CASHIER_1 = 'cashier_1';
    const CASHIER_2 = 'cashier_2';
}
