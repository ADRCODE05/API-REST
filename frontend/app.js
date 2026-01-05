const API_URL = "http://localhost:3001/api"
const API_KEY = "riwi_api_key_2024_change_in_production"

let currentUser = null
let authToken = null

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  checkAuth()
  setupEventListeners()
})

function setupEventListeners() {
  document.getElementById("login-form").addEventListener("submit", handleLogin)
  document.getElementById("register-form").addEventListener("submit", handleRegister)
  document.getElementById("create-vacancy-form").addEventListener("submit", handleCreateVacancy)
}

function checkAuth() {
  const token = localStorage.getItem("token")
  const user = localStorage.getItem("user")

  if (token && user) {
    authToken = token
    currentUser = JSON.parse(user)
    showMainContent()
  }
}

// Auth Functions
function showLogin() {
  document.getElementById("tab-login").classList.add("active")
  document.getElementById("tab-register").classList.remove("active")
  document.getElementById("login-form").style.display = "block"
  document.getElementById("register-form").style.display = "none"
}

function showRegister() {
  document.getElementById("tab-register").classList.add("active")
  document.getElementById("tab-login").classList.remove("active")
  document.getElementById("register-form").style.display = "block"
  document.getElementById("login-form").style.display = "none"
}

function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-password").value

  const loginPromise = fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({ email, password }),
  })

  loginPromise
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => Promise.reject(err))
      }
      return response.json()
    })
    .then((data) => {
      authToken = data.data.token
      currentUser = data.data.user
      localStorage.setItem("token", authToken)
      localStorage.setItem("user", JSON.stringify(currentUser))
      showMainContent()
    })
    .catch((error) => {
      showError("login-error", error.message || "Error al iniciar sesión")
    })
}

function handleRegister(e) {
  e.preventDefault()

  const name = document.getElementById("register-name").value
  const email = document.getElementById("register-email").value
  const password = document.getElementById("register-password").value

  const registerPromise = fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({ name, email, password }),
  })

  registerPromise
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => Promise.reject(err))
      }
      return response.json()
    })
    .then((data) => {
      authToken = data.data.token
      currentUser = data.data.user
      localStorage.setItem("token", authToken)
      localStorage.setItem("user", JSON.stringify(currentUser))
      showMainContent()
    })
    .catch((error) => {
      showError("register-error", error.message || "Error al registrarse")
    })
}

function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  authToken = null
  currentUser = null
  document.getElementById("auth-section").style.display = "block"
  document.getElementById("main-content").style.display = "none"
  document.getElementById("user-info").style.display = "none"
}

// Main Content
function showMainContent() {
  document.getElementById("auth-section").style.display = "none"
  document.getElementById("main-content").style.display = "block"
  document.getElementById("user-info").style.display = "flex"
  document.getElementById("user-name").textContent = currentUser.name
  document.getElementById("user-role").textContent = currentUser.role

  if (currentUser.role === "gestor" || currentUser.role === "administrador") {
    showGestorPanel()
  } else {
    showCoderPanel()
  }
}

// Gestor Panel
function showGestorPanel() {
  document.getElementById("gestor-panel").style.display = "block"
  document.getElementById("coder-panel").style.display = "none"
  loadGestorData()
}

function loadGestorData() {
  const vacanciesPromise = fetch(`${API_URL}/vacancies?includeInactive=true`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      "x-api-key": API_KEY,
    },
  })

  const applicationsPromise = fetch(`${API_URL}/applications`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      "x-api-key": API_KEY,
    },
  })

  Promise.all([vacanciesPromise, applicationsPromise])
    .then(([vacanciesRes, applicationsRes]) => {
      return Promise.all([vacanciesRes.json(), applicationsRes.json()])
    })
    .then(([vacanciesData, applicationsData]) => {
      const vacancies = vacanciesData.data
      const applications = applicationsData.data

      document.getElementById("total-vacancies").textContent = vacancies.filter((v) => v.isActive).length
      document.getElementById("total-applications").textContent = applications.length

      renderVacanciesGestor(vacancies)
    })
    .catch((error) => {
      console.error("Error loading gestor data:", error)
    })
}

