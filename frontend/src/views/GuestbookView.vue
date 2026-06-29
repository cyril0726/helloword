<template>
  <div class="container">
    <h1>💬 Livre d’or</h1>

    <div class="form">
      <input
        v-model="text"
        placeholder="Écris un message..."
      />
      <button @click="sendMessage">Envoyer</button>
      <button @click="clearMessages" class="danger">🗑 Vider les messages</button>
    </div>

    <hr />

    <div v-if="messages.length === 0">
      Aucun message pour le moment...
    </div>

    <div v-for="m in messages" :key="m.id" class="message">
      <strong>#{{ m.id }}</strong> — {{ m.text }}
      <small>{{ m.created_at }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

type Message = {
  id: number;
  text: string;
  created_at: string;
};

const messages = ref<Message[]>([]);
const API =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8787";
const text = ref("");

async function loadMessages() {
  const res = await fetch(`${API}/api/messages`);
  messages.value = await res.json();
}

async function sendMessage() {
  if (!text.value) return;

  await fetch(`${API}/api/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: text.value })
  });

  text.value = "";
  await loadMessages();
}

async function clearMessages() {
  const ok = confirm("Supprimer tous les messages ?");
  if (!ok) return;

  await fetch(`${API}/api/messages`, {
    method: "DELETE"
  });

  await loadMessages();
}

onMounted(loadMessages);
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 40px auto;
  font-family: sans-serif;
}

.form {
  display: flex;
  gap: 10px;
}

input {
  flex: 1;
  padding: 8px;
}

button {
  padding: 8px 12px;
}

.message {
  padding: 8px 0;
}

.danger {
  margin-top: 10px;
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
}
</style>