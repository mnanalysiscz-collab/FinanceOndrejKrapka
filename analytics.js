(function () {
  'use strict';

  const measurementId = 'G-4PWKDW6VBN';
  const storageKey = 'ok-analytics-consent-v1';
  let analyticsLoaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', measurementId);

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(script);
  }

  function currentChoice() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function saveChoice(choice) {
    try {
      window.localStorage.setItem(storageKey, choice);
    } catch (error) {
      // The choice still applies for the current page when storage is unavailable.
    }
  }

  function buildConsentUi() {
    const banner = document.createElement('section');
    banner.className = 'analytics-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'analytics-consent-title');
    banner.setAttribute('aria-describedby', 'analytics-consent-text');
    banner.hidden = true;
    banner.innerHTML =
      '<div class="analytics-consent-copy">' +
        '<span class="analytics-consent-kicker">Vaše soukromí</span>' +
        '<h2 id="analytics-consent-title">Pomozte mi web zlepšovat.</h2>' +
        '<p id="analytics-consent-text">S vaším souhlasem používám Google Analytics, abych věděl, které části webu jsou užitečné. Bez souhlasu analytické měření nespustím.</p>' +
      '</div>' +
      '<div class="analytics-consent-actions">' +
        '<button class="analytics-consent-button analytics-consent-accept" type="button">Přijmout analytiku</button>' +
        '<button class="analytics-consent-button analytics-consent-reject" type="button">Odmítnout</button>' +
      '</div>';
    document.body.appendChild(banner);

    const settingsButton = document.createElement('button');
    settingsButton.className = 'analytics-settings';
    settingsButton.type = 'button';
    settingsButton.textContent = 'Nastavení analytiky';
    const footer = document.querySelector('.site-footer');
    if (footer) footer.appendChild(settingsButton);

    function showBanner() {
      banner.hidden = false;
      window.requestAnimationFrame(function () {
        banner.classList.add('is-visible');
      });
    }

    function hideBanner() {
      banner.classList.remove('is-visible');
      window.setTimeout(function () {
        banner.hidden = true;
      }, 220);
    }

    banner.querySelector('.analytics-consent-accept').addEventListener('click', function () {
      saveChoice('granted');
      loadAnalytics();
      hideBanner();
    });

    banner.querySelector('.analytics-consent-reject').addEventListener('click', function () {
      const wasLoaded = analyticsLoaded;
      saveChoice('denied');
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
      hideBanner();
      if (wasLoaded) window.setTimeout(function () { window.location.reload(); }, 240);
    });

    settingsButton.addEventListener('click', showBanner);

    const choice = currentChoice();
    if (choice === 'granted') loadAnalytics();
    if (!choice) showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildConsentUi, { once: true });
  } else {
    buildConsentUi();
  }
})();
