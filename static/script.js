const form = document.getElementById("chat-form");
const chatbox = document.getElementById("chatbox");
const input = document.getElementById("message");

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
  appendMessage(bot.charAt(0).toUpperCase() + bot.slice(1), data.reply, "bot");
  input.value = "";
  chatbox.scrollTop = chatbox.scrollHeight;
});

function appendMessage(sender, message, cls) {
  const div = document.createElement("div");
  div.classList.add("message", cls);
  div.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatbox.appendChild(div);
}
