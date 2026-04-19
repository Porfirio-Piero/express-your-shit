# SecretDrop Improvement Plan

## Current State Analysis

### ✅ Working Correctly
- AES-256-GCM client-side encryption
- Self-destruct after viewing (one-time view)
- Time-based expiration (1h, 24h, 7d, 30d options)
- Password protection (optional PBKDF2 layer)
- Stripe checkout integration
- Responsive UI components

### ⚠️ Issues Found

1. **Pro Features Not Enforced**
   - UI shows "Pro" labels but API doesn't check subscription
   - 30d expiration and multi-view options are client-side only
   - Anyone can use Pro features by modifying frontend

2. **No Dark Mode**
   - No dark mode CSS variables defined
   - No Tailwind dark mode config
   - Colors hardcoded for light theme

3. **No Rate Limiting**
   - Unlimited secret creation
   - Vulnerable to abuse

4. **Mobile Responsiveness**
   - Needs testing on actual devices
   - Some layouts may need adjustment

5. **Missing Features**
   - No view count tracking for users
   - No secret preview before creation
   - No copy feedback animation

## Implementation Plan

### Phase 1: Dark Mode Support
- [ ] Add dark mode CSS variables
- [ ] Configure Tailwind dark mode
- [ ] Update all components with dark mode styles
- [ ] Add dark mode toggle to Header

### Phase 2: Mobile Polish
- [ ] Test on mobile viewports
- [ ] Improve touch targets
- [ ] Optimize secret textarea for mobile
- [ ] Add pull-to-refresh hint

### Phase 3: Pro Tier Enforcement
- [ ] Create Pro subscription check API
- [ ] Add subscription status to user context
- [ ] Enforce limits on backend
- [ ] Update UI to show current plan status

### Phase 4: Security Improvements
- [ ] Add rate limiting to API routes
- [ ] Implement request signing
- [ ] Add CAPTCHA for anonymous users
- [ ] Audit logging for security events

### Phase 5: UX Enhancements
- [ ] Add secret preview before creation
- [ ] Improve copy feedback
- [ ] Add secret strength indicator
- [ ] Show remaining time countdown

## Priority Order
1. Dark Mode (high visibility)
2. Mobile Polish (high visibility)
3. Pro Tier Enforcement (business critical)
4. Security (important but not blocking)
5. UX Enhancements (nice to have)