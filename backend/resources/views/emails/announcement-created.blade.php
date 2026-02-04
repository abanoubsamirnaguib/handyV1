@php
    $announcement = $body['announcement'];
    $appName = $body['appName'];
@endphp
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إعلان جديد</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
            direction: rtl;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #e85856 0%, #c84543 100%);
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px 20px;
        }
        .announcement-type {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .type-info {
            background-color: #e3f2fd;
            color: #1976d2;
        }
        .type-warning {
            background-color: #fff3e0;
            color: #f57c00;
        }
        .type-success {
            background-color: #e8f5e9;
            color: #388e3c;
        }
        .type-error {
            background-color: #ffebee;
            color: #d32f2f;
        }
        .announcement-title {
            font-size: 20px;
            font-weight: bold;
            color: #333333;
            margin-bottom: 15px;
        }
        .announcement-content {
            font-size: 16px;
            line-height: 1.6;
            color: #555555;
            margin-bottom: 20px;
            white-space: pre-wrap;
        }
        .announcement-image {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 20px 0;
        }
        .announcement-meta {
            font-size: 14px;
            color: #888888;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eeeeee;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #e85856;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin-top: 20px;
        }
        .button:hover {
            background-color: #c84543;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #888888;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 إعلان جديد من {{ $appName }}</h1>
        </div>
        
        <div class="content">
            <div class="announcement-type type-{{ $announcement->type }}">
                @switch($announcement->type)
                    @case('info')
                        ℹ️ معلومات
                        @break
                    @case('warning')
                        ⚠️ تحذير
                        @break
                    @case('success')
                        ✅ إنجاز
                        @break
                    @case('error')
                        ❌ خطأ
                        @break
                @endswitch
            </div>
            
            <div class="announcement-title">
                {{ $announcement->title }}
            </div>
            
            <div class="announcement-content">
                {{ $announcement->content }}
            </div>
            
            @if($announcement->image)
                <img src="{{ config('app.url') }}/storage/{{ $announcement->image }}" alt="{{ $announcement->title }}" class="announcement-image">
            @endif
            
            <a href="{{ config('app.url') }}/announcements" class="button">
                عرض جميع الإعلانات
            </a>
            
            <div class="announcement-meta">
                <p><strong>الأولوية:</strong> 
                    @switch($announcement->priority)
                        @case('high')
                            عالية 🔴
                            @break
                        @case('medium')
                            متوسطة 🟡
                            @break
                        @case('low')
                            منخفضة 🟢
                            @break
                    @endswitch
                </p>
                
                @if($announcement->starts_at)
                    <p><strong>تاريخ البداية:</strong> {{ \Carbon\Carbon::parse($announcement->starts_at)->format('Y/m/d') }}</p>
                @endif
                
                @if($announcement->ends_at)
                    <p><strong>تاريخ النهاية:</strong> {{ \Carbon\Carbon::parse($announcement->ends_at)->format('Y/m/d') }}</p>
                @endif
            </div>
        </div>
        
        <div class="footer">
            <p>هذا البريد الإلكتروني تم إرساله من منصة {{ $appName }}</p>
            <p>إذا كنت تريد إلغاء الاشتراك في هذه الإشعارات، يرجى زيارة إعدادات حسابك</p>
        </div>
    </div>
</body>
</html>
