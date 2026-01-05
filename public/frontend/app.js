const API_URL = "http://localhost:3001/api"
const API_KEY = "my_development_api_key"

let currentUser = null
let authToken = null

// Initialization
// I wait for the DOM to be fully loaded before starting the app.
document.addEventListener("DOMContentLoaded", () => {
  checkAuth()
  setupEventListeners()
})

function setupEventListeners() {
  // I attach event listeners to my forms.
  document.getElementById("login-form").addEventListener("submit", handleLogin)
  document.getElementById("register-form").addEventListener("submit", handleRegister)
  document.getElementById("create-vacancy-form").addEventListener("submit", handleVacancySubmit)
}

function checkAuth() {
  // I check if I have a session stored in localStorage.
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
  // UI helper to switch between login and register tabs.
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

  // I use the standard fetch API with promises to authenticate users.
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
      // I save the token and user data for future requests.
      authToken = data.data.token
      currentUser = data.data.user
      localStorage.setItem("token", authToken)
      localStorage.setItem("user", JSON.stringify(currentUser))
      showMainContent()
    })
    .catch((error) => {
      showError("login-error", error.message || "Error logging in")
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
      showError("register-error", error.message || "Error registering")
    })
}

function logout() {
  // I clear the session data and return to the auth screen.
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
  // I display the appropriate panel based on the user's role.
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
  // I fetch both vacancies and applications simultaneously using Promise.all.
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
      const vacancies = vacanciesData?.data || []
      const applications = applicationsData?.data || []

      const totalVacanciesElement = document.getElementById("total-vacancies")
      if (totalVacanciesElement) {
        totalVacanciesElement.textContent = Array.isArray(vacancies) ? vacancies.filter((v) => v.isActive).length : 0
      }

      const totalApplicationsElement = document.getElementById("total-applications")
      if (totalApplicationsElement) {
        totalApplicationsElement.textContent = Array.isArray(applications) ? applications.length : 0
      }

      renderVacanciesGestor(vacancies)
    })
    .catch((error) => {
      console.error("Error loading gestor data:", error)
    })
}

