<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;'>
    <div style='background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
        <h2 style='color: #333; text-align: center; margin-bottom: 20px;'>إشعار جديد</h2>
        
        <p style='color: #666; font-size: 16px; line-height: 1.6;'>مرحباً {{ $body['user_name'] }}،</p>
        
        <div style='background-color: #f8f9fa; border-right: 4px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 5px;'>
            <p style='color: #333; font-size: 16px; margin: 0; line-height: 1.6;'>{{ $body['message'] }}</p>
        </div>
        
        @if(isset($body['link']) && $body['link'])
        <div style='text-align: center; margin: 30px 0;'>
            <a href='{{ $body['link'] }}' style='display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;'>
                عرض التفاصيل
            </a>
        </div>
        @endif
        
        <p style='color: #999; font-size: 14px; text-align: center; margin-top: 30px;'>
            هذا إشعار تلقائي من منصة بازار
        </p>
    </div>
</div>

