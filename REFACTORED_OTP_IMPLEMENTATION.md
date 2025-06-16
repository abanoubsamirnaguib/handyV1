# Refactored OTP Implementation Using api.js and AuthContext

This document outlines the refactored password reset and email verification system that now follows the established patterns using `api.js` as the main interface and `AuthContext` for consistent authentication handling.

## 🔄 **Refactoring Overview**

The OTP functionality has been completely rewritten to:
- ✅ Use `api.js` as the main interface for all API calls
- ✅ Follow the same patterns as existing `login` and `register` functions
- ✅ Utilize `AuthContext` for consistent state management and error handling
- ✅ Remove direct `axiosInstance` usage from components
- ✅ Provide centralized toast notifications and error handling

## 📁 **Files Modified**

### 1. **src/lib/api.js**
Added OTP-related API functions to the main `api` object:

```javascript
// Authentication with OTP
sendEmailVerificationOTP: (email) => 
  apiFetch('send-email-verification-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

verifyEmail: (email, otpCode) => 
  apiFetch('verify-email', {
    method: 'POST',
    body: JSON.stringify({ email, otp_code: otpCode }),
  }),

registerWithVerification: (userData) => 
  apiFetch('register-with-verification', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

sendPasswordResetOTP: (email) => 
  apiFetch('send-password-reset-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

verifyPasswordResetOTP: (email, otpCode) => 
  apiFetch('verify-password-reset-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp_code: otpCode }),
  }),

resetPassword: (email, otpCode, password, passwordConfirmation) => 
  apiFetch('reset-password', {
    method: 'POST',
    body: JSON.stringify({ 
      email, 
      otp_code: otpCode, 
      password, 
      password_confirmation: passwordConfirmation 
    }),
  }),
```

### 2. **src/contexts/AuthContext.jsx**
Added OTP-related methods that follow the same pattern as existing auth functions:

```javascript
// OTP functions
sendEmailVerificationOTP,
verifyEmail,
registerWithEmailVerification,
sendPasswordResetOTP,
verifyPasswordResetOTP,
resetPassword,
```

Each function includes:
- Proper error handling with user-friendly Arabic messages
- Consistent toast notifications
- Return boolean values for success/failure
- Same pattern as existing `login` and `register` functions

### 3. **Frontend Pages Refactored**

#### **src/pages/ForgotPasswordPage.jsx**
- ❌ Removed: Direct `axiosInstance` usage
- ❌ Removed: Manual toast handling
- ✅ Added: `useAuth()` hook
- ✅ Added: `sendPasswordResetOTP()` method usage
- ✅ Added: Consistent error handling pattern

#### **src/pages/ResetPasswordPage.jsx**
- ❌ Removed: Direct `axiosInstance` usage
- ❌ Removed: Manual toast handling and validation
- ✅ Added: `useAuth()` hook
- ✅ Added: `verifyPasswordResetOTP()` and `resetPassword()` methods
- ✅ Added: Consistent pattern matching other auth pages

#### **src/pages/EmailVerificationPage.jsx**
- ❌ Removed: Direct `axiosInstance` usage
- ❌ Removed: Manual toast handling
- ✅ Added: `useAuth()` hook
- ✅ Added: `registerWithEmailVerification()` and `sendEmailVerificationOTP()` methods
- ✅ Added: Simplified logic following AuthContext patterns

#### **src/pages/RegisterPage.jsx**
- ❌ Removed: Direct `axiosInstance` usage
- ✅ Added: `sendEmailVerificationOTP()` from AuthContext
- ✅ Updated: Registration flow to use AuthContext methods

## 🎯 **Key Improvements**

### **1. Consistent API Interface**
- All API calls now go through the centralized `api.js`
- Consistent error handling across all OTP operations
- Reusable API functions that can be used anywhere in the app

### **2. AuthContext Integration**
- OTP functions follow the same pattern as `login` and `register`
- Centralized state management
- Consistent toast notifications with Arabic messages
- Boolean return values for easy success/failure handling

### **3. Component Simplification**
- Components are now much cleaner and focused on UI logic
- No more manual error handling in components
- Consistent patterns across all authentication-related pages
- Reduced code duplication

### **4. Error Handling**
- Centralized error message mapping in AuthContext
- User-friendly Arabic error messages
- Consistent toast notification patterns
- Proper error categorization (network, validation, business logic)

## 🔄 **Usage Patterns**

### **Before (Old Pattern)**
```javascript
// Old way - direct axiosInstance usage
const response = await axiosInstance.post('/send-password-reset-otp', {
  email
});

toast({
  title: "تم الإرسال بنجاح",
  description: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
});
```

### **After (New Pattern)**
```javascript
// New way - using AuthContext
const { sendPasswordResetOTP } = useAuth();

const success = await sendPasswordResetOTP(email);
if (success) {
  // Handle success (toast is automatically shown)
  navigate('/reset-password', { state: { email } });
}
```

## 🎨 **Component Structure**

### **Consistent Hook Usage**
```javascript
const { 
  sendEmailVerificationOTP,
  verifyEmail,
  registerWithEmailVerification,
  sendPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPassword 
} = useAuth();
```

### **Consistent Async Handling**
```javascript
const handleAction = async () => {
  setIsLoading(true);
  const success = await authMethod(data);
  
  if (success) {
    // Handle success scenario
    navigate('/next-page');
  }
  
  setIsLoading(false);
};
```

## 🔒 **Security & Best Practices**

1. **Centralized Validation**: All validation happens in AuthContext
2. **Consistent Error Messages**: Prevents information leakage
3. **Token Management**: Automatic token handling through api.js
4. **State Synchronization**: User state updates handled consistently
5. **Memory Management**: Proper cleanup and state management

## 📱 **User Experience**

- **Consistent Feedback**: All operations provide consistent toast notifications
- **Loading States**: Proper loading indicators during async operations
- **Error Recovery**: Clear error messages with actionable guidance
- **Navigation Flow**: Smooth navigation between OTP-related pages

## 🧪 **Testing Benefits**

- **Mockable API Layer**: Easy to mock `api.js` functions for testing
- **Testable Auth Functions**: AuthContext methods can be tested in isolation
- **Component Testing**: Components are now focused on UI logic only
- **Integration Testing**: Consistent patterns make integration testing easier

## 🚀 **Migration Complete**

The OTP system now fully follows the established architecture patterns:

- ✅ **API Layer**: Centralized in `api.js`
- ✅ **Business Logic**: Handled in `AuthContext`
- ✅ **UI Components**: Focused on presentation and user interaction
- ✅ **Error Handling**: Consistent and user-friendly
- ✅ **State Management**: Centralized and predictable
- ✅ **Code Reusability**: Functions can be reused across components

This refactoring ensures the OTP functionality integrates seamlessly with the existing codebase while maintaining consistency, reliability, and maintainability. 