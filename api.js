const API_BASE_URL = "http://localhost:5000";

function showMessage(message, type = "error") {
  const existingMessage = document.querySelector(".api-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = `api-message ${type}`;
  messageDiv.textContent = message;

  messageDiv.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideDown 0.3s ease;
        max-width: 90%;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;

  if (type === "success") {
    messageDiv.style.background =
      "linear-gradient(135deg, #4caf50 0%, #45a049 100%)";
  } else {
    messageDiv.style.background =
      "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)";
  }

  document.body.appendChild(messageDiv);
  setTimeout(() => {
    messageDiv.style.animation = "slideUp 0.3s ease";
    setTimeout(() => messageDiv.remove(), 300);
  }, 5000);
}

if (!document.getElementById("api-message-styles")) {
  const style = document.createElement("style");
  style.id = "api-message-styles";
  style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        @keyframes slideUp {
            from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
        }
    `;
  document.head.appendChild(style);
}

async function testConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      console.log("✅ Server connection OK");
      return true;
    } else {
      console.error("❌ Server responded with error:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Cannot connect to server:", error.message);
    console.error("Make sure the server is running on", API_BASE_URL);
    return false;
  }
}

async function registerUser(name, email, password) {
  try {
    console.log("Attempting to register user...");
    console.log("API URL:", `${API_BASE_URL}/register`);

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    console.log("Response status:", response.status);
    console.log("Response OK:", response.ok);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = {
          message: `Server error: ${response.status} ${response.statusText}`,
        };
      }

      console.error("Server error:", errorData);
      showMessage(errorData.message || `Server error: ${response.status}`);
      return { success: false, message: errorData.message };
    }

    const data = await response.json();
    console.log("Response data:", data);

    if (data.success) {
      showMessage(
        "Registration successful! Redirecting to login...",
        "success",
      );

      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);

      return { success: true, data: data.data };
    } else {
      showMessage(data.message || "Registration failed");
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error("Registration error details:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    let errorMessage = "Network error. ";

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      errorMessage += "Cannot connect to server. ";
      errorMessage += `Make sure the server is running on ${API_BASE_URL}`;
    } else if (error.message) {
      errorMessage += error.message;
    } else {
      errorMessage += "Please check if the server is running.";
    }

    showMessage(errorMessage);
    return { success: false, message: errorMessage };
  }
}

async function loginUser(email, password) {
  try {
    console.log("Attempting to login user...");
    console.log("API URL:", `${API_BASE_URL}/login`);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    console.log("Response status:", response.status);
    console.log("Response OK:", response.ok);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = {
          message: `Server error: ${response.status} ${response.statusText}`,
        };
      }

      console.error("Server error:", errorData);
      showMessage(errorData.message || `Server error: ${response.status}`);
      return { success: false, message: errorData.message };
    }

    const data = await response.json();
    console.log("Response data:", data);

    if (data.success) {
      showMessage("Login successful! Welcome back!", "success");
      localStorage.setItem("user", JSON.stringify(data.data));
      showMessage("Кіру сәтті! Басты бетке бағытталуда...", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 800);

      return { success: true, data: data.data };
    } else {
      showMessage(data.message || "Login failed");
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error("Login error details:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    let errorMessage = "Network error. ";

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      errorMessage += "Cannot connect to server. ";
      errorMessage += `Make sure the server is running on ${API_BASE_URL}`;
    } else if (error.message) {
      errorMessage += error.message;
    } else {
      errorMessage += "Please check if the server is running.";
    }

    showMessage(errorMessage);
    return { success: false, message: errorMessage };
  }
}
