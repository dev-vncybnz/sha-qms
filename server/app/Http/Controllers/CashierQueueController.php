<?php

namespace App\Http\Controllers;

use App\Enums\QueueStatusEnum;
use App\Enums\RoleEnum;
use App\Http\Resources\CashierQueueResource;
use App\Models\Queue;
use Illuminate\Http\Request;

class CashierQueueController extends Controller
{
    public function index(Request $request)
    {
        $query = Queue::whereIn('assigned_person', [RoleEnum::CASHIER_1, RoleEnum::CASHIER_2]);
        $data = $query->paginate();

        return CashierQueueResource::collection($data);
    }

    public function store(Request $request)
    {
        $validated = $request->post();
        $data = Queue::create($validated);

        return response()->json($data, 201);
    }

    public function update(Request $request)
    {
        $person = $request->post('person');

        // Set the status of person's in progress queue data to Completed
        $queue = Queue::where('assigned_person', $person)
            ->where('status', QueueStatusEnum::IN_PROGRESS)
            ->orderBy('created_at', 'asc')
            ->first();

        if ($queue) {
            $queue->status = QueueStatusEnum::COMPLETED;
            $queue->save();
        }

        // Get new queue data and assign to the person
        $newQueueData = Queue::whereIn('assigned_person', [RoleEnum::CASHIER_1, RoleEnum::CASHIER_2])
            ->where('status', QueueStatusEnum::PENDING)
            ->orderBy('created_at', 'asc')
            ->first();

        if ($newQueueData) {
            $newQueueData->assigned_person = $person;
            $newQueueData->status = QueueStatusEnum::IN_PROGRESS;
            $newQueueData->save();

            return response()->json(true, 200);
        }

        return response()->json("Queue is empty", 200);
    }
}
