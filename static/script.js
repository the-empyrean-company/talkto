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
  const form = document.getElementById("chat-form");
  const chatbox = document.getElementById("chatbox");
  const input = document.getElementById("message");

  if (form && chatbox && input) {
    const bot = new URLSearchParams(window.location.search).get("bot") || "socratic";

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const userMessage = input.value.trim();
      if (!userMessage) return;

      appendMessage("You", userMessage, "user");

      const res = await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userMessage, bot })
      });

      const data = await res.json();
      appendMessage(capitalize(bot), data.reply, "bot");
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

