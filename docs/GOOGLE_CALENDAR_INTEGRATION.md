# 📅 Google Calendar Integration - Implementation Guide

**Version:** 1.0.0
**Status:** In Development
**Start Date:** 2025-10-03

---

## 🎯 Overview

Google Calendar Integration ermöglicht Nutzern, Trainings direkt in ihren Google Calendar zu exportieren.

### Features

#### Phase 1: Quick Add (✅ Implementieren)
- ✅ "Add to Google Calendar" Button
- ✅ Pre-filled Event Links
- ✅ Bulk Export für mehrere Trainings
- ✅ Kein Backend erforderlich

#### Phase 2: OAuth Integration (🔜 Später)
- 🔜 OAuth2 Authentication
- 🔜 Automatisches Sync
- 🔜 Event Updates & Deletion
- 🔜 Requires Backend/Serverless Functions

#### Phase 3: Advanced Features (💡 Future)
- 💡 Real-time Sync
- 💡 Automatic Reminders
- 💡 Conflict Detection
- 💡 Multi-Calendar Support

---

## 🏗️ Architecture

### Phase 1: URL-based Integration (Current)

```
User clicks "Add to Calendar"
    ↓
Generate Google Calendar URL
    ↓
Open URL in new tab
    ↓
User confirms in Google Calendar
    ↓
Event created in user's calendar
```

**Pros:**
- ✅ No backend required
- ✅ No OAuth complexity
- ✅ Works immediately
- ✅ Privacy-friendly (no data stored)

**Cons:**
- ❌ No automatic sync
- ❌ Manual for each training
- ❌ No update notifications

### Phase 2: OAuth2 Integration (Future)

```
User clicks "Connect Google Calendar"
    ↓
OAuth2 Flow (via Serverless Function)
    ↓
Store Access Token (encrypted)
    ↓
Automatic Event Creation
    ↓
Background Sync
```

**Requirements:**
- Backend/Serverless Functions (Vercel/Netlify)
- Google Cloud Project
- OAuth2 Client Credentials
- Token Storage (Database)

---

## 📋 Implementation Plan

### Step 1: Google Calendar URL Generator

**File:** `src/js/calendar-integration.js`

```javascript
/**
 * Generate Google Calendar Event URL
 * @param {Object} training - Training object
 * @returns {string} Google Calendar URL
 */
export function createGoogleCalendarUrl(training) {
  const baseUrl = 'https://calendar.google.com/calendar/render'

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${training.training} - ${training.ort}`,
    dates: getEventDates(training),
    details: getEventDetails(training),
    location: getEventLocation(training),
    trp: 'true' // Show in new window
  })

  return `${baseUrl}?${params.toString()}`
}
```

### Step 2: Event Details Helper

```javascript
/**
 * Get formatted event dates (YYYYMMDDTHHMMSS format)
 */
function getEventDates(training) {
  const nextDate = getNextTrainingDate(training.wochentag)
  const [startHour, startMin] = training.von.split(':')
  const [endHour, endMin] = training.bis.split(':')

  const start = new Date(nextDate)
  start.setHours(parseInt(startHour), parseInt(startMin), 0)

  const end = new Date(nextDate)
  end.setHours(parseInt(endHour), parseInt(endMin), 0)

  return `${formatGoogleDate(start)}/${formatGoogleDate(end)}`
}

function formatGoogleDate(date) {
  return date.toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
}
```

### Step 3: UI Integration

**Update:** `index.html` - Add calendar buttons to training cards

```html
<!-- Add to Calendar Dropdown -->
<div class="relative" x-data="{ open: false }">
  <button @click="open = !open"
          type="button"
          class="inline-flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>
    Zum Kalender
  </button>

  <!-- Dropdown Menu -->
  <div x-show="open"
       @click.away="open = false"
       x-transition
       class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
    <a :href="createGoogleCalendarUrl(training)"
       target="_blank"
       class="block px-4 py-3 hover:bg-slate-50 rounded-t-lg">
      <div class="flex items-center gap-3">
        <img src="/icons/google-calendar.svg" class="w-5 h-5" alt="">
        <span class="font-medium text-slate-900">Google Calendar</span>
      </div>
    </a>

    <a @click="exportToIcal(training)"
       class="block px-4 py-3 hover:bg-slate-50">
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <span class="font-medium text-slate-900">Apple/Outlook (.ics)</span>
      </div>
    </a>

    <a @click="shareTraining(training)"
       class="block px-4 py-3 hover:bg-slate-50 rounded-b-lg border-t border-slate-100">
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
        </svg>
        <span class="font-medium text-slate-900">Link teilen</span>
      </div>
    </a>
  </div>
</div>
```

### Step 4: Bulk Calendar Export

**Feature:** Export all filtered trainings at once

```javascript
/**
 * Create Google Calendar URLs for multiple trainings
 * Opens them in sequence with delay
 */
