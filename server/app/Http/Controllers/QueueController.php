<?php

namespace App\Http\Controllers;

use App\Enums\QueueStatusEnum;
use App\Enums\RoleEnum;
use App\Http\Resources\QueueResource;
use App\Models\Queue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
            'per_page' => [
                'required',
                'integer',
                'min:1'
            ]
        ]);

        $page = $validated['page'];
        $perPage = $validated['per_page'];

        $query = Queue::join('users', 'users.id', 'queues.assigned_person')
            ->select(
                'queues.id as queue_id',
                'queues.code',
                'queues.assigned_person',
                'queues.status',
                'queues.created_at',
                'queues.updated_at',
                'users.photo',
                'users.first_name',
                'users.last_name',
                'users.gender',
                'users.address',
                'users.email',
                'users.phone',
                'users.role',
                'users.email_verified_at',
                'users.password',
                'users.remember_token'
            )
            ->where('queues.assigned_person', Auth::user()->id)
            ->whereDate('queues.created_at', now());

        if (isset($request->role)) {
            $query->where('users.role', RoleEnum::fromValue(intval($request->role))->value);
        }

        if (isset($request->status) && $request->status == 0) {
            $query->whereNot('queues.status', QueueStatusEnum::COMPLETED);
        }

        if (isset($request->status) && $request->status == 2) {
            $query->where('queues.status', QueueStatusEnum::COMPLETED);
        }

        if (isset($request->order_by) && $request->order_by) {
            $query->orderBy('queues.created_at', $request->order_by);
        }

        $data = $query->paginate($perPage);

        return QueueResource::collection($data);
    }

    public function getLatestQueueCodes()
    {
        $cashierWIPData = Queue::join('users', 'users.id', 'queues.assigned_person')
            ->where('users.role', RoleEnum::CASHIER)
            ->where('queues.status', QueueStatusEnum::IN_PROGRESS)
            ->whereDate('queues.created_at', now())
            ->orderBy('queues.updated_at', 'desc')
            ->first();

        $registrarWIPData = Queue::join('users', 'users.id', 'queues.assigned_person')
            ->where('users.role', RoleEnum::REGISTRAR)
            ->where('queues.status', QueueStatusEnum::IN_PROGRESS)
            ->whereDate('queues.created_at', now())
            ->orderBy('queues.updated_at', 'desc')
            ->first();

        $data = [
            'cashierWIPCode' => $cashierWIPData?->code,
            'registrarWIPCode' => $registrarWIPData?->code,
        ];

        return response()->json($data, 200);
    }

    public function store(Request $request)
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
        $code = "CAS-";

        if ($person == "registrar") {
            $code = "REG-";
        }

        // Add 000 to the left of queue number that is less than 3 digits
        $code = $code . str_pad(strval($latestTicketNumber), 4, '0', STR_PAD_LEFT);

        $data = [
            'ticket_code' => $code,
            'status' => QueueStatusEnum::PENDING,
            'assigned_person' => $request->assigned_person
        ];

        $queue = Queue::create($data);

        return response()->json($queue, 201);
    }

    public function update(Request $request, Queue $queue)
    {
        DB::beginTransaction();

        try {
            $inProgressQueues = Queue::where('assigned_person', Auth::user()->id)
                ->whereNot('id', $queue->id)
                ->where('status', QueueStatusEnum::IN_PROGRESS)
                ->whereDate('created_at', now())
                ->get();

            foreach ($inProgressQueues as $item) {
                $item->status = QueueStatusEnum::PENDING;
                $item->save();
            }

            $status = $request->post('status');

            $queue->status = intval($status);
            $queue->save();

            DB::commit();

            return response()->json(true, 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Something went wrong, please try again.'], 500);
        }
    }
}
