# Zunoora Desktop — Professional Test Plan

## 1. App Shell & Layout

| # | Test | Steps | Expected |
|---|---|---|---|
| 1.1 | App launches | Run `npm run dev` | Electron window opens, title "Zunoora", 1200×800 |
| 1.2 | Dark theme renders | Observe window | Background #0A0A0A, text #EDEDED, sidebar #080808 |
| 1.3 | Sidebar collapsed | On first launch | 60px wide, only diamond + Clock + Plus + Settings + User icons visible |
| 1.4 | Sidebar expands | Click diamond button | Width animates to 260px, "ZUNOORA" + "Tarix" label + item text visible |
| 1.5 | Sidebar collapses | Click diamond again | Width animates back to 60px, labels hidden |
| 1.6 | Diamond rotation | Observe toggle | Diamond rotates 45° on expand, 0° on collapse, smooth CSS transition |
| 1.7 | Sidebar persists | Expand sidebar → close app → reopen | Sidebar stays expanded |
| 1.8 | Brand text | On launch, no search active | "Zunoora" serif-italic centered + "What shall we draft today?" + "A lesson plan..." |

## 2. Search

| # | Test | Steps | Expected |
|---|---|---|---|
| 2.1 | Search bar position | On launch | Search bar centered both horizontally and vertically |
| 2.2 | Search focus | Click search bar | Border changes to hairline, shadow appears, rounded-2xl changes |
| 2.3 | Unified look | Focus search bar | Bar + results = one element, shared border, seamless join |
| 2.4 | "New shablon" | Focus search bar | "+ Yangi shablon" pinned as first result row |
| 2.5 | Type produces results | Type "y" | After 180ms debounce, "Yillik Taqvim-Mavzu Reja" + "Yakuniy Hisobot" appear |
| 2.6 | Type other letters | Type "d", "o", "s" | Respective mock results appear |
| 2.7 | No results | Type "zzz" | "Natija topilmadi" message |
| 2.8 | Recent suggestions | Focus search with empty query | Shows 5 placeholder Uzbek shablon names |
| 2.9 | Clear search | Type something → click "New chat" in sidebar | Search clears, results hidden |

## 3. Search → Fulfillment Transition

| # | Test | Steps | Expected |
|---|---|---|---|
| 3.1 | Select result | Click any search result | Search bar animates to top-left corner, brand fades out |
| 3.2 | Document card appears | After transition | A4 card fades in with paper texture, "Shablon to'ldirish" header |
| 3.3 | Version picker | Observe card header | "Versiyalar" dropdown visible in header area |
| 3.4 | Version picker opens | Click "Versiyalar" | Dropdown shows 3 past years |
| 3.5 | Docked search bar | After selection | Compact search bar at top-left shows query text |
| 3.6 | Animation smoothness | Select result repeatedly | No jump-cuts, spring animation ~250-400ms |
| 3.7 | No overlap | After selection | Search bar and card do not overlap (pt-16 on card container) |
| 3.8 | Undock | Click "Ortga" on form → or "Yangi hujjat" on done | Returns to home state: brand appears, search bar centered |

## 4. Document Fulfillment Form

| # | Test | Steps | Expected |
|---|---|---|---|
| 4.1 | Form loads | After selecting search result | 3-step form appears in A4 card |
| 4.2 | Step 1 fields | Step 1 label | "1-qadam: Asosiy ma'lumotlar", fields: maktab, direktor, o'qituvchi, fan, sinf, yil |
| 4.3 | Step progress bar | Step 1 visible | 3 segments, first warm, rest hairline |
| 4.4 | Required validation | Click "Keyingi" with empty fields | Red error messages "bo'sh bo'lishi mumkin emas" on required fields |
| 4.5 | Fill step 1 | Fill all required fields | Error clears, "Keyingi" becomes active |
| 4.6 | Step 2 appears | Click "Keyingi" | Progress: segment 2 warm, fields: hujjat nomi, sana, raqam, izoh |
| 4.7 | Date validation | Enter "abc" in date field | "Sana KK.OO.YYYY formatida" error |
| 4.8 | Valid date | Enter "01.09.2025" | No error on date field |
| 4.9 | Step 3 | Click "Keyingi" from step 2 | Progress: all segments warm, fields: qabul qiluvchi, asos, ilova |
| 4.10 | Complete form | Click "Tayyor" from step 3 | Transitions to "Hujjat tayyor" done state |