export async function bulkAddToGoogleCalendar(trainings) {
  if (trainings.length === 0) {
    return { success: false, message: 'Keine Trainings zum Exportieren' }
  }

  // Limit to prevent browser blocking
  const MAX_BULK = 10
  const toExport = trainings.slice(0, MAX_BULK)

  for (let i = 0; i < toExport.length; i++) {
    const url = createGoogleCalendarUrl(toExport[i])

    // Open in new tab with delay
    window.open(url, '_blank')

    // Wait to prevent popup blocking
    if (i < toExport.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return {
    success: true,
    message: `${toExport.length} Trainings zu Google Calendar hinzugefügt`
  }
}
```

---

## 🔐 Phase 2: OAuth2 Setup (Future)

### Google Cloud Console Setup

1. **Create Project**
   - Go to https://console.cloud.google.com
   - Create new project "FAM Trainingsplan"

2. **Enable Calendar API**
   - APIs & Services → Enable APIs
   - Search "Google Calendar API"
   - Enable

3. **Create OAuth Credentials**
   - APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: `https://yourdomain.com/auth/callback`

4. **Get Credentials**
   - Client ID: `xxx.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxx` (NEVER commit to git!)

### Environment Variables

```bash
# .env (NEVER commit!)
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx  # Backend only!
```

### OAuth2 Flow (Serverless Function)

**File:** `api/auth/google-callback.js` (Vercel Serverless)

```javascript
import { google } from 'googleapis'

export default async function handler(req, res) {
  const { code } = req.query

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://yourdomain.com/auth/callback'
  )

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Store tokens in database (encrypted!)
    await storeTokens(tokens)

    res.redirect('/?calendar_connected=true')
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' })
  }
}
```

### Create Calendar Event (Backend)

```javascript
async function createCalendarEvent(training, accessToken) {
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const event = {
    summary: `${training.training} - ${training.ort}`,
    location: training.adresse || training.ort,
    description: formatEventDescription(training),
    start: {
      dateTime: getStartDateTime(training),
      timeZone: 'Europe/Berlin'
    },
    end: {
      dateTime: getEndDateTime(training),
      timeZone: 'Europe/Berlin'
    },
    recurrence: training.isRecurring ? [
      `RRULE:FREQ=WEEKLY;BYDAY=${getWeekday(training.wochentag)}`
    ] : undefined,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 24 * 60 }, // 24h before
        { method: 'popup', minutes: 60 }        // 1h before
      ]
    }
  }

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event
  })

  return response.data
}
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Single training "Add to Google Calendar"
- [ ] Bulk export (5 trainings)
- [ ] Recurring event creation
- [ ] Event details completeness
- [ ] Time zone correctness
- [ ] Mobile responsiveness
- [ ] Error handling

### Automated Tests

```javascript
// tests/unit/calendar-integration.test.js
describe('Google Calendar Integration', () => {
  it('should generate valid Google Calendar URL', () => {
    const training = {
      wochentag: 'Montag',
      von: '18:00',
      bis: '20:00',
      training: 'Parkour',
      ort: 'LTR'
    }

    const url = createGoogleCalendarUrl(training)

    expect(url).toContain('calendar.google.com')
    expect(url).toContain('action=TEMPLATE')
    expect(url).toContain('Parkour')
  })
})
```

---

## 📊 Analytics & Monitoring

### Events to Track

```javascript
// Google Analytics Events
gtag('event', 'calendar_export', {
  calendar_type: 'google',
  training_type: training.training,
  export_method: 'single' | 'bulk'
})
```

### Success Metrics

- Calendar export click-through rate
- Bulk export usage
- User retention after calendar integration
- Error rate

---

## 🚀 Deployment

### Phase 1 (URL-based)
1. Deploy calendar-integration.js
2. Update UI components
3. Test in production
4. Monitor analytics

### Phase 2 (OAuth2)
1. Setup Google Cloud Project
2. Deploy serverless functions
3. Setup database for tokens
4. Implement token refresh logic
5. Add revoke/disconnect feature

---

## 📚 Resources

- [Google Calendar API Docs](https://developers.google.com/calendar/api)
- [OAuth2 Flow Guide](https://developers.google.com/identity/protocols/oauth2)
- [Calendar URL Scheme](https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs)

---

## ⚠️ Security Considerations

### Phase 1 (URL-based)
- ✅ No sensitive data stored
- ✅ No authentication required
- ✅ Privacy-friendly

### Phase 2 (OAuth2)
- 🔐 Client Secret MUST be backend-only
- 🔐 Tokens MUST be encrypted in database
- 🔐 Use HTTPS only
- 🔐 Implement CSRF protection
- 🔐 Token expiration handling
- 🔐 Revoke access option
- 🔐 Audit logs

---

## 🎯 Next Steps

1. ✅ Implement Phase 1 (URL-based)
2. 📊 Collect user feedback
3. 📈 Measure adoption rate
4. 🔜 Plan Phase 2 based on demand
5. 💡 Consider other calendar providers (Outlook, Apple)

---

**Last Updated:** 2025-10-03
**Author:** Claude Code
