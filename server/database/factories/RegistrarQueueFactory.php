<?php

namespace Database\Factories;

use App\Enums\QueueStatusEnum;
use App\Enums\RoleEnum;
use App\Models\Queue;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Queue>
 */
class RegistrarQueueFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $data = [];

        $queue = Queue::where('assigned_person', 'registrar')
            ->latest()
            ->first();

        return [
            'ticket_code' => "",
            'status' => QueueStatusEnum::COMPLETED,
            'assigned_person' => RoleEnum::REGISTRAR,
            'created_at' => now(),
        ];
    }
}
