<?php

namespace App\Http\Controllers;

use App\Enums\QueueStatusEnum;
use App\Enums\RoleEnum;
use App\Http\Resources\QueueResource;
use App\Models\Queue;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class QueueController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'page' => [
                'required',
                'integer',
                'min:1'
            ],
            'status' => [
                'nullable',
                'integer',
                'min:1',
                'max:2',
            ],
            'person' => [
                'required',
                'string',
                Rule::in([RoleEnum::CASHIER, RoleEnum::REGISTRAR])
            ]
        ]);

        $status = isset($request->status) ? $validated['status'] : null;
        $person = $validated['person'];

        $ticketCodeLike = $person === RoleEnum::REGISTRAR ? "REG" : "CAS";
        $query = Queue::where('ticket_code', 'like', "%$ticketCodeLike%")
            ->orderBy('created_at', 'asc')
            ->whereDate('created_at', now());

        if ($status == QueueStatusEnum::COMPLETED) {
            $query->where('status', QueueStatusEnum::COMPLETED);
        } else {
            $query->whereNot('status', QueueStatusEnum::COMPLETED);
        }

        $data = $query->paginate();

        return QueueResource::collection($data);
    }

    public function latestInProgressTicketCodes(Request $request)
    {
        $onlyTicketCodes = $request->only_ticket_codes;

        // Cashier 1
        $cashier1LatestInProgressData = Queue::where('assigned_person', RoleEnum::CASHIER_1)
            ->where('status', QueueStatusEnum::IN_PROGRESS)
            ->orderBy('created_at', 'asc')
            ->first();

        // Cashier 2
        $cashier2LatestInProgressData = Queue::where('assigned_person', RoleEnum::CASHIER_2)
            ->where('status', QueueStatusEnum::IN_PROGRESS)
            ->orderBy('created_at', 'asc')
            ->first();

        // Registrar
        $registrarLatestInProgressData = Queue::where('assigned_person', RoleEnum::REGISTRAR)
            ->where('status', QueueStatusEnum::IN_PROGRESS)
            ->orderBy('created_at', 'asc')
            ->first();

        $data = null;

        if ($onlyTicketCodes) {
            $data = [
                'cashier_1' => $cashier1LatestInProgressData?->ticket_code,
                'cashier_2' => $cashier2LatestInProgressData?->ticket_code,
                'registrar' => $registrarLatestInProgressData?->ticket_code,
            ];
        } else {
            $data = [
                'cashier_1' => $cashier1LatestInProgressData,
                'cashier_2' => $cashier2LatestInProgressData,
                'registrar' => $registrarLatestInProgressData,
            ];
        }

        return response()->json($data, 200);
    }

    public function createQueueTicket(Request $request)
    {
        $data = $request->validate([
            'person' => [
                'required',
                'string',
                Rule::in([RoleEnum::CASHIER, RoleEnum::REGISTRAR])
            ],
        ]);

        $person = $data['person'];

        // Get latest ticket by specific role
        $personLike = $person == 'cashier' ? 'CAS' : 'REG';
        $latestTicketData = Queue::where('ticket_code', 'like', "%$personLike%")
            ->whereDate('created_at', now())
            ->lockForUpdate()
            ->latest()
            ->first();

        $latestTicketNumber = 1;

        if ($latestTicketData) {
            $latestTicketNumber = $latestTicketData->ticket_code;
            $latestTicketNumber = explode('-', $latestTicketNumber)[1];
            $latestTicketNumber = intval($latestTicketNumber);
            $latestTicketNumber++;
        }

        // Create Ticket Code Prefix
        $code = str_contains($person, "cas") ? "CAS-" : "REG-";

        // Add 000 to the left of queue number that is less than 3 digits
        $code = $code . str_pad(strval($latestTicketNumber), 4, '0', STR_PAD_LEFT);
        $assigned_person = str_contains($person, "reg") ? "registrar" : null;

        $data = [
            'ticket_code' => $code,
            'status' => QueueStatusEnum::PENDING,
            'assigned_person' => $assigned_person
        ];

        // Prevent duplication due to consecutive quick requests
        $checkTicketExists = Queue::where('ticket_code', $code)
            ->whereDate('created_at', now())
            ->first();

        if ($checkTicketExists) {
            $checkTicketExists->created_at = now();
            $checkTicketExists->save();
            return response()->json($checkTicketExists, 201);
        }

        $queue = Queue::create($data);

        return response()->json($queue, 201);
    }

    public function skipQueue(Queue $queue)
    {
        $code = $queue->ticket_code;

        $queue->created_at = now();
        $queue->status = QueueStatusEnum::PENDING;

        if (str_contains($code, "CAS")) {
            $queue->assigned_person = null;
        }

        $queue->save();

        return response()->json(true, 200);
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
        $personLike = $person == 'cashier' ? 'CAS' : 'REG';
        $newQueueData = Queue::where('ticket_code', 'like', "%$personLike%")
            ->where('status', QueueStatusEnum::PENDING)
            ->whereDate('created_at', now())
            ->orderBy('created_at', 'asc')
            ->first();

        if ($newQueueData) {
            $newQueueData->assigned_person = $person;
            $newQueueData->status = QueueStatusEnum::IN_PROGRESS;
            $newQueueData->save();

            return response()->json($newQueueData, 200);
        }

        return response()->json("Queue is empty", 200);
    }
}
