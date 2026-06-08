import './login.css';
import { useState } from 'react';
import axios from 'axios';


function Signup() {
    const [name, setName] = useState("");
    const [firstname, setFirstName] = useState("");
    const [secondname, setSecondName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [mostrarModal, setMostrarModal] = useState(false);

    const validarUsuario = () => {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            setMensaje("Formato de correo invalido");
            return false;
        }

        if (
            !email.endsWith("@gmail.com") &&
            !email.endsWith("@yahoo.com") &&
            !email.endsWith("@estudiantec.cr") &&
            !email.endsWith("@itcr.ac.cr") &&
            !email.endsWith("@hotmail.com")
        ) {
            setMensaje("El correo debe ser gmail, yahoo, etc");
            return false;
        }

        if (password.length < 8) {
            setMensaje("La contraseña debe tener al menos 8 caracteres");
            return false;
        }

        return true;
    };

    const handleSignup = async () => {
        if (!validarUsuario()) return;

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/auth/signup`, {
                name,
                last1: firstname,
                last2: secondname,
                email,
                password
            });

            setMostrarModal(true);

        } catch (error) {
            console.error(error);
            setMensaje(error.response?.data || "Error de conexión");
        }
    };
    return (
        <div className="pageBody">
            <div className="loginContainer">
                <div className="leftSide">
                    <h1 className="logo">Auto<span>Flujex</span></h1>
                    <p className="tagline">Crea una cuenta para poder automatizar tu gestión financiera.</p>
                    <div className="chart-decoration">
                        {[40, 65, 30, 80, 55, 90, 45, 70, 100, 60].map((h, i) => (
                        <div key={i} className={`bar ${i === 8 ? 'active' : ''}`} style={{ height: `${h}%` }} />
                        ))}
                    </div>
                </div>
                <div className="rightSide-form">
                    <h2>Crear cuenta</h2>

                    {mostrarModal && (
                        <div className="modal">
                            <div className="modal-box">
                                <p>Usuario creado con éxito</p>
                                <button className="btn-primary" onClick={() => window.location.href = "/"}>
                                    Continuar
                                </button>
                            </div>
                        </div>
                    )}

                    {mensaje && <p className="mensaje">{mensaje}</p>}

                    <div className="input-group">
                        <div className="input-wrapper">
                            <label>Nombre</label>
                            <input 
                            type="text" 
                            placeholder="Nombre" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            />
                        </div>
                        <div className="input-wrapper">
                            <label>Primer apellido</label>
                            <input 
                            type="text" 
                            placeholder="Primer apellido" 
                            value={firstname} 
                            onChange={(e) => setFirstName(e.target.value)} 
                            />
                        </div>
                        <div className="input-wrapper">
                            <label>Segundo apellido</label>
                            <input 
                            type="text" 
                            placeholder="Segundo apellido" 
                            value={secondname} 
                            onChange={(e) => setSecondName(e.target.value)} 
                            />
                        </div>
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

                    <button className="btn-primary" onClick={handleSignup}>
                        Ingresar
                    </button>

                </div>



            </div>
        </div>
    )
}

export default Signup;