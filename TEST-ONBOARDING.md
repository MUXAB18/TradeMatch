# 🧪 Testing the Onboarding Flow

## Quick Test Guide

Follow these steps to test the complete onboarding flow.

---

## 1. Start the App

```bash
npm start
```

**Choose your platform:**
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on your phone

---

## 2. Test Phone Entry Screen

### What You Should See:
- "Welcome to TradeMatch" title
- Phone number input field
- "Send Code" button
- Helper text about country code

### Test Actions:
1. **Try entering letters** → Should only accept numbers
2. **Enter short number** (e.g., "123") → Button stays disabled
3. **Enter valid phone** (e.g., "+971501234567") → Button becomes enabled
4. **Click "Send Code"** → Navigates to OTP screen

### Expected Behavior:
✅ Only digits allowed  
✅ Button disabled until 10+ digits  
✅ Format preserves + prefix  
✅ Navigates to OTP screen  

---

## 3. Test OTP Entry Screen

### What You Should See:
- "Enter Verification Code" title
- Shows your phone number
- 6 input boxes for OTP
- "Didn't receive code? Resend" link

### Test Actions:

**Test 1: Type Digits Normally**
1. Type `1` → Auto-focuses next box
2. Type `2` → Auto-focuses next box
3. Continue typing `3`, `4`, `5`, `6`
4. On 6th digit → Auto-submits (no button needed)
5. Should navigate to Trade selection

**Test 2: Paste Code**
1. Clear any digits
2. Paste "123456" in first box
3. All boxes should fill
4. Should auto-submit and navigate

**Test 3: Backspace Navigation**
1. Type several digits
2. Press backspace in empty box
3. Should focus previous box

**Test 4: Resend Code**
1. Click "Didn't receive code? Resend"
2. Should show alert "Code Sent"

### Expected Behavior:
✅ Auto-advance between inputs  
✅ Auto-submit on 6th digit  
✅ Paste support works  
✅ Backspace navigates back  
✅ Any 6-digit code is accepted (MVP)  

---

## 4. Test Trade Selection Screen

### What You Should See:
- "Select Your Trade" title
- 4 trade cards:
  - ⚡ Electrician
  - 🔧 Plumber
  - ❄️ HVAC Technician
  - 🪚 Carpenter
- "Continue" button (disabled)

