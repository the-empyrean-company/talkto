// === Swiper logic (homepage) ===
if (document.querySelector(".swiper")) {
  const swiper = new Swiper(".swiper", {
    slidesPerView: "auto",
    centeredSlides: true,
    spaceBetween: 20,
    grabCursor: true,
    loop: false,
    on: {
      slideChangeTransitionEnd: updateActiveSlideClasses,
      init: updateActiveSlideClasses,
    },
  });

  function updateActiveSlideClasses() {
    const slides = document.querySelectorAll(".swiper-slide");
    slides.forEach((slide) => {
      slide.classList.remove("active-slide");
    });
    const active = document.querySelector(".swiper-slide-active");
    if (active) {
      active.classList.add("active-slide");
    }
  }
}

// === Run DOM-related code after page is ready ===
document.addEventListener("DOMContentLoaded", () => {
  // === Card click → Go to /chat?bot=... ===
  const slides = document.querySelectorAll('.swiper-slide');
  slides.forEach((slide) => {
    slide.addEventListener('click', () => {
      const bot = slide.getAttribute('data-bot');
      if (bot) {
        window.location.href = `/chat?bot=${bot}`;
      }
    });
  });

    // === Chat logic ===
  const form    = document.getElementById("chat-form");
  const chatbox = document.getElementById("chatbox");
  const input   = document.getElementById("message");

  if (form && chatbox && input) {
    // these globals must be set in your chat.html before loading script.js:
    //   <script>
    //     window.USER_ID     = "{{ user_id }}";
    //     window.CURRENT_BOT = "{{ bot }}";
    //   </script>
    const userId = window.USER_ID;
    const bot    = window.CURRENT_BOT ||
                   new URLSearchParams(window.location.search).get("bot") ||
                   "socratic";

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const userMessage = input.value.trim();
      if (!userMessage) return;

      appendMessage("You", userMessage, "user");

      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          bot:      bot,
          message:  userMessage
        })
      });
      const data = await res.json();

      if (data.stop) {
        // token cap hit → kick off Stripe
        const goPay = confirm(data.message + "\nPress OK to donate now.");
        if (goPay) window.location.href = data.checkout_url;
        return;
      }

      // show AI reply and update token badge
      appendMessage(capitalize(bot), data.reply, "bot");
      updateTokenCounter(data.tokens_used);

      input.value = "";
      chatbox.scrollTop = chatbox.scrollHeight;
    });

    function appendMessage(sender, message, cls) {
      const div = document.createElement("div");
      div.classList.add("message", cls);
      div.innerHTML = `<strong>${sender}:</strong> ${message}`;
      chatbox.appendChild(div);
    }

    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function updateTokenCounter(count) {
      let badge = document.getElementById("token-count");
      if (!badge) {
        badge = document.createElement("div");
        badge.id = "token-count";
        badge.className = "token-badge";
        // insert it above the chatbox
        chatbox.parentNode.insertBefore(badge, chatbox);
      }
      badge.innerText = `Tokens used: ${count}`;
    }

    input.focus();
  }

  // === Context panel toggle on mobile ===
  const toggleBtn = document.getElementById("toggle-context");
  const contextPanel = document.querySelector(".chat-right");

  if (toggleBtn && contextPanel) {
    toggleBtn.addEventListener("click", () => {
      contextPanel.classList.toggle("collapsed");
    });
  }
});

