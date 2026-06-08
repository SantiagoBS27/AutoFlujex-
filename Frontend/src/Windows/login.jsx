import { useState } from 'react';
import './login.css';
import axios from 'axios';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mostrarModal, setMostrarModal] = useState(false);

    const handleLogin = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
                email,
                password
            });

            localStorage.setItem("token", res.data.token);
            window.location.href = "/home";

        } catch (error) {
            console.error(error);
            alert(error.response?.data || "Error de conexión");
        }
    };

    return (
        <div className="pageBody">
            <div className="loginContainer">
                <div className="leftSide">
                    <h1 className="logo">Auto<span>Flujex</span></h1>
                    <p className="tagline">Gestión automatizada de tus movimientos financieros.</p>
                    <div className="chart-decoration">
                        {[40, 65, 30, 80, 55, 90, 45, 70, 100, 60].map((h, i) => (
                        <div key={i} className={`bar ${i === 8 ? 'active' : ''}`} style={{ height: `${h}%` }} />
                        ))}
                    </div>
                </div>

                <div className="rightSide-form">
                    <h2>Iniciar sesión</h2>

                    {mostrarModal && (
                        <div className="modal">
                            <div className="modal-box">
                                <p>Usuario validado con éxito</p>
                                <button className="btn-primary" onClick={() => window.location.href = "/home"}>
                                    Continuar
                                </button>
                            </div>
                        </div>
                    )}


                    <div className="input-group">
                        <div className="input-wrapper">
                            <label>Correo electrónico</label>
                            <input 
                            type="email" 
                            placeholder="tu@correo.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            />
                        </div>
                        <div className="input-wrapper">
                            <label>Contraseña</label>
                            <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            />
                        </div>
                    </div>

                    <button className="btn-primary" onClick={handleLogin}>
                        Ingresar
                    </button>

                    <div className="signup">
                        ¿No tiene una cuenta?
                        <a href="/signup"> Crear una cuenta. </a>
                    </div>

                </div>

            </div>
        </div>
    )

}

export default Login; 