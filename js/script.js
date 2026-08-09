// -------------------------------------------------------------
// CONFIGURAÇÃO DO FIREBASE (Sintaxe Compat para CDN)
// -------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDcBo46U7vdguKchyQMfkMzEZUGJ9ds1ys",
  authDomain: "min-aprendizados.firebaseapp.com",
  projectId: "min-aprendizados",
  storageBucket: "min-aprendizados.firebasestorage.app",
  messagingSenderId: "230065457786",
  appId: "1:230065457786:web:0a5ef0b11483ea36c0c9c3"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// -------------------------------------------------------------
// MANTER O USUÁRIO LOGADO EM QUALQUER DISPOSITIVO
// -------------------------------------------------------------
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');

        const userName = user.displayName || user.email.split('@')[0];
        document.getElementById('header-name').innerText = userName;
        document.getElementById('profile-name').value = userName;
        document.getElementById('profile-email').value = user.email;
    } else {
        document.getElementById('app-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
    }
});

// -------------------------------------------------------------
// VERIFICAÇÕES E VALIDAÇÕES
// -------------------------------------------------------------
function isPasswordStrong(password) {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password) &&
           /[!@#$%^&*(),.?":{}|<>]/.test(password);
}

function checkPasswordRequirements(password, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const requirements = [
        { selector: 'req-length', valid: password.length >= 8 },
        { selector: 'req-uppercase', valid: /[A-Z]/.test(password) },
        { selector: 'req-lowercase', valid: /[a-z]/.test(password) },
        { selector: 'req-number', valid: /[0-9]/.test(password) },
        { selector: 'req-special', valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
    ];

    requirements.forEach(req => {
        const element = container.querySelector(`[id$="${req.selector}"]`);
        if (element) {
            const icon = element.querySelector('i');
            if (req.valid) {
                element.classList.add('valid');
                icon.classList.remove('fa-circle-xmark');
                icon.classList.add('fa-circle-check');
            } else {
                element.classList.remove('valid');
                icon.classList.remove('fa-circle-check');
                icon.classList.add('fa-circle-xmark');
            }
        }
    });
}

function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function showAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotForm = document.getElementById('forgot-form');
    const tabsContainer = document.getElementById('auth-tabs-container');
    const btnLogin = document.getElementById('btn-tab-login');
    const btnRegister = document.getElementById('btn-tab-register');

    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    forgotForm.classList.add('hidden');
    tabsContainer.classList.remove('hidden');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        btnLogin.classList.add('active');
        btnRegister.classList.remove('active');
    } else if (tab === 'register') {
        registerForm.classList.remove('hidden');
        btnRegister.classList.add('active');
        btnLogin.classList.remove('active');
    } else if (tab === 'forgot') {
        forgotForm.classList.remove('hidden');
        tabsContainer.classList.add('hidden');
    }
}

// Expor funções globais para os botões do HTML (onclick)
window.showAuthTab = showAuthTab;
window.togglePasswordVisibility = togglePasswordVisibility;
window.checkPasswordRequirements = checkPasswordRequirements;

// -------------------------------------------------------------
// PROCESSOS DE AUTENTICAÇÃO COM FIREBASE
// -------------------------------------------------------------

// 1. CRIAR CONTA (Com e-mail de verificação)
document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if (!isPasswordStrong(password)) {
        alert('A senha precisa cumprir todos os requisitos de segurança.');
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        await user.updateProfile({ displayName: name });
        await user.sendEmailVerification();

        alert(`Seja bem-vindo(a), ${name}!\n\nEnviamos uma mensagem para ${email}. Verifique sua caixa de entrada para confirmar seu cadastro!`);
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            alert('Este e-mail já está em uso por outra conta.');
        } else {
            alert('Erro ao criar conta: ' + error.message);
        }
    }
});

// 2. ENTRAR (LOGIN)
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        alert('E-mail ou senha incorretos.');
    }
});

// 3. RECUPERAR SENHA
document.getElementById('forgot-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('reset-email').value;

    try {
        await auth.sendPasswordResetEmail(email);
        alert('E-mail de redefinição enviado! Verifique sua caixa de entrada e spam.');
        showAuthTab('login');
    } catch (error) {
        alert('Erro ao enviar e-mail. Verifique se o e-mail está correto.');
    }
});

// 4. LOGOUT
function logout() {
    auth.signOut();
}
window.logout = logout;

// -------------------------------------------------------------
// NAVEGAÇÃO DA ÁREA INTERNA
// -------------------------------------------------------------
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.add('hidden'));

    const navItems = document.querySelectorAll('.sidebar-nav li');
    navItems.forEach(item => item.classList.remove('active'));

    if (tabName === 'courses') {
        document.getElementById('tab-courses').classList.remove('hidden');
        navItems[0].classList.add('active');
    } else if (tabName === 'profile') {
        document.getElementById('tab-profile').classList.remove('hidden');
        navItems[1].classList.add('active');
    } else if (tabName === 'schedule') {
        document.getElementById('tab-schedule').classList.remove('hidden');
        navItems[2].classList.add('active');
    } else if (tabName === 'contact') {
        document.getElementById('tab-contact').classList.remove('hidden');
        navItems[3].classList.add('active');
    }
}
window.switchTab = switchTab;

function openCourse(courseId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.add('hidden'));
    document.getElementById('tab-course-view').classList.remove('hidden');
}
window.openCourse = openCourse;

function saveProfile(event) {
    event.preventDefault();
    const newName = document.getElementById('profile-name').value;
    const user = auth.currentUser;

    if (user) {
        user.updateProfile({ displayName: newName })
            .then(() => {
                alert('Nome atualizado!');
                document.getElementById('header-name').innerText = newName;
            })
            .catch(err => alert('Erro ao atualizar: ' + err.message));
    }
}
window.saveProfile = saveProfile;