### Test Actions:
1. **Don't select anything** → Continue button is grayed out
2. **Tap "Electrician" card** → Card highlights, radio selected
3. **Tap "Plumber" card** → Previous deselects, new one selects
4. **Tap "Electrician" again** → Stays selected (can't deselect)
5. **Click "Continue"** → Navigates to Location screen

### Expected Behavior:
✅ Only one trade selectable at a time  
✅ Selected card shows blue border  
✅ Radio button filled when selected  
✅ Continue button enabled after selection  
✅ Navigates to location screen  

---

## 5. Test Location/Country Screen

### What You Should See:
- "Select Your Country" title
- Spinner with "Detecting your location..." (first time)
- 6 Gulf country cards with flags
- "Complete Setup" button (disabled)

### Test Actions:

**First Time (Location Permission):**
1. See location permission dialog
2. **Allow location** → App detects country
3. See "✓ We detected you're in [Country]"
4. That country is pre-selected

**Select Country:**
1. **Tap UAE card** → Card highlights
2. **Tap Saudi Arabia** → Previous deselects
3. **Keep UAE selected**
4. **Click "Complete Setup"**

### Expected Behavior:
✅ Location permission requested  
✅ Auto-detects and pre-selects country  
✅ Manual selection works  
✅ "Complete Setup" creates account  
✅ Shows loading spinner during creation  
✅ Navigates to Home screen  

---

## 6. Verify Home Screen

### What You Should See:
- "Welcome to TradeMatch! 🎉" title
- "Your profile has been created successfully"
- Card: "✅ Onboarding Complete"
- Card: "📋 Next Steps" with bullet points
- "Sign Out" button at bottom

### Test Actions:
1. **Read the welcome message**
2. **Scroll down** to see next steps
3. **Click "Sign Out"** → Returns to phone screen

### Expected Behavior:
✅ Home screen loads successfully  
✅ No errors in console  
✅ Sign out works  
✅ Returns to phone entry  

---

## 7. Verify in Firebase Console

### Check Authentication:
1. Go to https://console.firebase.google.com/
2. Select "job-market-copilot" project
3. Click **Authentication** → **Users**
4. You should see 1 user with:
   - Email (temporary): `[timestamp]@tradematch.temp`
   - Created date: just now
   - User UID

### Check Firestore Database:
1. Click **Firestore Database** → **Data**
2. Click **users** collection
3. Click the document (your user ID)
4. Verify all fields are present:
   ```
   ✅ name: "New User"
   ✅ phone: "+971501234567" (your number)
   ✅ email: "[timestamp]@tradematch.temp"
   ✅ trade: "electrician" (or your selection)
   ✅ country: "AE" (or your selection)
   ✅ yearsExperience: 0
   ✅ skills: []
   ✅ availability: "immediate"
   ✅ location: GeoPoint (lat, long)
   ✅ certifications: []
   ✅ createdAt: Timestamp
   ✅ updatedAt: Timestamp
   ```

### Expected Result:
✅ User exists in Authentication  
✅ User document exists in Firestore  
✅ All required fields present  
✅ Field names match architecture.md exactly  
✅ Timestamps are set  

---

## 8. Test Complete Flow Again

**Test that returning users go straight to Home:**

1. **Close and restart the app**
2. App should:
   - Show loading spinner briefly
   - Check auth state
   - See you're authenticated
   - Go straight to Home screen
   - **Skip phone/OTP/trade/location screens**

### Expected Behavior:
✅ Authenticated users bypass onboarding  
✅ Go directly to Home screen  
✅ No need to re-authenticate  

---

## 9. Test Sign Out & Sign In Loop

1. **From Home screen** → Click "Sign Out"
2. **Should return to** → Phone entry screen
3. **Enter phone** → "Send Code"
4. **Enter OTP** → Auto-submit
5. **Should go to** → Trade selection (profile exists check)
6. Wait... it should actually go to **Home** since profile already exists!

### Expected Behavior:
✅ Sign out works  
✅ Returns to phone entry  
✅ Re-authentication works  
✅ Existing users skip to Home (profile exists)  

---

## Common Issues & Solutions

### Issue: "Firebase: Error (auth/...)"
**Solution:** Check `.env` has correct Firebase config

### Issue: OTP doesn't submit automatically
**Solution:** Make sure all 6 digits are entered

### Issue: Location permission denied
**Solution:** Manually select country - fallback works!

### Issue: "Complete Setup" does nothing
**Solution:** Check console for errors, verify Firebase rules deployed

### Issue: User document not created
**Solution:** 
```bash
firebase deploy --only firestore:rules
```

### Issue: App crashes on startup
**Solution:** 
```bash
# Clear cache and restart
npx expo start --clear
```

---

## Performance Checklist

✅ Phone screen loads instantly  
✅ OTP input is responsive  
✅ Trade cards tap without delay  
✅ Location detection completes within 3 seconds  
✅ Profile creation completes within 2 seconds  
✅ No lag during navigation  

---

## Accessibility Checklist

✅ All inputs have labels  
✅ Buttons have descriptive text  
✅ Minimum 44px tap targets  
✅ 16px+ font size throughout  
✅ Error messages are clear  
✅ Color not sole indicator (icons + text used)  

---

## Success Criteria

All tests should pass:

- [x] Phone entry validates correctly
- [x] OTP auto-advances and auto-submits
- [x] Trade selection works with cards
- [x] Location auto-detects (with permission)
- [x] Manual country selection works
- [x] User created in Firebase Auth
- [x] Profile created in Firestore
- [x] All fields match schema
- [x] Home screen loads
- [x] Sign out/in loop works
- [x] Returning users skip onboarding

---

## Test Data

Use these for testing:

**Phone Numbers:**
- +971501234567 (UAE)
- +966501234567 (Saudi)
- +97433123456 (Qatar)

**OTP Codes:**
- Any 6 digits work (e.g., 123456)

**Trades:**
- Electrician
- Plumber
- HVAC Technician
- Carpenter

**Countries:**
- UAE 🇦🇪
- Saudi Arabia 🇸🇦
- Qatar 🇶🇦
- Kuwait 🇰🇼
- Oman 🇴🇲
- Bahrain 🇧🇭

---

**Status:** Ready for Testing  
**Estimated Test Time:** 5-10 minutes  
**Last Updated:** September 11, 2026
