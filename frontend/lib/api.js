
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
}

function getAuthHeaders(isJson = true) {
  const headers = {};
  if (isJson) {
    headers["Content-Type"] = "application/json";
  }
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// 1. Categories & Programs
export async function getCategories() {
  const res = await fetch(`${API_URL}/categories/`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getBachelorPrograms() {
  const res = await fetch(`${API_URL}/bachelor/`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getPlusTwoPrograms() {
  const res = await fetch(`${API_URL}/plus-two/`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getMasterPrograms() {
  const res = await fetch(`${API_URL}/master/`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getIOEPrograms() {
  const res = await fetch(`${API_URL}/ioe/`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getProgramDetail(slugOrId) {
  const res = await fetch(`${API_URL}/programs/${slugOrId}/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load program");
  return res.json();
}

// 2. Courses
export async function getCourses(params = {}) {
  const query = new URLSearchParams();
  if (params.level) query.append("level", params.level);
  if (params.program) query.append("program", params.program);
  if (params.search) query.append("search", params.search);

  const res = await fetch(`${API_URL}/courses/?${query.toString()}`, {
    cache: "no-store",
    headers: getAuthHeaders(false),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getCourseDetail(slug) {
  const res = await fetch(`${API_URL}/courses/${slug}/`, {
    cache: "no-store",
    headers: getAuthHeaders(false),
  });
  if (!res.ok) throw new Error("Course not found");
  return res.json();
}

export async function toggleMaterialProgress(materialId) {
  const res = await fetch(`${API_URL}/progress/toggle/${materialId}/`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to update progress");
  return res.json();
}

// 3. Authentication
export async function registerUser(arg1, maybeEmail, maybePassword) {
  let body;
  if (typeof arg1 === "object" && arg1 !== null) {
    body = arg1;
  } else {
    body = {
      username: arg1,
      email: maybeEmail,
      password: maybePassword,
      confirm_password: maybePassword,
    };
  }
  const res = await fetch(`${API_URL}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data;
}



export async function getMe() {
  const res = await fetch(`${API_URL}/auth/me/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export async function updateProfile(formData) {
  const res = await fetch(`${API_URL}/auth/profile/`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

// 4. Student Dashboard
export async function getStudentDashboard() {
  const res = await fetch(`${API_URL}/dashboard/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load dashboard data");
  return res.json();
}

// 5. Payments
export async function submitPayment(formData) {
  const res = await fetch(`${API_URL}/payments/submit/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Payment submission failed");
  return data;
}

export async function getUserPayments() {
  const res = await fetch(`${API_URL}/payments/history/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
}

// 6. Question Bank & MCQs
export async function getQuestionBank(params = {}) {
  const query = new URLSearchParams();
  if (params.difficulty) query.append("difficulty", params.difficulty);
  if (params.program) query.append("program", params.program);
  if (params.search) query.append("search", params.search);

  const res = await fetch(`${API_URL}/questions/?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getMCQs(params = {}) {
  const query = new URLSearchParams();
  if (params.topic) query.append("topic", params.topic);
  if (params.difficulty) query.append("difficulty", params.difficulty);
  if (params.program) query.append("program", params.program);

  const res = await fetch(`${API_URL}/mcqs/?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

// 7. Mock Tests
export async function getMockTests() {
  const res = await fetch(`${API_URL}/mock-tests/`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getMockTestDetail(slugOrId) {
  const res = await fetch(`${API_URL}/mock-tests/${slugOrId}/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Mock test not found");
  return res.json();
}

export async function submitMockTest(slugOrId, answers, timeTakenSeconds) {
  const res = await fetch(`${API_URL}/mock-tests/${slugOrId}/submit/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ answers, time_taken_seconds: timeTakenSeconds }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to submit test");
  return data;
}

// 8. Past Questions & Formulas
export async function getPastQuestions(params = {}) {
  const query = new URLSearchParams();
  if (params.year) query.append("year", params.year);
  if (params.program) query.append("program", params.program);
  if (params.solved !== undefined) query.append("solved", params.solved);

  const res = await fetch(`${API_URL}/past-questions/?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getFormulas(params = {}) {
  const query = new URLSearchParams();
  if (params.level) query.append("level", params.level);
  if (params.topic) query.append("topic", params.topic);

  const res = await fetch(`${API_URL}/formulas/?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

// 9. Real Database Counters
export async function getCounters() {
  const res = await fetch(`${API_URL}/statistics/counters/`, { cache: "no-store" });
  if (!res.ok) {
    return {
      total_students: 0,
      total_courses: 0,
      total_purchases: 0,
      total_questions: 0,
      total_mcqs: 0,
    };
  }
  return res.json();
}


export async function loginUser(username, password) {
  const res = await fetch(`${API_URL}/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error ||
      data.detail ||
      "Login failed"
    );
  }

  return data;
}