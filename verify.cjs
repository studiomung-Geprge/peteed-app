const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');

async function step(name, fn) {
  try {
    await fn();
    console.log('OK  ', name);
  } catch (e) {
    console.log('FAIL', name, '-', e.message.split('\n')[0]);
  }
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 500, height: 950 } });
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('console.error: ' + msg.text()); });

  await step('goto', () => page.goto('http://127.0.0.1:8099/preview_full.html', { waitUntil: 'domcontentloaded', timeout: 10000 }));
  await page.waitForTimeout(600);
  await step('shot login', () => page.screenshot({ path: '/home/claude/peteed-app/shot_1_login.png' }));

  await step('login click', () => page.click('text=네이버로 시작하기'));
  await page.waitForTimeout(400);
  await step('shot home', () => page.screenshot({ path: '/home/claude/peteed-app/shot_2_home.png' }));

  await step('wallet tab', () => page.click('button:has-text("신분증")'));
  await page.waitForTimeout(300);
  await step('shot wallet', () => page.screenshot({ path: '/home/claude/peteed-app/shot_3_wallet.png' }));

  await step('health tab', () => page.click('button:has-text("건강기록")'));
  await page.waitForTimeout(300);
  await step('shot health', () => page.screenshot({ path: '/home/claude/peteed-app/shot_4_health.png' }));

  await step('facilities tab', () => page.click('button:has-text("시설예약")'));
  await page.waitForTimeout(300);
  await step('shot facilities', () => page.screenshot({ path: '/home/claude/peteed-app/shot_5_facilities.png' }));

  await step('open facility webview', () => page.click('button:has-text("예약하기") >> nth=0'));
  await page.waitForTimeout(500);
  await step('shot facility webview', () => page.screenshot({ path: '/home/claude/peteed-app/shot_5b_facility_webview.png' }));
  await step('close webview (Escape via X)', () => page.keyboard.press('Escape').catch(() => {}));
  // click the visible X close button by role
  await step('close webview click', () => page.locator('button svg line[x1="18"]').first().click({ timeout: 2000 }));
  await page.waitForTimeout(300);

  await step('emergency tab', () => page.click('.pl-tabbar button:has-text("응급")'));
  await page.waitForTimeout(500);
  await step('shot emergency', () => page.screenshot({ path: '/home/claude/peteed-app/shot_6_emergency.png' }));

  await step('search input', () => page.fill('input[placeholder="주소 또는 장소 검색..."]', '안동동물병원'));
  await step('search click', () => page.click('text=검색', { timeout: 3000 }));
  await page.waitForTimeout(500);
  await step('shot emergency searched', () => page.screenshot({ path: '/home/claude/peteed-app/shot_6b_emergency_searched.png' }));

  await step('open map popup', () => page.click('text=지도에서 열기', { timeout: 3000 }));
  await page.waitForTimeout(500);
  await step('shot map popup', () => page.screenshot({ path: '/home/claude/peteed-app/shot_6c_map_popup.png' }));
  await step('close map popup', () => page.click('text=닫기', { timeout: 3000 }));
  await page.waitForTimeout(200);

  await step('home tab', () => page.click('button:has-text("홈")'));
  await page.waitForTimeout(200);
  await step('qr open', () => page.click('.passport-foot > div[title="신분증 QR 확대"]', { timeout: 3000 }));
  await page.waitForTimeout(400);
  await step('shot qr', () => page.screenshot({ path: '/home/claude/peteed-app/shot_7_qr.png' }));

  console.log('ERRORS:', JSON.stringify(errors, null, 2));
  await browser.close();
})();
