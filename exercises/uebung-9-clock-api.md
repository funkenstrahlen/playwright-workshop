# Übung 9 – Clock API für zeitbasierte Tests

**Ziel:**
Du lernst die Clock API zu nutzen, um zeitabhängige Features in der Feed App zu testen. Der Fokus liegt auf dem kontrollierten Testen von Timern, Timeouts und zeitbasierten Updates.

**Warum Clock API?**
- Tests für zeitabhängige Features ohne echtes Warten
- Reproduzierbare Tests unabhängig von der Systemzeit
- Schnellere Test-Ausführung (kein `setTimeout` warten)
- Edge Cases testen (z.B. Mitternacht, Monatswechsel)

**Aufgaben:**

1. **Session Timeout testen:**
   ```typescript
   // e2e/clock-api.spec.ts
   import { test, expect } from '@playwright/test';

   test.describe('Clock API Tests', () => {
     test('Session Timeout nach 30 Minuten', async ({ page }) => {
       // Clock vor Navigation installieren
       await page.clock.install({ time: new Date('2024-01-01 10:00:00') });

       // Login
       await page.goto('/auth/signin');
       await page.getByLabel('Email').fill('admin@example.com');
       await page.getByLabel('Password').fill('admin123');
       await page.getByRole('button', { name: 'Sign in' }).click();

       await expect(page).toHaveURL('/dashboard');

       // Zeit 31 Minuten vorspulen
       await page.clock.fastForward('31:00');

       // Aktion ausführen, die Session-Check triggert
       await page.reload();

       // Sollte zur Login-Seite redirecten
       await expect(page).toHaveURL('/auth/signin');
     });
   });
   ```

2. **"Zuletzt aktualisiert" Zeitstempel testen:**
   ```typescript
   test('News Update Timestamp', async ({ page }) => {
     // Startzeit setzen
     await page.clock.install({ time: new Date('2024-01-01 12:00:00') });
     await page.goto('/news/public');

     // Initial sollte "gerade eben" anzeigen
     const timestamp = page.locator('text=/gerade eben|just now/i').first();
     await expect(timestamp).toBeVisible();

     // 5 Minuten vorspulen
     await page.clock.fastForward('05:00');

     // Seite neu laden oder Update triggern
     await page.getByRole('button', { name: /refresh|aktualisieren/i }).click();

     // Sollte "vor 5 Minuten" anzeigen
     await expect(page.locator('text=/vor 5 Minuten|5 minutes ago/i')).toBeVisible();

     // 1 Stunde vorspulen
     await page.clock.fastForward('01:00:00');
     await page.getByRole('button', { name: /refresh|aktualisieren/i }).click();

     // Sollte "vor 1 Stunde" anzeigen
     await expect(page.locator('text=/vor 1 Stunde|1 hour ago/i')).toBeVisible();
   });
   ```

3. **Auto-Refresh Feature testen:**
   ```typescript
   test('Auto-Refresh alle 60 Sekunden', async ({ page }) => {
     await page.clock.install();
     await page.goto('/news/public');

     // Intercepte Refresh-Requests
     let refreshCount = 0;
     await page.route('**/api/news/public', async route => {
       refreshCount++;
       await route.continue();
     });

     // Initial Load
     expect(refreshCount).toBe(1);

     // 60 Sekunden vorspulen
     await page.clock.fastForward('01:00');

     // Auto-Refresh sollte getriggert werden
     await page.waitForTimeout(100); // Kurz warten für Event-Loop
     expect(refreshCount).toBe(2);

     // Weitere 60 Sekunden
     await page.clock.fastForward('01:00');
     await page.waitForTimeout(100);
     expect(refreshCount).toBe(3);
   });
   ```

