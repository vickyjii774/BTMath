// ============================================================
// BTMath API Helper
// File: frontend/lib/api.js
// ============================================================
//
// PURPOSE:
// This file is responsible for communicating between the
// Next.js frontend and the Django backend.
//
// Frontend:
//   http://localhost:3000
//
// Django Backend:
//   http://127.0.0.1:8000
//
// Django API:
//   http://127.0.0.1:8000/api
// ============================================================


// ============================================================
// 1. BACKEND API BASE URL
// ============================================================

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/$/, "");


// ============================================================
// 2. GET ACCESS TOKEN
// ============================================================

function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }

  return null;
}


// ============================================================
// 3. CREATE AUTH HEADERS
// ============================================================
//
// includeAuth = true
//   → Send JWT token.
//
// includeAuth = false
//   → Do NOT send JWT.
//
// Login/register/refresh requests use includeAuth = false
// so an expired access token cannot break authentication.
// ============================================================

function getAuthHeaders(isJson = true, includeAuth = true) {
  const headers = {};

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  if (includeAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}


// ============================================================
// 4. MAIN API FETCH FUNCTION
// ============================================================

export async function apiFetch(endpoint, options = {}) {

  // ----------------------------------------------------------
  // Build clean endpoint
  // ----------------------------------------------------------

  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;


  // ----------------------------------------------------------
  // Build complete URL
  // ----------------------------------------------------------

  const url =
    endpoint.startsWith("http://") ||
    endpoint.startsWith("https://")
      ? endpoint
      : `${API_URL}${cleanEndpoint}`;


  // ----------------------------------------------------------
  // Authentication endpoints
  // ----------------------------------------------------------
  //
  // IMPORTANT:
  // Never send an old/expired access token to these endpoints.
  //
  // Otherwise Django REST Framework may reject the request
  // before LoginAPIView gets a chance to check username/password.
  // ----------------------------------------------------------

  const isAuthEndpoint =
    cleanEndpoint === "/auth/login/" ||
    cleanEndpoint === "/auth/register/" ||
    cleanEndpoint === "/auth/refresh/";


  // ----------------------------------------------------------
  // Create headers
  // ----------------------------------------------------------

  const authHeaders = getAuthHeaders(
    true,
    !isAuthEndpoint
  );


  // ----------------------------------------------------------
  // Debug request
  // ----------------------------------------------------------

  console.log("=================================");
  console.log("BTMath API REQUEST:", url);
  console.log("AUTH ENDPOINT:", isAuthEndpoint);
  console.log("=================================");


  try {

    // --------------------------------------------------------
    // Send request
    // --------------------------------------------------------

    const response = await fetch(url, {
      ...options,

      headers: {
        ...authHeaders,
        ...(options.headers || {}),
      },

      // Prevent Next.js from caching API data.
      cache: "no-store",
    });


    // --------------------------------------------------------
    // Read response
    // --------------------------------------------------------

    const text = await response.text();


    console.log("BTMath API RESPONSE");
    console.log("URL:", url);
    console.log("STATUS:", response.status);
    console.log("STATUS TEXT:", response.statusText);
    console.log("OK:", response.ok);
    console.log("BODY:", text);


    // --------------------------------------------------------
    // Handle API errors
    // --------------------------------------------------------

    if (!response.ok) {

      console.error("=================================");
      console.error("BTMath API ERROR");
      console.error("URL:", url);
      console.error("STATUS:", response.status);
      console.error("STATUS TEXT:", response.statusText);
      console.error("BODY:", text);
      console.error("=================================");


      throw new Error(
        `BTMath API ${response.status} ${response.statusText}${
          text ? ` - ${text}` : ""
        }`
      );
    }


    // --------------------------------------------------------
    // Empty response
    // --------------------------------------------------------

    if (!text) {
      return null;
    }


    // --------------------------------------------------------
    // Convert JSON response
    // --------------------------------------------------------

    try {
      return JSON.parse(text);
    } catch {
      // If Django returned plain text
      return text;
    }

  } catch (error) {

    console.error("=================================");
    console.error("BTMath FETCH FAILED");
    console.error("URL:", url);
    console.error("ERROR MESSAGE:", error?.message);
    console.error("ERROR NAME:", error?.name);
    console.error("ERROR STACK:", error?.stack);
    console.error("=================================");

    throw error;
  }
}


// ============================================================
// 5. CATEGORIES
// ============================================================

export async function getCategories() {
  return apiFetch("/categories/");
}


// ============================================================
// 6. ALL COURSES
// ============================================================

export async function getCourses(params = {}) {

  const query = new URLSearchParams();

  if (params.level) {
    query.append("level", params.level);
  }

  if (params.program) {
    query.append("program", params.program);
  }

  if (params.category) {
    query.append("category", params.category);
  }

  if (params.search) {
    query.append("search", params.search);
  }

  const queryString = query.toString();

  const endpoint = queryString
    ? `/courses/?${queryString}`
    : "/courses/";

  return apiFetch(endpoint);
}


// ============================================================
// 7. BACHELOR COURSES
// ============================================================

export async function getBachelorCourses() {
  return apiFetch("/courses/?level=bachelor");
}


// ============================================================
// 8. BACHELOR PROGRAMS
// ============================================================

export async function getBachelorPrograms() {
  return apiFetch("/bachelor/");
}


// ============================================================
// 9. PLUS TWO COURSES
// ============================================================

export async function getPlusTwoCourses() {
  return apiFetch("/courses/?level=plus2");
}


// ============================================================
// 10. MASTER COURSES
// ============================================================

export async function getMasterCourses() {
  return apiFetch("/courses/?level=master");
}


// ============================================================
// 11. IOE COURSES
// ============================================================

export async function getIOECourses() {
  return apiFetch("/courses/?level=ioe");
}


// ============================================================
// 12. SINGLE COURSE
// ============================================================

export async function getCourse(courseId) {
  return apiFetch(`/courses/${courseId}/`);
}


// ============================================================
// 13. LOGIN
// ============================================================

export async function loginUser(username, password) {

  return apiFetch("/auth/login/", {
    method: "POST",

    body: JSON.stringify({
      username,
      password,
    }),
  });
}


// ============================================================
// 14. REGISTER
// ============================================================

export async function registerUser(userData) {

  return apiFetch("/auth/register/", {
    method: "POST",

    body: JSON.stringify(userData),
  });
}


// ============================================================
// 15. GET CURRENT USER
// ============================================================

export async function getCurrentUser(token) {

  return apiFetch("/auth/me/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}


// ============================================================
// 16. PURCHASE / PAYMENT
// ============================================================
//
// Current Django payment endpoint:
// POST /api/payments/submit/
//
// The JWT is automatically added by apiFetch().
// ============================================================

export async function createPayment(paymentData, token) {

  const headers = {};

  // If a token was explicitly supplied, use it.
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return apiFetch("/payments/submit/", {
    method: "POST",

    headers,

    body: JSON.stringify(paymentData),
  });
}


// ============================================================
// 17. PAYMENT HISTORY
// ============================================================

export async function getPaymentHistory(token) {

  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return apiFetch("/payments/history/", {
    headers,
  });
}


// ============================================================
// 18. ADMIN RESOURCE - GET
// ============================================================

export async function getAdminResource(resource, token) {

  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return apiFetch(`/admin/${resource}/`, {
    headers,
  });
}


// ============================================================
// 19. ADMIN RESOURCE - CREATE
// ============================================================

export async function createAdminResource(
  resource,
  data,
  token
) {

  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return apiFetch(`/admin/${resource}/`, {
    method: "POST",

    headers,

    body: JSON.stringify(data),
  });
}


// ============================================================
// 20. ADMIN RESOURCE - UPDATE
// ============================================================

export async function updateAdminResource(
  resource,
  id,
  data,
  token
) {

  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return apiFetch(`/admin/${resource}/${id}/`, {
    method: "PUT",

    headers,

    body: JSON.stringify(data),
  });
}


// ============================================================
// 21. ADMIN RESOURCE - DELETE
// ============================================================

export async function deleteAdminResource(
  resource,
  id,
  token
) {

  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return apiFetch(`/admin/${resource}/${id}/`, {
    method: "DELETE",

    headers,
  });
}


// ============================================================
// 22. SITE COUNTERS
// ============================================================

export async function getCounters() {
  return apiFetch("/statistics/counters/");
}


// ============================================================
// 23. RECORD SITE VISIT
// ============================================================

export async function recordSiteVisit() {

  return apiFetch("/statistics/record-visit/", {
    method: "POST",
  });
}


// ============================================================
// 24. SOCIAL LINKS
// ============================================================

export async function getSocialLinks() {
  return apiFetch("/social-links/");
}


// ============================================================
// 25. STUDENT DASHBOARD
// ============================================================

export async function getStudentDashboard() {
  return apiFetch("/dashboard/");
}


// ============================================================
// 26. MY ACCESS GROUPS
// ============================================================
//
// This is used for the rule:
//
// Buying ONE course in a section unlocks the entire section.
//
// Example:
//
// Buy one +2 course
//      ↓
// Unlock all +2 courses
//
// Buy one Bachelor course
//      ↓
// Unlock all Bachelor courses
// ============================================================

export async function getMyAccessGroups() {
  return apiFetch("/my-access-groups/");
}


// ============================================================
// 27. MY PURCHASES
// ============================================================

export async function getMyPurchases() {
  return apiFetch("/my-purchases/");
}


// ============================================================
// 28. TOGGLE COURSE MATERIAL PROGRESS
// ============================================================

export async function toggleMaterialProgress(materialId) {

  return apiFetch(
    `/progress/toggle/${materialId}/`,
    {
      method: "POST",
    }
  );
}


// ============================================================
// 29. REFRESH ACCESS TOKEN
// ============================================================

// /auth/refresh/.


export async function refreshAccessToken(refreshToken) {

  return apiFetch("/auth/refresh/", {
    method: "POST",

    body: JSON.stringify({
      refresh: refreshToken,
    }),
  });
}

// ============================================================
// 30. CONTACT MESSAGE
// ============================================================

export async function submitContactMessage(formData) {
  return apiFetch("/contact/", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}


// ============================================================
// 31. ADMIN STUDENT DETAIL
// ============================================================

export async function getAdminStudentDetail(userId) {
  return apiFetch(`/admin/users/${userId}/`);
}


// ============================================================
// 32. ADMIN TOGGLE DISABLE USER
// ============================================================

export async function toggleDisableUser(userId) {
  return apiFetch(`/admin/users/${userId}/toggle-disable/`, {
    method: "POST",
  });
}



// 33. ADMIN RESET USER PASSWORD
// ============================================================

export async function resetUserPassword(userId, data = {}) {
  return apiFetch(`/admin/users/${userId}/reset-password/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}


// ============================================================
// 34. ADMIN MANAGE USER ACCESS
// ============================================================

export async function manageUserAccess(userId, data = {}) {
  return apiFetch(`/admin/users/${userId}/access/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============================================================
// 35. ADMIN APPROVE PAYMENT
// ============================================================

export async function approvePayment(paymentId, data = {}) {
  return apiFetch(`/admin/payments/${paymentId}/approve/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}


// ============================================================
// 36. ADMIN REJECT PAYMENT
// ============================================================

// ============================================================
// ADMIN REJECT PAYMENT
// ============================================================

export async function rejectPayment(paymentId, reason = "") {
  return apiFetch(`/admin/payments/${paymentId}/reject/`, {
    method: "POST",

    body: JSON.stringify({
      rejection_reason: reason,
    }),
  });
}