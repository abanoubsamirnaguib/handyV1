<?php
namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;

class FileUploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // max 10MB
        ]);
        $file = $request->file('file');
        $path = $file->store('uploads', 'public');
        $url = Storage::disk('public')->url($path);
        return response()->json(['url' => $url, 'path' => $path]);
    }
}