4. **Countdown Timer testen:**
   ```typescript
   test('Countdown für nächsten Refresh', async ({ page }) => {
     await page.clock.install({ time: new Date('2024-01-01 12:00:00') });
     await page.goto('/news/public');

     // Angenommen es gibt einen Countdown
     const countdown = page.locator('[data-testid="refresh-countdown"]');

     // Start bei 60 Sekunden
     await expect(countdown).toHaveText('60');

     // 10 Sekunden vorspulen
     await page.clock.fastForward('00:10');
     await expect(countdown).toHaveText('50');

     // 40 weitere Sekunden
     await page.clock.fastForward('00:40');
     await expect(countdown).toHaveText('10');

     // Bis 0
     await page.clock.fastForward('00:10');
     await expect(countdown).toHaveText('60'); // Reset nach Refresh
   });
   ```

5. **Datum-spezifische Features testen:**
   ```typescript
   test('Spezielle Nachricht an Feiertagen', async ({ page }) => {
     // Setze Zeit auf Weihnachten
     await page.clock.install({ time: new Date('2024-12-25 10:00:00') });
     await page.goto('/');

     // Prüfe auf Weihnachts-Banner
     await expect(page.locator('text=/Frohe Weihnachten|Merry Christmas/i')).toBeVisible();

     // Springe zum nächsten Tag
     await page.clock.fastForward('24:00:00');
     await page.reload();

     // Banner sollte weg sein
     await expect(page.locator('text=/Frohe Weihnachten|Merry Christmas/i')).not.toBeVisible();
   });
   ```

6. **Rate Limiting testen:**
   ```typescript
   test('API Rate Limit Reset nach 1 Minute', async ({ page }) => {
     await page.clock.install();
     await page.goto('/news/public');

     // Mache 5 schnelle Requests (angenommen Limit ist 5)
     for (let i = 0; i < 5; i++) {
       await page.getByRole('button', { name: /refresh/i }).click();
       await page.waitForLoadState('networkidle');
     }

     // 6. Request sollte blockiert werden
     await page.getByRole('button', { name: /refresh/i }).click();
     await expect(page.locator('text=/rate limit|zu viele anfragen/i')).toBeVisible();

     // Warte 1 Minute (Rate Limit Reset)
     await page.clock.fastForward('01:00');

     // Jetzt sollte es wieder funktionieren
     await page.getByRole('button', { name: /refresh/i }).click();
     await expect(page.locator('text=/rate limit|zu viele anfragen/i')).not.toBeVisible();
   });
   ```

7. **Pausieren und Fortsetzen der Zeit:**
   ```typescript
   test('Pause Clock für Debugging', async ({ page }) => {
     const now = new Date('2024-01-01 12:00:00');
     await page.clock.install({ time: now });

     // Pausiere die Zeit
     await page.clock.pauseAt(now);

     await page.goto('/news/public');

     // Zeit bleibt stehen, auch nach Aktionen
     await page.waitForTimeout(1000);

     const time1 = await page.locator('time').first().textContent();

     await page.waitForTimeout(1000);

     const time2 = await page.locator('time').first().textContent();

     // Zeit sollte gleich bleiben
     expect(time1).toBe(time2);

     // Zeit fortsetzen
     await page.clock.resume();

     // Jetzt läuft die Zeit wieder
     await page.clock.fastForward('00:01');
     const time3 = await page.locator('time').first().textContent();
     expect(time3).not.toBe(time2);
   });
   ```

**Clock API Methoden:**
- `install()` - Installiert die Clock mit optionaler Startzeit
- `fastForward()` - Springt Zeit vorwärts
- `pauseAt()` - Pausiert Zeit bei bestimmtem Zeitpunkt
- `resume()` - Setzt pausierte Zeit fort
- `runFor()` - Führt alle Timer im Zeitraum aus
- `setFixedTime()` - Setzt feste Zeit
- `setSystemTime()` - Setzt Systemzeit

**Best Practices:**
- ✅ Installiere Clock VOR page.goto()
- ✅ Nutze realistische Zeitsprünge
- ✅ Teste Edge Cases (Mitternacht, Monatswechsel)
- ✅ Kombiniere mit Network Mocking für konsistente Tests
- ❌ Vermeide zu große Zeitsprünge (können zu Timeouts führen)

**Zeit:** 30 Minuten

---

> **Tipp:** Die Clock API funktioniert mit Date, setTimeout, setInterval und requestAnimationFrame. Perfekt für React-Komponenten mit useEffect-Timern!