/* ==========================================================================
   ১. সার্ভিস ওয়ার্কার ও PWA ইনস্টল লজিক
   ========================================================================== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((reg) => console.log('Service Worker Registered!', reg))
      .catch((err) => console.log('Service Worker Registration Failed!', err));
  });
}

let deferredPrompt;
const pwaBar = document.getElementById('pwaBar');
const installButton = document.getElementById('installButton');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (pwaBar) {
    pwaBar.removeAttribute('hidden');
    pwaBar.style.display = 'flex';
  }
});

if (installButton) {
  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User installed the PWA');
    }
    deferredPrompt = null;
    if (pwaBar) pwaBar.style.display = 'none';
  });
}

window.addEventListener('appinstalled', () => {
  if (pwaBar) pwaBar.style.display = 'none';
});


/* ==========================================================================
   ২. টাইপিং অ্যাপের ডাটা ও এলিমেন্ট সিলেকশন
   ========================================================================== */
// টাইপিং টেস্টের জন্য নমুনা প্যারাগ্রাফ (বাংলা ও ইংরেজি)
const paragraphs = [
  "দ্রুত টাইপিং শেখার জন্য নিয়মিত অনুশীলন অত্যন্ত প্রয়োজনীয়। একাগ্রতা এবং নিয়মিত চর্চা আপনার গতি অনেক বাড়িয়ে দেবে।",
  "প্রযুক্তি আমাদের জীবনকে সহজ করে দিয়েছে। সঠিক নিয়মে কিবোর্ড ব্যবহার করলে কম সময়ে অনেক বেশি কাজ করা সম্ভব।",
  "সহজ বাংলা টাইপিং অ্যাপে আপনাকে স্বাগতম। আপনার আঙুলের গতি পরীক্ষা করুন এবং প্রতিদিন নিজের রেকর্ড নিজেই ভাঙুন।",
  "The quick brown fox jumps over the lazy dog. Practice typing every day to improve your speed and accuracy.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. Keep practicing keyboard shortcuts."
];

// HTML DOM এলিমেন্টসমূহ
const textDisplay = document.getElementById('typingText');
const inputField = document.getElementById('inputField');
const timerTag = document.getElementById('timer');
const mistakeTag = document.getElementById('mistakes');
const wpmTag = document.getElementById('wpm');
const cpmTag = document.getElementById('cpm');
const accuracyTag = document.getElementById('accuracy');
const tryAgainBtn = document.getElementById('restartBtn');

// স্টেট ভ্যারিয়েবল
let timer;
let maxTime = 60; // টেস্টের সময় (সেকেন্ডে)
let timeLeft = maxTime;
let charIndex = 0;
let mistakes = 0;
let isTyping = false;


/* ==========================================================================
   ৩. কোর ফাংশনালিটি (Logic)
   ========================================================================== */

// ১. র্যান্ডম প্যারাগ্রাফ লোড করা
function loadParagraph() {
  const ranIndex = Math.floor(Math.random() * paragraphs.length);
  if (textDisplay) {
    textDisplay.innerHTML = "";
    // প্রতিটি অক্ষরকে আলাদা <span> ট্যাগে ভাগ করা
    paragraphs[ranIndex].split("").forEach(char => {
      let span = `<span>${char}</span>`;
      textDisplay.innerHTML += span;
    });
    // প্রথম অক্ষরে active ক্লাস যোগ করা
    if (textDisplay.querySelectorAll("span").length > 0) {
      textDisplay.querySelectorAll("span")[0].classList.add("active");
    }
  }
}

// ২. টাইপিং ইনপুট হ্যান্ডেল করা
function initTyping() {
  const characters = textDisplay.querySelectorAll("span");
  let typedChar = inputField.value.split("")[charIndex];

  if (charIndex < characters.length && timeLeft > 0) {
    // টাইমার শুরু করা (যদি আগে শুরু না হয়ে থাকে)
    if (!isTyping) {
      timer = setInterval(initTimer, 1000);
      isTyping = true;
    }

    // ব্যাকস্পেস বা মুছে ফেলা হ্যান্ডলিং
    if (typedChar == null) {
      if (charIndex > 0) {
        charIndex--;
        if (characters[charIndex].classList.contains("incorrect")) {
          mistakes--;
        }
        characters[charIndex].classList.remove("correct", "incorrect");
      }
    } else {
      // টাইপ করা অক্ষর সঠিক নাকি ভুল তা যাচাই
      if (characters[charIndex].innerText === typedChar) {
        characters[charIndex].classList.add("correct");
      } else {
        mistakes++;
        characters[charIndex].classList.add("incorrect");
      }
      charIndex++;
    }

    // active ক্লাস আপডেট করা
    characters.forEach(span => span.classList.remove("active"));
    if (charIndex < characters.length) {
      characters[charIndex].classList.add("active");
    }

    // স্কোর হিসেব ও আপডেট
    updateStats();
  } else {
    // টেস্ট শেষ হলে ইনপুট ডিজেবল করা
    clearInterval(timer);
    inputField.value = "";
  }
}

// ৩. টাইমার কাউন্টডাউন
function initTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    if (timerTag) timerTag.innerText = timeLeft;
    updateStats();
  } else {
    clearInterval(timer);
    inputField.disabled = true;
  }
}

// ৪. স্কোর (WPM, CPM, Accuracy, Mistakes) আপডেট করা
function updateStats() {
  let timeSpent = maxTime - timeLeft;
  timeSpent = timeSpent === 0 ? 1 : timeSpent; // ০ দিয়ে ভাগ এড়ানোর জন্য

  // WPM এবং CPM হিসেব
  let wpm = Math.round(((charIndex - mistakes) / 5) / (timeSpent / 60));
  wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;

  let cpm = Math.round((charIndex - mistakes) * (60 / timeSpent));
  cpm = cpm < 0 || !cpm || cpm === Infinity ? 0 : cpm;

  // নির্ভুলতা (Accuracy %) হিসেব
  let accuracy = charIndex > 0 ? Math.round(((charIndex - mistakes) / charIndex) * 100) : 100;
  accuracy = accuracy < 0 ? 0 : accuracy;

  // DOM-এ মানগুলো বসানো
  if (wpmTag) wpmTag.innerText = wpm;
  if (cpmTag) cpmTag.innerText = cpm;
  if (mistakeTag) mistakeTag.innerText = mistakes;
  if (accuracyTag) accuracyTag.innerText = `${accuracy}%`;
}

// ৫. রিস্টার্ট বা নতুন করে শুরু করা
function resetGame() {
  loadParagraph();
  clearInterval(timer);
  timeLeft = maxTime;
  charIndex = mistakes = 0;
  isTyping = false;
  if (inputField) {
    inputField.value = "";
    inputField.disabled = false;
    inputField.focus();
  }
  if (timerTag) timerTag.innerText = timeLeft;
  if (mistakeTag) mistakeTag.innerText = 0;
  if (wpmTag) wpmTag.innerText = 0;
  if (cpmTag) cpmTag.innerText = 0;
  if (accuracyTag) accuracyTag.innerText = "100%";
}


/* ==========================================================================
   ৪. ইভেন্ট লিসেনারস (Event Listeners)
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  loadParagraph();
  
  if (inputField) {
    inputField.addEventListener("input", initTyping);
  }
  
  if (tryAgainBtn) {
    tryAgainBtn.addEventListener("click", resetGame);
  }

  // ফোকাস ঠিক রাখা
  if (textDisplay) {
    textDisplay.addEventListener("click", () => inputField && inputField.focus());
  }
});