function renderVacanciesGestor(vacancies) {
  const container = document.getElementById("vacancies-list-gestor")

  if (vacancies.length === 0) {
    container.innerHTML = '<div class="empty-state"><h3>No hay vacantes creadas</h3></div>'
    return
  }

  container.innerHTML = vacancies
    .map(
      (vacancy) => `
    <div class="vacancy-card">
      <div class="vacancy-header">
        <div>
          <h3>${vacancy.title}</h3>
          <p class="vacancy-company">${vacancy.company}</p>
        </div>
        <div class="vacancy-badges">
          <span class="badge ${vacancy.isActive ? "badge-success" : "badge-secondary"}">
            ${vacancy.isActive ? "Activa" : "Inactiva"}
          </span>
        </div>
      </div>
      
      <div class="vacancy-badges">
        ${vacancy.technologies.map((tech) => `<span class="badge badge-primary">${tech.name}</span>`).join("")}
      </div>
      
      <div class="vacancy-info">
        <p><strong>Seniority:</strong> ${vacancy.seniority}</p>
        <p><strong>Ubicación:</strong> ${vacancy.location} - ${vacancy.modality}</p>
        <p><strong>Salario:</strong> ${vacancy.salaryRange}</p>
      </div>
      
      <div class="vacancy-footer">
        <span class="slots-info">
          ${vacancy.currentApplicants}/${vacancy.maxApplicants} postulaciones
        </span>
        <button class="btn-secondary" onclick="toggleVacancy('${vacancy.id}', ${vacancy.isActive})">
          ${vacancy.isActive ? "Desactivar" : "Activar"}
        </button>
      </div>
    </div>
  `,
    )
    .join("")
}

function showCreateVacancyModal() {
  document.getElementById("create-vacancy-modal").classList.add("show")
}

function closeCreateVacancyModal() {
  document.getElementById("create-vacancy-modal").classList.remove("show")
  document.getElementById("create-vacancy-form").reset()
}

