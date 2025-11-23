<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;'>
    <div style='background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
        <h2 style='color: #333; text-align: center; margin-bottom: 20px;'>رد على رسالتك</h2>
        
        <p style='color: #666; font-size: 16px; line-height: 1.6;'>مرحباً {{ $body['name'] }}،</p>
        
        <p style='color: #666; font-size: 16px; line-height: 1.6;'>
            شكراً لتواصلك معنا. نود إعلامك بأننا قد راجعنا رسالتك وتم الرد عليها.
        </p>
        
        <div style='background-color: #f8f9fa; border-right: 4px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 5px;'>
            <h3 style='color: #333; font-size: 18px; margin-top: 0; margin-bottom: 15px;'>رسالتك الأصلية:</h3>
            <p style='color: #666; font-size: 14px; margin: 5px 0;'><strong>الموضوع:</strong> {{ $body['subject'] ?? 'بدون موضوع' }}</p>
            <p style='color: #666; font-size: 14px; margin: 5px 0; line-height: 1.6;'>{{ $body['original_message'] }}</p>
        </div>
        
        <div style='background-color: #e8f5e9; border-right: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 5px;'>
            <h3 style='color: #2e7d32; font-size: 18px; margin-top: 0; margin-bottom: 15px;'>ردنا:</h3>
            <p style='color: #333; font-size: 16px; margin: 0; line-height: 1.6; white-space: pre-wrap;'>{{ $body['admin_reply'] }}</p>
        </div>
        
        <p style='color: #666; font-size: 15px; line-height: 1.6; margin-top: 25px;'>
            إذا كان لديك أي استفسارات إضافية، لا تتردد في التواصل معنا مرة أخرى.
        </p>
        
        <p style='color: #999; font-size: 14px; text-align: center; margin-top: 30px;'>
            مع أطيب التحيات،<br>
            فريق منصة بازار
        </p>
    </div>
</div>

