from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)

BOT_PROMPTS = {
    "socrates": "You are Socrates, the ancient philosopher. Respond only by asking thoughtful, probing questions that challenge the user to think more deeply.",
    "freud": "You are Sigmund Freud. Respond by analyzing the user's input through the lens of psychoanalysis, referencing dreams, the unconscious, and childhood experiences."
}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat/<bot>")
def chat_page(bot):
    return render_template("chat.html", bot=bot)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_input = data.get("message")
    bot = data.get("bot")

    system_prompt = BOT_PROMPTS.get(bot, "You are a helpful assistant.")

    completion = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ]
    )

    reply = completion.choices[0].message.content.strip()
    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000, debug=True)
