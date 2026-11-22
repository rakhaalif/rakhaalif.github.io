// The demo's words and timings, in one place: copy changes here never touch the animation code.
export type Phase = 'crawl' | 'functional' | 'visual' | 'run' | 'summary';
export type Line = { phase: Phase; text: string; result?: 'pass' | 'fail'; target?: string };

export const HEADING = 'An AI agent testing a web app. It writes the tests, then runs them.';
export const CAPTION = 'A scripted replay of how my thesis agent works, on a mock login and checkout app. No AI runs in your browser.';
export const BUTTONS = { run: 'Run the agent', replay: 'Replay the run', reduced: 'Play anyway' };
export const BOARD = { label: 'See the use-case board', href: 'https://www.figma.com/design/tFlV4Sti2pGrOGFejt27MW/Usecase-Casecraft-Agent-Netmonk' };
export const WAITING = 'Press Run the agent to start the replay.';
export const TITLE = ['test-agent', 'replay'];
export const SUMMARY = '12 passed, 1 failed: the visual check caught the Pay button 12 px out of line.';
export const REAL_SYSTEM = 'The real agent reads a web app, writes functional and visual test cases and runs them. I built it in Python with the Gemini API and RAG at PT Telkom Indonesia, Jul to Sep 2025.';

const pass = (text: string, target: string): Line => ({ phase: 'run', text, result: 'pass', target });

// A "$ " line is typed; two or more spaces split off a dim note. The output line after a write
// streams the test names it writes (functional: names without "_visual_", visual: with it).
export const SCRIPT: Line[] = [
  { phase: 'crawl', text: '$ python agent.py crawl mock-shop.local' },
  { phase: 'crawl', text: '2 screens, 11 elements: login, checkout' },
  { phase: 'functional', text: '$ python agent.py write --functional        (LLM + RAG)' },
  { phase: 'functional', text: '9 functional test cases' },
  { phase: 'visual', text: '$ python agent.py write --visual' },
  { phase: 'visual', text: '4 visual test cases' },
  { phase: 'run', text: '$ python agent.py run' },
  pass('test_login_with_valid_account', 'login-submit'),
  pass('test_login_rejects_wrong_password', 'login-password'),
  pass('test_login_requires_email', 'login-email'),
  pass('test_password_field_is_masked', 'login-password'),
  pass('test_checkout_lists_cart_items', 'cart-list'),
  pass('test_quantity_change_updates_total', 'cart-qty'),
  pass('test_remove_item_from_cart', 'cart-remove'),
  pass('test_checkout_requires_address', 'checkout-address'),
  pass('test_pay_button_submits_order', 'pay-button'),
  pass('test_visual_login_layout', 'login-form'),
  pass('test_visual_cart_summary_spacing', 'cart-summary'),
  { phase: 'run', text: 'test_visual_pay_button_alignment', result: 'fail', target: 'pay-button' },
  { phase: 'run', text: 'Pay button sits 12 px right of the form column' },
  pass('test_visual_checkout_layout', 'checkout-form'),
  { phase: 'summary', text: '13 tests: 12 passed, 1 failed' },
];

/** Seconds. The whole run comes to about 24 s. */
export const TIMING = { char: 0.03, pause: 0.45, hop: 0.26, write: 0.24, test: 0.42, fail: 1.4 };
