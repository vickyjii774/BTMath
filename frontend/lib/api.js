const API_URL = "http://127.0.0.1:8000/api";

export async function getCategories() {
  const response = await fetch(`${API_URL}/categories/`);

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}

export async function getPrograms() {
  const response = await fetch(`${API_URL}/programs/`);

  if (!response.ok) {
    throw new Error("Failed to fetch programs");
  }

  return response.json();
}

export async function getBachelorPrograms() {
  const response = await fetch(`${API_URL}/bachelor/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch bachelor programs");
  }

  return response.json();
}



export async function getPlusTwoPrograms() {
  const response = await fetch(`${API_URL}/plus-two/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch +2 programs");
  }

  return response.json();
}

export async function getMasterPrograms() {
  const response = await fetch(`${API_URL}/master/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch master programs");
  }

  return response.json();
}

export async function getIOEPrograms() {
  const response = await fetch(`${API_URL}/ioe/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch IOE programs");
  }

  return response.json();
}