function renderVacanciesGestor(vacancies) {
  const container = document.getElementById("vacancies-list-gestor")

  if (!Array.isArray(vacancies) || vacancies.length === 0) {
    container.innerHTML = '<div class="empty-state"><h3>No vacancies created yet</h3></div>'
    return
  }

  // I dynamically generate the HTML for each vacancy card.
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
            ${vacancy.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      
      <div class="vacancy-badges">
        ${vacancy.technologies.map((tech) => `<span class="badge badge-primary">${tech.name}</span>`).join("")}
      </div>
      
      <div class="vacancy-info">
        <p><strong>Seniority:</strong> ${vacancy.seniority}</p>
        <p><strong>Location:</strong> ${vacancy.location} - ${vacancy.modality}</p>
        <p><strong>Salary:</strong> ${vacancy.salaryRange}</p>
      </div>
      
        <div class="vacancy-footer">
          <span class="slots-info">
            ${vacancy.currentApplicants}/${vacancy.maxApplicants} applications
          </span>
          <div class="footer-actions" style="display: flex; gap: 8px;">
            <button class="btn-info" onclick="viewApplicants('${vacancy.id}', '${vacancy.title}')" style="background: var(--primary-color); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px;">
              View Applicants
            </button>
            <button class="btn-warning" onclick="editVacancy('${vacancy.id}')" style="background: #f59e0b; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px;">
              Edit
            </button>
            <button class="btn-secondary" onclick="toggleVacancy('${vacancy.id}', ${vacancy.isActive})">
              ${vacancy.isActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>
      </div>
    `,
    )
    .join("")
}

function showCreateVacancyModal() {
  document.getElementById("vacancy-modal-title").textContent = "Create New Vacancy"
  const form = document.getElementById("create-vacancy-form")
  form.dataset.mode = "create"
  delete form.dataset.id
  document.getElementById("create-vacancy-modal").classList.add("show")
}

function closeCreateVacancyModal() {
  document.getElementById("create-vacancy-modal").classList.remove("show")
  document.getElementById("create-vacancy-form").reset()
}

function handleVacancySubmit(e) {
  e.preventDefault()

  const form = e.target
  const mode = form.dataset.mode
  const id = form.dataset.id

  // I gather the form data into a structured object.
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

  const url = mode === "edit" ? `${API_URL}/vacancies/${id}` : `${API_URL}/vacancies`
  const method = mode === "edit" ? "PATCH" : "POST"

  fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(formData),
  })
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
      showError("create-vacancy-error", error.message || `Error ${mode === "edit" ? "updating" : "creating"} vacancy`)
    })
}

function editVacancy(vacancyId) {
  fetch(`${API_URL}/vacancies/${vacancyId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      "x-api-key": API_KEY,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const vacancy = data.data
      document.getElementById("vacancy-title").value = vacancy.title
      document.getElementById("vacancy-description").value = vacancy.description
      document.getElementById("vacancy-technologies").value = vacancy.technologies.map((t) => t.name).join(", ")
      document.getElementById("vacancy-seniority").value = vacancy.seniority
      document.getElementById("vacancy-location").value = vacancy.location
      document.getElementById("vacancy-modality").value = vacancy.modality
      document.getElementById("vacancy-salary").value = vacancy.salaryRange
      document.getElementById("vacancy-company").value = vacancy.company
      document.getElementById("vacancy-max").value = vacancy.maxApplicants

      document.getElementById("vacancy-modal-title").textContent = "Edit Vacancy"
      const form = document.getElementById("create-vacancy-form")
      form.dataset.mode = "edit"
      form.dataset.id = vacancyId

      document.getElementById("create-vacancy-modal").classList.add("show")
    })
    .catch((err) => {
      alert("Error loading vacancy data: " + err.message)
    })
}

function toggleVacancy(vacancyId, isActive) {
  // I use a PATCH request to toggle the active status.
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

function viewApplicants(vacancyId, vacancyTitle) {
  const modal = document.getElementById("view-applicants-modal")
  const title = document.getElementById("applicants-modal-title")
  const container = document.getElementById("applicants-list-container")

  title.textContent = `Applicants for: ${vacancyTitle}`
  container.innerHTML = '<div class="loading">Loading applicants...</div>'
  modal.classList.add("show")

  fetch(`${API_URL}/applications/vacancy/${vacancyId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      "x-api-key": API_KEY,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const applicants = data.data || []
      if (applicants.length === 0) {
        container.innerHTML = '<div class="empty-state">No applicants yet</div>'
        return
      }

      container.innerHTML = applicants
        .map(
          (app) => `
        <div class="applicant-item">
          <div class="applicant-info">
            <h4>${app.user.name}</h4>
            <p>${app.user.email}</p>
          </div>
          <div class="applicant-date">
            <span>Applied: ${new Date(app.appliedAt).toLocaleDateString()}</span>
          </div>
        </div>
      `,
        )
        .join("")
    })
    .catch((err) => {
      container.innerHTML = `<div class="error-message show">Error: ${err.message}</div>`
    })
}

function closeViewApplicantsModal() {
  document.getElementById("view-applicants-modal").classList.remove("show")
}

function showAllApplications() {
  document.getElementById("vacancies-list-gestor").style.display = "none"
  document.getElementById("btn-view-all-apps").style.display = "none"
  document.getElementById("all-applications-section").style.display = "block"
  document.querySelector(".stats").style.display = "none"
  loadAllApplications()
}

function hideAllApplications() {
  document.getElementById("vacancies-list-gestor").style.display = "block"
  document.getElementById("btn-view-all-apps").style.display = "block"
  document.getElementById("all-applications-section").style.display = "none"
  document.querySelector(".stats").style.display = "grid"
}

function loadAllApplications() {
  const container = document.getElementById("all-applications-list")
  container.innerHTML = '<div class="loading">Loading all applications...</div>'

  fetch(`${API_URL}/applications`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      "x-api-key": API_KEY,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const applications = data.data || []
      renderAllApplications(applications)
    })
    .catch((err) => {
      container.innerHTML = `<div class="error-message show">Error: ${err.message}</div>`
    })
}

function renderAllApplications(applications) {
  const container = document.getElementById("all-applications-list")

  if (applications.length === 0) {
    container.innerHTML = '<div class="empty-state">No applications found in the platform</div>'
    return
  }

  container.innerHTML = applications
    .map(
      (app) => `
    <div class="vacancy-card">
      <div class="vacancy-header">
        <div>
          <h3>${app.user.name}</h3>
          <p>${app.user.email}</p>
        </div>
        <div class="badge badge-success">Application</div>
      </div>
      <div class="vacancy-info">
        <p><strong>Vacancy:</strong> ${app.vacancy.title} (${app.vacancy.company})</p>
        <p><strong>Date:</strong> ${new Date(app.appliedAt).toLocaleString()}</p>
      </div>
    </div>
  `,
    )
    .join("")
}

// Coder Panel
function showCoderPanel() {
  document.getElementById("coder-panel").style.display = "block"
  document.getElementById("gestor-panel").style.display = "none"
  loadCoderData()
}

function loadCoderData() {
  // I fetch available vacancies and my own applications.
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
      const vacancies = vacanciesData?.data || []
      const applications = applicationsData?.data || []
      renderVacancies(vacancies, applications)
      renderMyApplications(applications)
    })
    .catch((error) => {
      console.error("Error loading coder data:", error)
    })
}

function renderVacancies(vacancies, myApplications) {
  const container = document.getElementById("vacancies-list")
  const appliedVacancyIds = Array.isArray(myApplications) ? myApplications.map((app) => app.vacancyId) : []

  if (!Array.isArray(vacancies) || vacancies.length === 0) {
    container.innerHTML = '<div class="empty-state"><h3>No vacancies available</h3></div>'
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
          <p><strong>Location:</strong> ${vacancy.location} - ${vacancy.modality}</p>
          <p><strong>Salary:</strong> ${vacancy.salaryRange}</p>
        </div>
        
        <div class="vacancy-footer">
          <span class="slots-info ${hasSlots ? "slots-available" : "slots-full"}">
            ${vacancy.availableSlots} slots available
          </span>
          ${hasApplied
          ? '<span class="badge badge-success">Already applied</span>'
          : hasSlots
            ? `<button class="btn-success" onclick="applyToVacancy('${vacancy.id}')">Apply Now</button>`
            : '<span class="slots-full">No slots left</span>'
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
    container.innerHTML = '<div class="empty-state"><h3>You have no applications yet</h3></div>'
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
        <button class="btn-danger" onclick="cancelApplication('${app.id}')">Cancel</button>
      </div>
      
      <div class="vacancy-badges">
        ${app.vacancy.technologies.map((tech) => `<span class="badge badge-primary">${tech.name}</span>`).join("")}
      </div>
      
      <div class="vacancy-info">
        <p><strong>Applied on:</strong> ${new Date(app.appliedAt).toLocaleDateString("en-US")}</p>
        <p><strong>Location:</strong> ${app.vacancy.location}</p>
        <p><strong>Modality:</strong> ${app.vacancy.modality}</p>
      </div>
    </div>
  `,
    )
    .join("")
}

function applyToVacancy(vacancyId) {
  // I send a POST request to create a new application record.
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
      alert("Application successful!")
      loadCoderData()
    })
    .catch((error) => {
      alert(error.message || "Error applying to vacancy")
    })
}

function cancelApplication(applicationId) {
  if (!confirm("Are you sure you want to cancel this application?")) return

  // I use a DELETE request to remove my application.
  fetch(`${API_URL}/applications/${applicationId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "x-api-key": API_KEY,
    },
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => Promise.reject(err))
      }
      return response.json()
    })
    .then(() => {
      alert("Application cancelled")
      loadCoderData()
    })
    .catch((error) => {
      alert(error.message || "Error cancelling application")
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

