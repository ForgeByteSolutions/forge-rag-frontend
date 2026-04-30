import axios from "axios";
import { getToken, setToken, getRefreshToken, setRefreshToken, logout as clearAuthTokens } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
});

// Attach JWT automatically to every axios request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — attempt token refresh and redirect to login if it fails
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          // Attempt to refresh token
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/auth/refresh`, {
            refresh_token: refreshToken
          });

          if (res.data?.access_token) {
            setToken(res.data.access_token);
            // Update original request auth header and retry
            originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token failed/expired
          console.error("Session expired. Please log in again.");
        }
      }

      // If we reach here, refresh failed or no refresh token exists
      clearAuthTokens();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export async function register(email, password) {
  const res = await api.post("/auth/register", { email, password });
  if (res.data?.access_token) setToken(res.data.access_token);
  if (res.data?.refresh_token) setRefreshToken(res.data.refresh_token);
  return res.data;
}

export async function login(email, password) {
  const res = await api.post("/auth/login", { email, password });
  if (res.data?.access_token) setToken(res.data.access_token);
  if (res.data?.refresh_token) setRefreshToken(res.data.refresh_token);
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

export async function uploadDocument(file, ocrEngine = "tesseract") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("workspace_id", "none");
  formData.append("ocr_engine", ocrEngine);
  const res = await api.post("/documents/upload", formData);
  return res.data;
}

export async function getDocumentStatus(doc_id) {
  const res = await api.get(`/documents/status/${doc_id}`);
  return res.data;
}


export async function deleteDocument(doc_id) {
  const res = await api.delete(`/documents/${doc_id}`);
  return res.data;
}

// ─── Workspace APIs ───────────────────────────────────────────────────────────

export async function createWorkspace(name) {
  const res = await api.post("/workspace", { name });
  return res.data;
}

export async function deleteWorkspace(workspaceId) {
  const res = await api.delete(`/workspace/${workspaceId}`);
  return res.data;
}

export async function getWorkspaces() {
  const res = await api.get("/workspace/list");
  const data = res.data;
  // Always return a plain array so callers can .map() / .find() directly
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.workspaces)) return data.workspaces;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

// Upload a document into a specific workspace
export async function uploadDocumentToWorkspace(file, workspaceId, ocrEngine = "tesseract") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("workspace_id", workspaceId);
  formData.append("ocr_engine", ocrEngine);
  const res = await api.post("/documents/upload", formData);
  return res.data;
}

export async function getWorkspaceDocuments(workspaceId) {
  const res = await api.get(`/documents/list/workspace/${workspaceId}`);
  const data = res.data;
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

export async function getAllRisks() {
  const res = await api.get("/all-risks");
  return res.data;
}

// ─── Evaluation APIs ──────────────────────────────────────────────────────────

export async function submitChatFeedback(messageId, feedbackText, text = null) {
  const res = await api.post(`/chat/${messageId}/feedback`, { feedback: feedbackText, text });
  return res.data;
}

export async function runManualEvaluation(messageId) {
  const res = await api.post("/eval/run", { message_id: messageId });
  return res.data;
}

export async function getEvaluationMetrics({ doc_id = null, workspace_id = null } = {}) {
  let query = "";
  if (doc_id) query = `?doc_id=${doc_id}`;
  else if (workspace_id) query = `?workspace_id=${workspace_id}`;
  const res = await api.get(`/eval/metrics${query}`);
  return res.data;
}

export async function generateSyntheticData(docId, numQuestions = 5) {
  const res = await api.post("/eval/synthetic-data", { doc_id: docId, num_questions: numQuestions });
  return res.data;
}

// ─── Streaming Chat (SSE) ─────────────────────────────────────────────────────

export async function streamChat({
  question,
  doc_id = null,
  workspace_id = null,
  doc_ids = null,
  model = "gpt-4o-mini",
  onToken,
  onCitations,
  onEnd,
  signal,
}) {
  let response;
  try {
    response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ question, doc_id, workspace_id, doc_ids, model }),
        signal,
      });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error("Network error. Please check your internet connection and try again.");
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => "Unknown error");
    throw new Error(`Chat failed (${response.status}): ${errText}`);
  }

  if (!response.body) {
    throw new Error("No SSE stream in response");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE events are delimited by double newlines
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? ""; // keep any incomplete trailing event

    for (const event of events) {
      // Each event may contain multiple lines; grab the data: line
      const dataLine = event
        .split("\n")
        .find((l) => l.startsWith("data:"));

      if (!dataLine) continue;

      const raw = dataLine.slice(5).trim(); // strip "data:" prefix
      if (!raw || raw === "[DONE]") continue;

      let payload;
      try {
        payload = JSON.parse(raw);
      } catch {
        console.warn("[SSE] Failed to parse:", raw);
        continue;
      }

      switch (payload.type) {
        case "token":
          if (onToken && payload.content != null) onToken(payload.content);
          break;
        case "citations":
          if (onCitations && Array.isArray(payload.content))
            onCitations(payload.content);
          break;
        case "end":
          if (onEnd) onEnd(payload);
          break;
        default:
          break;
      }
    }
  }

  // Flush any remaining buffered event (edge case when stream ends without trailing \n\n)
  if (buffer.trim()) {
    const dataLine = buffer.split("\n").find((l) => l.startsWith("data:"));
    if (dataLine) {
      const raw = dataLine.slice(5).trim();
      try {
        const payload = JSON.parse(raw);
        if (payload.type === "citations" && onCitations)
          onCitations(payload.content ?? []);
        if (payload.type === "end" && onEnd) onEnd(payload);
      } catch (_) { }
    }
  }
}

/**
 * Submit a downloaded testset.json to be evaluated by the RAG chain + Ragas.
 * Returns 202 immediately; evaluation runs in the background.
 * Poll getEvaluationMetrics() to see results as they arrive.
 *
 * @param {object} params
 * @param {string|null} params.doc_id
 * @param {string|null} params.workspace_id
 * @param {Array}  params.rows  — the "data" array from testset.json
 */
export async function runTestsetEvaluation({ doc_id, workspace_id, rows }) {
  const res = await api.post("/eval/run-testset", {
    doc_id: doc_id || null,
    workspace_id: workspace_id || null,
    rows,
  });
  return res.data;  // { status: "accepted", total: N, message: "..." }
}
