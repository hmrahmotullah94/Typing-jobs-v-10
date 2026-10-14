
/* ==========================================================================
   Typing Jobs PWA
   Service Worker Registration + PWA Installation
   ========================================================================== */

(() => {
  'use strict';

  // Prevent duplicate initialization if this script is accidentally included twice.
  if (window.__typingJobsPWAInitialized) {
    return;
  }
  window.__typingJobsPWAInitialized = true;

  let deferredPrompt = null;

  function getPwaBar() {
    return document.getElementById('pwaBar');
  }

  function getInstallButton() {
    return document.getElementById('installButton');
  }

  function showInstallBar() {
    const bar = getPwaBar();

    if (bar) {
      bar.hidden = false;
      bar.style.display = 'flex';
    }
  }

  function hideInstallBar() {
    const bar = getPwaBar();

    if (bar) {
      bar.style.display = 'none';
      bar.hidden = true;
    }
  }

  // Register the Service Worker.
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('This browser does not support Service Workers.');
      return;
    }

    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }
// শুরুতে বাটন লুকিয়ে রাখুন (যতক্ষণ না ব্রাউজার নিশ্চিত করে যে অ্যাপটি ইনস্টল করা সম্ভব)
if (pwaBar) {
    pwaBar.hidden = true;
}
   
  // Show the installation option when the browser allows installation.
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showInstallBar();

    console.log('PWA installation is available.');
  });

  // Install button handler.
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('#installButton');

    if (!button || !deferredPrompt) {
      return;
    }

    const promptEvent = deferredPrompt;
    deferredPrompt = null;

    try {
      await promptEvent.prompt();

      const choice = await promptEvent.userChoice;
      console.log('PWA installation outcome:', choice.outcome);

      if (choice.outcome === 'accepted') {
        hideInstallBar();
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
    }
  });

  // Hide the installation bar after installation.
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hideInstallBar();

    console.log('PWA installed successfully.');
  });

  // Hide the installation bar if the app is already running as an installed app.
  function checkStandaloneMode() {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      hideInstallBar();
    }
  }

  // Initialize PWA features.
  function initializePWA() {
    registerServiceWorker();
    checkStandaloneMode();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePWA, {
      once: true
    });
  } else {
    initializePWA();
  }
})();
