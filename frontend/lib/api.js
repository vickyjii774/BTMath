const API_URL = "http://127.0.0.1:8000/api";

async function fetchAPI(endpoint) {
  const response = await fetch(`${API_URL}/${endpoint}/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }

  return response.json();
}


// Categories
export async function getCategories() {
  return fetchAPI("categories");
}


// Programs
export async function getPrograms() {
  return fetchAPI("programs");
}


// Courses
export async function getCourses() {
  return fetchAPI("courses");
}


// Semesters
export async function getSemesters() {
  return fetchAPI("semesters");
}


// Chapters
export async function getChapters() {
  return fetchAPI("chapters");
}


// Materials
export async function getMaterials() {
  return fetchAPI("materials");
}


// Single Program
export async function getProgram(id) {
  const response = await fetch(`${API_URL}/programs/${id}/`);

  if (!response.ok) {
    throw new Error("Program not found");
  }

  return response.json();
}


// Single Course
export async function getCourse(id) {
  const response = await fetch(`${API_URL}/courses/${id}/`);

  if (!response.ok) {
    throw new Error("Course not found");
  }

  return response.json();
}


// Single Semester
export async function getSemester(id) {
  const response = await fetch(`${API_URL}/semesters/${id}/`);

  if (!response.ok) {
    throw new Error("Semester not found");
  }

  return response.json();
}


// Single Chapter
export async function getChapter(id) {
  const response = await fetch(`${API_URL}/chapters/${id}/`);

  if (!response.ok) {
    throw new Error("Chapter not found");
  }

  return response.json();
}