## 5. Done / Export

| # | Test | Steps | Expected |
|---|---|---|---|
| 5.1 | Done state | After form completion | Checkmark + "Hujjat tayyor" + "Barcha ma'lumotlar to'ldirildi" |
| 5.2 | Export button | Observe done state | "Yuklab olish (.docx)" button visible |
| 5.3 | Export click | Click "Yuklab olish" | Confirmation message: "Hujjat saqlandi: ~/Documents/Zunoora/hujjat.docx" |
| 5.4 | New document | Click "Yangi hujjat yaratish" | Returns to home: brand visible, search bar centered |
| 5.5 | Form back | Click "Ortga" on step 1 | Returns to home state (undocks) |

## 6. Settings

| # | Test | Steps | Expected |
|---|---|---|---|
| 6.1 | Open settings | Click ⚙ in sidebar | Dialog opens centered on screen with animation |
| 6.2 | Title | Observe dialog | "Settings" in serif-italic, close X button |
| 6.3 | Theme toggle | Click theme switch | Switch animates from left to right, label "Dark" |
| 6.4 | Theme persists | Change theme → close | Relaunch app, theme persists |
| 6.5 | Language select | Click "Русский" | UI changes to Russian immediately |
| 6.6 | Language Uzbek | Click "O'zbek" | UI changes to Uzbek immediately |
| 6.7 | Language English | Click "English" | UI changes to English immediately |
| 6.8 | Language persists | Change lang → close → reopen | Language persists |
| 6.9 | Close settings | Click X or backdrop | Dialog closes with animation |

## 7. Account

| # | Test | Steps | Expected |
|---|---|---|---|
| 7.1 | Open account | Click 👤 in sidebar | Card opens near bottom-left with animation |
| 7.2 | Login state | First time (not logged in) | "Hisob" title, login input, password input, "Kirish" button |
| 7.3 | Login | Enter name + password → click "Kirish" | Card updates: avatar placeholder + name + school + role + read-only fields |
| 7.4 | Logout | Click red "Chiqish" | Returns to login state, card closes |
| 7.5 | Account persists | Login → close → reopen account | Still logged in |
| 7.6 | Close account | Click X or backdrop | Card closes with animation |
| 7.7 | Empty login | Click "Kirish" with empty field | Nothing happens (no crash) |

## 8. i18n Completeness

| # | Language | All sidebar keys translated? | Search keys? | Settings keys? | Account keys? | Common keys? |
|---|---|---|---|---|---|---|
| 8.1 | uz (Uzbek) | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8.2 | ru (Russian) | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8.3 | en (English) | ✅ | ✅ | ✅ | ✅ | ✅ |

## 9. Build

| # | Test | Steps | Expected |
|---|---|---|---|
| 9.1 | npm run build | Run in terminal | Exits with code 0, output in out/ |
| 9.2 | npm run package:win | Run in terminal | Produces release/win-unpacked/Zunoora.exe |
| 9.3 | Zunoora.exe launches | Run the .exe | App window opens with all features |

## 10. Regression (Edge Cases)

| # | Test | Steps | Expected |
|---|---|---|---|
| 10.1 | Rapid sidebar toggle | Click diamond rapidly 10× | No UI glitch, ends in correct state |
| 10.2 | Search while docked | Type while fulfillment card open | Search input works, results don't appear (docked) |
| 10.3 | Multiple selects | Select result → back → select again | Flow works end-to-end each time |
| 10.4 | Empty state | Clear all → reload | App shows clean initial state with seed data |
| 10.5 | Window resize | Drag window to 900×600 | Layout adapts, no overflow, no clipping |
