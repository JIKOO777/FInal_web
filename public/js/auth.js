// Функция для отправки запросов на сервер
async function authRequest(endpoint, data) {
  const response = await fetch(`/api/auth/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Something went wrong");
  return result;
}

// Обработка формы входа
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const alertBox = loginForm.querySelector("[data-auth-alert]") || loginForm.querySelector(".alert");

    try {
      const data = await authRequest("login", { email, password });
      window.app.auth.setToken(data.token); // Сохраняем токен
      window.location.href = "index.html";
    } catch (err) {
      if (alertBox) {
        alertBox.textContent = err.message;
        alertBox.style.display = "block";
      } else {
        alert(err.message);
      }
    }
  });
}


const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;
    const alertBox = registerForm.querySelector("[data-auth-alert]") || registerForm.querySelector(".alert");

    if (password !== confirm) {
      if (alertBox) {
        alertBox.textContent = "Passwords do not match";
        alertBox.style.display = "block";
      } else {
        alert("Passwords do not match");
      }
      return;
    }

    try {
      const data = await authRequest("register", { name, email, password });
      window.app.auth.setToken(data.token);
      window.location.href = "index.html";
    } catch (err) {
      if (alertBox) {
        alertBox.textContent = err.message;
        alertBox.style.display = "block";
      } else {
        alert(err.message);
      }
    }
  });
}
