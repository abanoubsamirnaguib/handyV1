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

    // Public: Get general site settings (for frontend)
    public function getGeneralSettings()
    {
        // Only return editable settings (site name, logo, favicon are fixed in frontend)
        $settings = [
            'siteDescription' => SiteSetting::where('setting_key', 'site_description')->value('setting_value') ?? 'منصة تجمع الحرفيين والمبدعين في مكان واحد، لعرض منتجاتهم اليدوية الفريدة والتواصل مع العملاء مباشرة.',
            'maintenanceMode' => SiteSetting::where('setting_key', 'maintenance_mode')->value('setting_value') === 'true',
            'registrationsEnabled' => SiteSetting::where('setting_key', 'registrations_enabled')->value('setting_value') !== 'false',
            'contactPhone' => SiteSetting::where('setting_key', 'contact_phone')->value('setting_value') ?? '+2 01068644570',
            'contactEmail' => SiteSetting::where('setting_key', 'contact_email')->value('setting_value') ?? 'officialbazar64@gmail.com',
            'contactAddress' => SiteSetting::where('setting_key', 'contact_address')->value('setting_value') ?? 'شارع الحرفيين، الفيوم ، مصر',
            'workingHours' => SiteSetting::where('setting_key', 'working_hours')->value('setting_value') ?? 'السبت - الخميس: 9:00 صباحاً - 6:00 مساءً',
            'transactionNumber' => SiteSetting::where('setting_key', 'transaction_number')->value('setting_value') ?? '',
        ];

        return response()->json($settings);
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

        // General settings (only editable settings, fixed values are handled in frontend)
        $generalSettings = [
            'siteDescription' => SiteSetting::where('setting_key', 'site_description')->value('setting_value') ?? 'منصة تجمع الحرفيين والمبدعين في مكان واحد، لعرض منتجاتهم اليدوية الفريدة والتواصل مع العملاء مباشرة.',
            'maintenanceMode' => SiteSetting::where('setting_key', 'maintenance_mode')->value('setting_value') === 'true',
            'registrationsEnabled' => SiteSetting::where('setting_key', 'registrations_enabled')->value('setting_value') !== 'false',
            'contactPhone' => SiteSetting::where('setting_key', 'contact_phone')->value('setting_value') ?? '+20 1068644570',
            'contactEmail' => SiteSetting::where('setting_key', 'contact_email')->value('setting_value') ?? 'officialbazar64@gmail.com',
            'contactAddress' => SiteSetting::where('setting_key', 'contact_address')->value('setting_value') ?? 'شارع الحرفيين، الفيوم ، مصر',
            'workingHours' => SiteSetting::where('setting_key', 'working_hours')->value('setting_value') ?? 'السبت - الخميس: 9:00 صباحاً - 6:00 مساءً',
            'transactionNumber' => SiteSetting::where('setting_key', 'transaction_number')->value('setting_value') ?? '',
        ];

        // Email settings
        $emailSettings = [
            'senderName' => SiteSetting::where('setting_key', 'email_sender_name')->value('setting_value') ?? 'بازار',
            'senderEmail' => SiteSetting::where('setting_key', 'email_sender_email')->value('setting_value') ?? 'no-reply@example.com',
            'smtpServer' => SiteSetting::where('setting_key', 'smtp_server')->value('setting_value') ?? 'smtp.example.com',
            'smtpPort' => SiteSetting::where('setting_key', 'smtp_port')->value('setting_value') ?? '587',
            'smtpUsername' => SiteSetting::where('setting_key', 'smtp_username')->value('setting_value') ?? 'smtp-user',
            'smtpPassword' => SiteSetting::where('setting_key', 'smtp_password')->value('setting_value') ?? '',
            'useSMTP' => SiteSetting::where('setting_key', 'use_smtp')->value('setting_value') === 'true',
        ];

        // User Notification settings
        $userNotificationSettings = [
            'welcome' => SiteSetting::where('setting_key', 'user_notif_welcome')->value('setting_value') !== 'false',
            'orderCreated' => SiteSetting::where('setting_key', 'user_notif_order_created')->value('setting_value') !== 'false',
            'orderStatus' => SiteSetting::where('setting_key', 'user_notif_order_status')->value('setting_value') !== 'false',
            'productPending' => SiteSetting::where('setting_key', 'user_notif_product_pending')->value('setting_value') !== 'false',
            'productApproved' => SiteSetting::where('setting_key', 'user_notif_product_approved')->value('setting_value') !== 'false',
            'message' => SiteSetting::where('setting_key', 'user_notif_message')->value('setting_value') !== 'false',
            'review' => SiteSetting::where('setting_key', 'user_notif_review')->value('setting_value') !== 'false',
            'payment' => SiteSetting::where('setting_key', 'user_notif_payment')->value('setting_value') !== 'false',
            'system' => SiteSetting::where('setting_key', 'user_notif_system')->value('setting_value') !== 'false',
        ];

        // Admin Notification settings
        $adminNotificationSettings = [
            'newUser' => SiteSetting::where('setting_key', 'admin_notif_new_user')->value('setting_value') !== 'false',
            'newOrder' => SiteSetting::where('setting_key', 'admin_notif_new_order')->value('setting_value') !== 'false',
            'productPending' => SiteSetting::where('setting_key', 'admin_notif_product_pending')->value('setting_value') !== 'false',
            'productReport' => SiteSetting::where('setting_key', 'admin_notif_product_report')->value('setting_value') !== 'false',
            'chatReport' => SiteSetting::where('setting_key', 'admin_notif_chat_report')->value('setting_value') !== 'false',
            'withdrawalRequest' => SiteSetting::where('setting_key', 'admin_notif_withdrawal_request')->value('setting_value') !== 'false',
            'contactMessage' => SiteSetting::where('setting_key', 'admin_notif_contact_message')->value('setting_value') !== 'false',
            'adminEmail' => SiteSetting::where('setting_key', 'admin_notification_email')->value('setting_value') ?? 'admin@example.com',
            'deliveryMethod' => SiteSetting::where('setting_key', 'admin_notification_delivery')->value('setting_value') ?? 'both',
        ];

        return response()->json([
            'settings' => [
                'general' => $generalSettings,
                'email' => $emailSettings,
                'userNotifications' => $userNotificationSettings,
                'adminNotifications' => $adminNotificationSettings,
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
            'settingsType' => 'required|string|in:general,email,userNotifications,adminNotifications',
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
                    'siteDescription' => 'site_description',
                    'maintenanceMode' => 'maintenance_mode',
                    'registrationsEnabled' => 'registrations_enabled',
                    'contactPhone' => 'contact_phone',
                    'contactEmail' => 'contact_email',
                    'contactAddress' => 'contact_address',
                    'workingHours' => 'working_hours',
                    'transactionNumber' => 'transaction_number',
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
                'userNotifications' => [
                    'welcome' => 'user_notif_welcome',
                    'orderCreated' => 'user_notif_order_created',
                    'orderStatus' => 'user_notif_order_status',
                    'productPending' => 'user_notif_product_pending',
                    'productApproved' => 'user_notif_product_approved',
                    'message' => 'user_notif_message',
                    'review' => 'user_notif_review',
                    'payment' => 'user_notif_payment',
                    'system' => 'user_notif_system',
                ],
                'adminNotifications' => [
                    'newUser' => 'admin_notif_new_user',
                    'newOrder' => 'admin_notif_new_order',
                    'productPending' => 'admin_notif_product_pending',
                    'productReport' => 'admin_notif_product_report',
                    'chatReport' => 'admin_notif_chat_report',
                    'withdrawalRequest' => 'admin_notif_withdrawal_request',
                    'contactMessage' => 'admin_notif_contact_message',
                    'adminEmail' => 'admin_notification_email',
                    'deliveryMethod' => 'admin_notification_delivery',
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
                'userNotifications' => 'تم حفظ إعدادات إشعارات المستخدمين بنجاح',
                'adminNotifications' => 'تم حفظ إعدادات إشعارات المشرفين بنجاح',
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
