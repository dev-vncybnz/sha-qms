<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VideoController extends Controller
{
    public function index(Request $request)
    {
        $video = Video::latest()->first();

        return response()->json($video, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'video' => 'required|mimes:mp4,avi'
        ]);

        $file = $request->file('video');
        $filename = time() . '.' . $file->getClientOriginalExtension();
        $file->storeAs('public/videos', $filename);

        $data = Video::create([
            'filename' => $filename,
            'added_by' => Auth::user()->id
        ]);

        return response($data, 201);
    }
}
