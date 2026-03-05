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
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.documents)) return data.documents;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function getUsage() {
  const res = await api.get("/usage/");
  return res.data;
}

export async function getChatHistory(doc_id = null, workspace_id = null) {
  let query = "";
  if (doc_id) query = `?doc_id=${doc_id}`;
  else if (workspace_id) query = `?workspace_id=${workspace_id}`;
  const res = await api.get(`/chat/history${query}`);
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

// ─── Workspace APIs ───

export async function createWorkspace(name) {
  const res = await api.post(`/workspace?name=${encodeURIComponent(name)}`);
  return res.data;
}

export async function getWorkspaces() {
  const res = await api.get("/workspace/list");
  const data = res.data;
  // Always return a plain array so callers can .map() directly
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.workspaces)) return data.workspaces;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

// arg order: (file, workspaceId) — matches WorkspacePage call site
export async function uploadDocumentToWorkspace(file, workspaceId) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("workspace_id", workspaceId);

  const res = await api.post("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getWorkspaceDocuments(workspaceId) {
  const res = await api.get(`/documents/list/workspace/${workspaceId}`);
  const data = res.data;
  // Handle whatever shape the backend returns:
  // plain array, { documents: [] }, { items: [] }, { data: [] }, etc.
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.documents)) return data.documents;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function analyzeRisk({ doc_id = null, workspace_id = null }) {
  const res = await api.post("/risk-score", { doc_id, workspace_id });
  return res.data;
}


export async function streamChat({
  question,
  doc_id = null,
  workspace_id = null,
  doc_ids = null,
  model = "gpt-4o-mini",
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
      body: JSON.stringify({ question, doc_id, workspace_id, doc_ids, model }),
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
