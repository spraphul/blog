(() => {
  'use strict';
  const measurementId = 'G-T9GEG55GJ1';
  const optOutKey = 'blog-analytics-opt-out';
  const disabledKey = `ga-disable-${measurementId}`;
  let optedOut = false;
  try { optedOut = localStorage.getItem(optOutKey) === 'true'; } catch (_) {}
  const browserOptOut = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  const status = document.querySelector('[data-analytics-status]');
  const optOutButton = document.querySelector('[data-analytics-opt-out]');
  function updateChoice() {
    if (status) status.textContent = optedOut || browserOptOut ? 'Analytics is disabled in this browser.' : 'You can disable analytics in this browser below.';
    if (optOutButton) optOutButton.disabled = optedOut || browserOptOut;
  }
  updateChoice();
  if (optOutButton) optOutButton.addEventListener('click', () => {
    optedOut = true;
    window[disabledKey] = true;
    try { localStorage.setItem(optOutKey, 'true'); } catch (_) {}
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (!/^blog_ga(?:_|$)/.test(name)) return;
      for (const domain of ['', `;domain=${location.hostname}`, `;domain=.${location.hostname}`]) {
        document.cookie = `${name}=;max-age=0;path=/blog${domain};SameSite=Lax`;
      }
    });
    updateChoice();
  });
  if (location.hostname !== 'spraphul.github.io' || !location.pathname.startsWith('/blog/') || optedOut || browserOptOut) return;
  const cleanUrl = value => {
    try { const url = new URL(value, location.origin); return /^https?:$/.test(url.protocol) ? url.origin + url.pathname : ''; } catch (_) { return ''; }
  };
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_expires: 7776000,
    cookie_prefix: 'blog',
    cookie_path: '/blog',
    page_location: cleanUrl(location.href),
    page_referrer: cleanUrl(document.referrer)
  });
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(tag);
  const track = (name, params) => {
    if (!window[disabledKey]) gtag('event', name, { ...params, send_to: measurementId });
  };
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const link = target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (href.startsWith('mailto:')) {
      track('contact_click', { contact_method: 'email' });
    } else if (href.startsWith('#') || (link.origin === location.origin)) {
      track(link.closest('#posts') ? 'post_click' : 'navigation_click', { link_text: link.textContent.trim().slice(0, 100), link_target: href.startsWith('#') ? href : cleanUrl(link.href) });
    }
  });
})();
