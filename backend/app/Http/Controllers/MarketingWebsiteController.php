<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MarketingWebsiteController extends Controller
{
    public function index(Request $request)
    {
        return redirect()->route('index');
    }
}
