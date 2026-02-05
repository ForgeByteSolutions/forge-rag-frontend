import axios from "axios";
import { getToken } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
});

// Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export async function register(email, password) {
  const res = await api.post("/auth/register", {
    email,
    password,
  });
  return res.data;
}

export async function login(email, password) {
  const res = await api.post("/auth/login", {
    email,
    password,
  });
  return res.data;
}

export async function getDocuments() {
  const res = await api.get("/documents/list");
  return res.data;
}

export async function getChatHistory(doc_id = null) {
  const res = await api.get(`/chat/history${doc_id ? `?doc_id=${doc_id}` : ""}`);
  return res.data;
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/documents/upload", formData, {
    headers: {
      // 🚨 LET AXIOS SET BOUNDARY AUTOMATICALLY
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}


export async function streamChat({
  question,
  doc_id = null,
  onToken,
  onCitations,
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ question, doc_id }),
    }
  );

  if (!response.ok || !response.body) {
    throw new Error("Chat streaming failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const chunks = buffer.split("\n\n");
    buffer = chunks.pop(); // incomplete chunk

    for (const chunk of chunks) {
      if (!chunk.startsWith("data:")) continue;

      const payload = JSON.parse(
        chunk.replace("data: ", "")
      );

      if (payload.type === "token") {
        onToken(payload.content);
      }

      if (payload.type === "citations") {
        onCitations(payload.content);
      }
    }
  }
}
