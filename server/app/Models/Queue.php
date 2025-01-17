<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Queue extends Model
{
    use HasFactory;

    protected $perPage = 10;

    protected $fillable = [
        'ticket_code',
        'status',
        'assigned_person',
        'created_at'
    ];

}
