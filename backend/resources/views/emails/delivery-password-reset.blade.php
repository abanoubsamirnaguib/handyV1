<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>إعادة تعيين كلمة المرور - منصة بازار</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            direction: rtl;
            text-align: right;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            background-color: #e74c3c;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .credentials {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 10px;
            border-radius: 5px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>إعادة تعيين كلمة المرور</h1>
            <p>تم إعادة تعيين كلمة المرور الخاصة بك</p>
        </div>
        
        <div class="content">
            <p>عزيزي {{ $body['name'] }},</p>
            
            <p>تم إعادة تعيين كلمة المرور الخاصة بحساب الدليفري الخاص بك في منصة بازار.</p>
            
            <div class="credentials">
                <h3>كلمة المرور الجديدة:</h3>
                <p><strong>{{ $body['password'] }}</strong></p>
            </div>
            
            <div class="warning">
                <strong>تنبيه:</strong> لأغراض الأمان، يرجى تغيير كلمة المرور بعد تسجيل الدخول.
            </div>
            
            <a href="{{ $body['login_url'] }}" class="button">تسجيل الدخول الآن</a>
            
            <p>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى التواصل مع فريق الدعم فوراً.</p>
            
            <p>مع تحيات,<br>فريق منصة بازار</p>
        </div>
    </div>
</body>
</html>