function handleCreateVacancy(e) {
  e.preventDefault()

  const formData = {
    title: document.getElementById("vacancy-title").value,
    description: document.getElementById("vacancy-description").value,
    technologies: document
      .getElementById("vacancy-technologies")
      .value.split(",")
      .map((t) => t.trim()),
    seniority: document.getElementById("vacancy-seniority").value,
    location: document.getElementById("vacancy-location").value,
    modality: document.getElementById("vacancy-modality").value,
    salaryRange: document.getElementById("vacancy-salary").value,
    company: document.getElementById("vacancy-company").value,
    maxApplicants: Number.parseInt(document.getElementById("vacancy-max").value),
  }

  const createPromise = fetch(`${API_URL}/vacancies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(formData),
  })

  createPromise
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => Promise.reject(err))
      }
      return response.json()
    })
    .then(() => {
      closeCreateVacancyModal()
      loadGestorData()
    })
    .catch((error) => {
      showError("create-vacancy-error", error.message || "Error al crear vacante")
    })
}

function toggleVacancy(vacancyId, isActive) {
  const togglePromise = fetch(`${API_URL}/vacancies/${vacancyId}/toggle-active`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "x-api-key": API_KEY,
    },
  })

  togglePromise
    .then((response) => response.json())
    .then(() => {
      loadGestorData()
    })
    .catch((error) => {
      console.error("Error toggling vacancy:", error)
    })
}

// Coder Panel
function showCoderPanel() {
  document.getElementById("coder-panel").style.display = "block"
  document.getElementById("gestor-panel").style.display = "none"
  loadCoderData()
}

function loadCoderData() {
  const vacanciesPromise = fetch(`${API_URL}/vacancies`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      "x-api-key": API_KEY,
    },
  })

  const applicationsPromise = fetch(`${API_URL}/applications/my-applications`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      "x-api-key": API_KEY,
    },
  })

  Promise.all([vacanciesPromise, applicationsPromise])
    .then(([vacanciesRes, applicationsRes]) => {
      return Promise.all([vacanciesRes.json(), applicationsRes.json()])
    })
    .then(([vacanciesData, applicationsData]) => {
      renderVacancies(vacanciesData.data, applicationsData.data)
      renderMyApplications(applicationsData.data)
    })
    .catch((error) => {
      console.error("Error loading coder data:", error)
    })
}

function renderVacancies(vacancies, myApplications) {
  const container = document.getElementById("vacancies-list")
  const appliedVacancyIds = myApplications.map((app) => app.vacancyId)

  if (vacancies.length === 0) {
    container.innerHTML = '<div class="empty-state"><h3>No hay vacantes disponibles</h3></div>'
    return
  }

  container.innerHTML = vacancies
    .map((vacancy) => {
      const hasApplied = appliedVacancyIds.includes(vacancy.id)
      const hasSlots = vacancy.hasAvailableSlots

      return `
      <div class="vacancy-card">
        <div class="vacancy-header">
          <div>
            <h3>${vacancy.title}</h3>
            <p class="vacancy-company">${vacancy.company}</p>
          </div>
        </div>
        
        <div class="vacancy-badges">
          ${vacancy.technologies.map((tech) => `<span class="badge badge-primary">${tech.name}</span>`).join("")}
          <span class="badge badge-secondary">${vacancy.seniority}</span>
        </div>
        
        <div class="vacancy-description">
          <p>${vacancy.description}</p>
        </div>
        
        <div class="vacancy-info">
          <p><strong>Ubicación:</strong> ${vacancy.location} - ${vacancy.modality}</p>
          <p><strong>Salario:</strong> ${vacancy.salaryRange}</p>
        </div>
        
        <div class="vacancy-footer">
          <span class="slots-info ${hasSlots ? "slots-available" : "slots-full"}">
            ${vacancy.availableSlots} cupos disponibles
          </span>
          ${
            hasApplied
              ? '<span class="badge badge-success">Ya postulado</span>'
              : hasSlots
                ? `<button class="btn-success" onclick="applyToVacancy('${vacancy.id}')">Postularme</button>`
                : '<span class="slots-full">Sin cupos</span>'
          }
        </div>
      </div>
    `
    })
    .join("")
}

function renderMyApplications(applications) {
  const container = document.getElementById("my-applications")

  if (applications.length === 0) {
    container.innerHTML = '<div class="empty-state"><h3>No tienes postulaciones aún</h3></div>'
    return
  }

  container.innerHTML = applications
    .map(
      (app) => `
    <div class="vacancy-card">
      <div class="vacancy-header">
        <div>
          <h3>${app.vacancy.title}</h3>
          <p class="vacancy-company">${app.vacancy.company}</p>
        </div>
        <button class="btn-danger" onclick="cancelApplication('${app.id}')">Cancelar</button>
      </div>
      
      <div class="vacancy-badges">
        ${app.vacancy.technologies.map((tech) => `<span class="badge badge-primary">${tech.name}</span>`).join("")}
      </div>
      
      <div class="vacancy-info">
        <p><strong>Postulado el:</strong> ${new Date(app.appliedAt).toLocaleDateString("es-ES")}</p>
        <p><strong>Ubicación:</strong> ${app.vacancy.location}</p>
        <p><strong>Modalidad:</strong> ${app.vacancy.modality}</p>
      </div>
    </div>
  `,
    )
    .join("")
}

function applyToVacancy(vacancyId) {
  const applyPromise = fetch(`${API_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({ vacancyId }),
  })

  applyPromise
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => Promise.reject(err))
      }
      return response.json()
    })
    .then(() => {
      alert("Postulación exitosa!")
      loadCoderData()
    })
    .catch((error) => {
      alert(error.message || "Error al postularse")
    })
}

function cancelApplication(applicationId) {
  if (!confirm("¿Estás seguro de cancelar esta postulación?")) return

  const cancelPromise = fetch(`${API_URL}/applications/${applicationId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "x-api-key": API_KEY,
    },
  })

  cancelPromise
    .then((response) => response.json())
    .then(() => {
      alert("Postulación cancelada")
      loadCoderData()
    })
    .catch((error) => {
      alert(error.message || "Error al cancelar")
    })
}

// Utility Functions
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId)
  errorElement.textContent = message
  errorElement.classList.add("show")
  setTimeout(() => {
    errorElement.classList.remove("show")
  }, 5000)
}
