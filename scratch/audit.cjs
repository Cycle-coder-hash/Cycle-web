const fs = require('fs');
const path = require('path');

console.log('================ AUDIT REPORT ================');

// 1. Position Size Calculator in Dashboard
const dashboard = fs.readFileSync('client/src/pages/Dashboard.tsx', 'utf8');
console.log('1. Position Size Calculator in Dashboard:', 
  dashboard.includes('Position Size') || dashboard.includes('position-size') || dashboard.includes('PositionCalculator'));

// 2. Journal Entry optional fields
const journal = fs.readFileSync('client/src/components/journal/TraderJournal.tsx', 'utf8');
console.log('2. Journal optional fields (Entry Price / Stop Loss):', 
  journal.includes('Entry Price (Optional)') || journal.includes('Entry Price*') || journal.includes('Stop Loss (Optional)'));

// 3. Store checkout - no "or dial USSD"
const checkout = fs.readFileSync('client/src/pages/Checkout.tsx', 'utf8');
console.log('3. Checkout contains "or dial USSD"?', checkout.includes('or dial USSD') || checkout.includes('dial USSD'));

// 4. Support messaging admin <-> customer & Support page gating
const support = fs.readFileSync('client/src/pages/Support.tsx', 'utf8');
console.log('4. Support page has "Premium Exclusive" blocking input?', support.includes('Premium Exclusive'));

// 5. Order Summary - no "15 Complete Institutional eBooks"
console.log('5. Checkout contains "15 Complete Institutional eBooks"?', 
  checkout.includes('15 Complete Institutional eBooks') || checkout.includes('Institutional eBooks'));

// 6. Sidebar toggle on Dashboard
console.log('6. Dashboard sidebar toggle button:', 
  dashboard.includes('toggleSidebar') || dashboard.includes('sidebarOpen') || dashboard.includes('Toggle sidebar'));

// 7. Leaderboard animations
const leaderboard = fs.readFileSync('client/src/pages/Leaderboard.tsx', 'utf8');
console.log('7. Leaderboard TwinklingStarfield:', leaderboard.includes('TwinklingStarfield'));
console.log('7. Leaderboard HeroSparkleCanvas:', leaderboard.includes('HeroSparkleCanvas'));
console.log('7. Leaderboard badge animations:', leaderboard.includes('badge-light-sweep'));
console.log('7. Leaderboard 5 stat loop:', leaderboard.includes('statBoxVisibleIndices'));

// 8. Header wordmark
console.log('8. HeaderBrandWordmark in Header:', fs.existsSync('client/src/components/HeaderBrandWordmark.tsx'));

// 9. Languages strictly 3 (Bangla, English, Urdu)
const i18n = fs.existsSync('client/src/lib/i18n.ts') ? fs.readFileSync('client/src/lib/i18n.ts', 'utf8') : '';
console.log('9. i18n languages:', i18n.includes('bn') && i18n.includes('en') && i18n.includes('ur'));

// 10. Checkout Other Payment option
console.log('10. Checkout Other Payment option:', 
  checkout.includes('Other Payment') || checkout.includes('other'));

// 11. Financial Market Time Zone widget in Dashboard
console.log('11. Financial Market Time Zone widget in Dashboard:', 
  dashboard.includes('Financial Market Time Zone') || dashboard.includes('marketTimezone') || dashboard.includes('timezone'));

// 12. Dual profile section on Homepage (Founder + Cycle of Chart)
const home = fs.readFileSync('client/src/pages/Home.tsx', 'utf8');
console.log('12. Home dual profile (Founder + Cycle of Chart):', 
  home.includes('Cycle of Chart') && home.includes('Founder'));

// 13. Mobile experience polish
const indexCss = fs.readFileSync('client/src/index.css', 'utf8');
console.log('13. Mobile polish classes in index.css:', 
  indexCss.includes('mobile-') || indexCss.includes('@media (max-width'));

// 14. Direct Support chat backend
const routers = fs.readFileSync('server/routers.ts', 'utf8');
console.log('14. Support routers in server/routers.ts:', 
  routers.includes('support') || routers.includes('ticket'));

// 15. Journal sync endpoints in server/routers.ts
console.log('15. Journal sync endpoints in server/routers.ts:', 
  routers.includes('getJournalBooks') && routers.includes('saveJournalBooks'));

// 16. Notebook sync endpoints in server/routers.ts
console.log('16. Notebook sync endpoints in server/routers.ts:', 
  routers.includes('getNotebookData') && routers.includes('saveNotebookData'));
