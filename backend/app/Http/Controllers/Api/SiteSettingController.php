<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class SiteSettingController extends Controller
{
    public function index()
    {
        return SiteSetting::all();
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'settings' => 'required|array',
        ]);
        foreach ($data['settings'] as $key => $value) {
            SiteSetting::updateOrCreate(
                ['setting_key' => $key],
                ['setting_value' => $value, 'updated_at' => now()]
            );
        }
        return response()->json(['message' => 'Settings updated']);
    }

    // Admin: Get all admin settings
    public function getAdminSettings()
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        // General settings
        $generalSettings = [
            'siteName' => SiteSetting::where('setting_key', 'site_name')->value('setting_value') ?? 'منصة الصنايعي',
            'siteDescription' => SiteSetting::where('setting_key', 'site_description')->value('setting_value') ?? 'منصة تسويق المنتجات الحرفية اليدوية',
            'logoUrl' => SiteSetting::where('setting_key', 'logo_url')->value('setting_value') ?? '/logo.png',
            'faviconUrl' => SiteSetting::where('setting_key', 'favicon_url')->value('setting_value') ?? '/favicon.ico',
            'maintenanceMode' => SiteSetting::where('setting_key', 'maintenance_mode')->value('setting_value') === 'true',
            'registrationsEnabled' => SiteSetting::where('setting_key', 'registrations_enabled')->value('setting_value') !== 'false',
            'defaultLanguage' => SiteSetting::where('setting_key', 'default_language')->value('setting_value') ?? 'ar',
            'defaultCurrency' => SiteSetting::where('setting_key', 'default_currency')->value('setting_value') ?? 'EGP',
        ];

        // Email settings
        $emailSettings = [
            'senderName' => SiteSetting::where('setting_key', 'email_sender_name')->value('setting_value') ?? 'منصة الصنايعي',
            'senderEmail' => SiteSetting::where('setting_key', 'email_sender_email')->value('setting_value') ?? 'no-reply@example.com',
            'smtpServer' => SiteSetting::where('setting_key', 'smtp_server')->value('setting_value') ?? 'smtp.example.com',
            'smtpPort' => SiteSetting::where('setting_key', 'smtp_port')->value('setting_value') ?? '587',
            'smtpUsername' => SiteSetting::where('setting_key', 'smtp_username')->value('setting_value') ?? 'smtp-user',
            'smtpPassword' => SiteSetting::where('setting_key', 'smtp_password')->value('setting_value') ?? '',
            'useSMTP' => SiteSetting::where('setting_key', 'use_smtp')->value('setting_value') === 'true',
        ];

        // Notification settings
        $notificationSettings = [
            'newUserNotifications' => SiteSetting::where('setting_key', 'notify_new_users')->value('setting_value') !== 'false',
            'newOrderNotifications' => SiteSetting::where('setting_key', 'notify_new_orders')->value('setting_value') !== 'false',
            'productReportNotifications' => SiteSetting::where('setting_key', 'notify_product_reports')->value('setting_value') !== 'false',
            'chatReportNotifications' => SiteSetting::where('setting_key', 'notify_chat_reports')->value('setting_value') !== 'false',
            'lowStockNotifications' => SiteSetting::where('setting_key', 'notify_low_stock')->value('setting_value') !== 'false',
            'adminEmails' => SiteSetting::where('setting_key', 'admin_emails')->value('setting_value') ?? 'admin@example.com',
        ];

        // Security settings
        $securitySettings = [
            'requireEmailVerification' => SiteSetting::where('setting_key', 'require_email_verification')->value('setting_value') !== 'false',
            'twoFactorAuthEnabled' => SiteSetting::where('setting_key', 'two_factor_auth_enabled')->value('setting_value') === 'true',
            'passwordMinLength' => SiteSetting::where('setting_key', 'password_min_length')->value('setting_value') ?? '8',
            'passwordRequiresUppercase' => SiteSetting::where('setting_key', 'password_requires_uppercase')->value('setting_value') !== 'false',
            'passwordRequiresNumber' => SiteSetting::where('setting_key', 'password_requires_number')->value('setting_value') !== 'false',
            'passwordRequiresSymbol' => SiteSetting::where('setting_key', 'password_requires_symbol')->value('setting_value') === 'true',
            'sessionTimeout' => SiteSetting::where('setting_key', 'session_timeout')->value('setting_value') ?? '120',
        ];

        return response()->json([
            'settings' => [
                'general' => $generalSettings,
                'email' => $emailSettings,
                'notifications' => $notificationSettings,
                'security' => $securitySettings,
            ]
        ]);
    }

    // Admin: Update admin settings
    public function updateAdminSettings(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $validator = Validator::make($request->all(), [
            'settingsType' => 'required|string|in:general,email,notifications,security',
            'settings' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $settingsType = $request->settingsType;
            $settings = $request->settings;

            // Map frontend setting names to backend setting keys based on type
            $settingMappings = [
                'general' => [
                    'siteName' => 'site_name',
                    'siteDescription' => 'site_description',
                    'logoUrl' => 'logo_url',
                    'faviconUrl' => 'favicon_url',
                    'maintenanceMode' => 'maintenance_mode',
                    'registrationsEnabled' => 'registrations_enabled',
                    'defaultLanguage' => 'default_language',
                    'defaultCurrency' => 'default_currency',
                ],
                'email' => [
                    'senderName' => 'email_sender_name',
                    'senderEmail' => 'email_sender_email',
                    'smtpServer' => 'smtp_server',
                    'smtpPort' => 'smtp_port',
                    'smtpUsername' => 'smtp_username',
                    'smtpPassword' => 'smtp_password',
                    'useSMTP' => 'use_smtp',
                ],
                'notifications' => [
                    'newUserNotifications' => 'notify_new_users',
                    'newOrderNotifications' => 'notify_new_orders',
                    'productReportNotifications' => 'notify_product_reports',
                    'chatReportNotifications' => 'notify_chat_reports',
                    'lowStockNotifications' => 'notify_low_stock',
                    'adminEmails' => 'admin_emails',
                ],
                'security' => [
                    'requireEmailVerification' => 'require_email_verification',
                    'twoFactorAuthEnabled' => 'two_factor_auth_enabled',
                    'passwordMinLength' => 'password_min_length',
                    'passwordRequiresUppercase' => 'password_requires_uppercase',
                    'passwordRequiresNumber' => 'password_requires_number',
                    'passwordRequiresSymbol' => 'password_requires_symbol',
                    'sessionTimeout' => 'session_timeout',
                ],
            ];

            if (!isset($settingMappings[$settingsType])) {
                return response()->json(['error' => 'نوع الإعدادات غير صحيح'], 422);
            }

            $mappings = $settingMappings[$settingsType];

            // Update settings in database
            foreach ($settings as $frontendKey => $value) {
                if (isset($mappings[$frontendKey])) {
                    $backendKey = $mappings[$frontendKey];
                    
                    // Convert boolean values to string for storage
                    if (is_bool($value)) {
                        $value = $value ? 'true' : 'false';
                    }
                    
                    SiteSetting::updateOrCreate(
                        ['setting_key' => $backendKey],
                        ['setting_value' => $value, 'updated_at' => now()]
                    );
                }
            }

            $messages = [
                'general' => 'تم حفظ الإعدادات العامة بنجاح',
                'email' => 'تم حفظ إعدادات البريد الإلكتروني بنجاح',
                'notifications' => 'تم حفظ إعدادات الإشعارات بنجاح',
                'security' => 'تم حفظ إعدادات الأمان بنجاح',
            ];

            return response()->json([
                'message' => $messages[$settingsType],
                'settings' => $settings
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'حدث خطأ في حفظ الإعدادات'], 500);
        }
    }
}
