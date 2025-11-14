<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إشعار إداري</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            direction: rtl;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .message {
            font-size: 16px;
            color: #333;
            line-height: 1.8;
            margin-bottom: 25px;
            background-color: #f8f9fa;
            padding: 20px;
            border-right: 4px solid #667eea;
            border-radius: 4px;
        }
        .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            text-align: center;
            margin-top: 20px;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #e9ecef;
        }
        .admin-badge {
            display: inline-block;
            background-color: #dc3545;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 إشعار إداري</h1>
        </div>
        
        <div class="content">
            <div class="admin-badge">⚡ إشعار فوري للمشرف</div>
            
            <div class="message">
                {{ $body['message'] }}
            </div>
            
            @if(isset($body['link']) && $body['link'])
            <div style="text-align: center;">
                <a href="{{ $body['link'] }}" class="button">
                    عرض التفاصيل
                </a>
            </div>
            @endif
        </div>
        
        <div class="footer">
            <p>هذا إشعار تلقائي من لوحة إدارة منصة بازار</p>
            <p style="margin-top: 10px; font-size: 12px;">
                © {{ date('Y') }} منصة بازار - جميع الحقوق محفوظة
            </p>
        </div>
    </div>
</body>
</html>

