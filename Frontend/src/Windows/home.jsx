import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import AccountCard from "../Components/AccountCard";
import Sidebar from "../Components/SideBar";
import "./Home.css";

function Home() {
    const [accounts, setAccounts] = useState([]);
    const [name, setName] = useState("");

    const [providers, setProviders] = useState([]);
    const [emails, setEmails] = useState([]);

    const [activeSection, setActiveSection] = useState("home");
    const [showSidebar, setShowSidebar] = useState(false);
    const [showAccountForm, setShowAccountForm] = useState(false);

    const [accountName, setAccountName] = useState("");
    const [currencies, setCurrencies] = useState([]);
    const [types, setTypes] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [stats, setStats] = useState({ gasto_mes: 0, transacciones_mes: 0, total_providers: 0 });

    const [showEmailForm, setShowEmailForm] = useState(false);
    const [emailInput, setEmailInput] = useState("");
    const [appPasswordInput, setAppPasswordInput] = useState("");

    const navigate = useNavigate();

    const authHeader = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });

    const fetchAccounts = () => {
        axios.get(`${import.meta.env.VITE_API_URL}/home/accounts`, authHeader())
            .then(res => {
                setAccounts(res.data.accounts);
                setName(res.data.name);
            })
            .catch(err => console.error(err));
    };

    const fetchStats = () => {
        axios.get(`${import.meta.env.VITE_API_URL}/home/stats`, authHeader())
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
    };

    const fetchProviders = () => {
        axios.get(`${import.meta.env.VITE_API_URL}/home/providers`, authHeader())
            .then(res => setProviders(res.data))
            .catch(err => console.error(err));
    };

    const fetchEmails = () => {
        axios.get(`${import.meta.env.VITE_API_URL}/home/emails`, authHeader())
            .then(res => {
                console.log('emails:', res.data);
                setEmails(res.data);
            })
            .catch(err => console.error(err));
    };

    const getUserId = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
    };

    const connectEmail = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/home/connectEmail`, {
                app_password: appPasswordInput
            }, authHeader());
            setShowEmailForm(false);
            fetchEmails();
        } catch (err) {
            console.error(err);
            alert(err.response?.data || "Error al conectar correo");
        }
    };

    const createAccount = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/home/createAccount`, {
                accountName,
                currencyId: selectedCurrency,
                typeId: selectedType
            }, authHeader());

            setShowAccountForm(false);
            setAccountName("");
            setSelectedCurrency("");
            setSelectedType("");
            fetchAccounts();

        } catch (error) {
            console.error(error);
            alert(error.response?.data || "Error al crear la cuenta");
        }
    };

    useEffect(() => {
        fetchAccounts();
        fetchStats();
        fetchProviders();
        fetchEmails();
    }, []);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/home/currencies`)
            .then(res => setCurrencies(res.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/home/types`)
            .then(res => setTypes(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="dashboard">

            <Sidebar
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                setShowAccountForm={setShowAccountForm}
                fetchAccounts={fetchAccounts}
                fetchProviders={fetchProviders}
                fetchEmails={fetchEmails}
            />

            <button
                className="menu-btn"
                onClick={() => setShowSidebar(true)}
            >
                ☰
            </button>

            <div className="main-content">

                <h1>Hola, {name}</h1>

                {activeSection === "home" && (
                    <>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <p className="stat-label">Gasto este mes</p>
                                <p className="stat-value">₡{Number(stats.gasto_mes).toLocaleString()}</p>
                            </div>
                            <div className="stat-card">
                                <p className="stat-label">Transacciones</p>
                                <p className="stat-value">{stats.transacciones_mes}</p>
                                <p className="stat-sub">este mes</p>
                            </div>
                            <div className="stat-card">
                                <p className="stat-label">Proveedores</p>
                                <p className="stat-value teal">{stats.total_providers}</p>
                                <p className="stat-sub">registrados</p>
                            </div>
                        </div>

                        <h2>Cuentas</h2>

                        <div className="accounts-grid">

                            {accounts.map((acc) => (
                                <AccountCard
                                    key={acc.id_account}
                                    name={acc.account_name}
                                    balance={acc.balance}
                                    iso={acc.iso}
                                    type={acc.type_name}
                                    providerCount={acc.provider_count}
                                    onClick={() => navigate(`/account/${acc.id_account}`)}
                                />
                            ))}

                        </div>
                    </>
                )}

                {activeSection === "providers" && (
                    <>
                        <h2>Proveedores</h2>
                        <div className="providers-list">
                            {providers.length === 0 && <p>No hay proveedores registrados.</p>}
                            {providers.map((p) => (
                                <div key={p.id_provider} className="provider-card">
                                    <p className="provider-name">{p.name}</p>
                                    <p className="provider-email">{p.email_identifier}</p>
                                    <span className={`provider-status ${p.activo ? "active" : "inactive"}`}>
                                        {p.activo ? "Activo" : "Inactivo"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeSection === "emails" && (
                    <>
                        <h2>Correos</h2>
                        <button className="btn-primary" onClick={() => setShowEmailForm(true)}>
                            Conectar correo
                        </button>
                        <div className="emails-list">
                            {emails.length === 0 && <p>No hay correos registrados.</p>}
                            {emails.map((e) => (
                                <div key={e.id_correo} className={`email-card ${e.id_alerta && !e.resuelta ? "alert" : ""}`}>
                                    <p className="email-subject">{e.asunto}</p>
                                    <p className="email-sender">{e.remitente}</p>
                                    <p className="email-date">{new Date(e.fecha_correo).toLocaleDateString()}</p>
                                    {e.id_alerta && !e.resuelta && (
                                        <span className="alert-badge">⚠ Proveedor desconocido</span>
                                    )}
                                    {e.proveedor && <span className="provider-badge">{e.proveedor}</span>}
                                </div>
                            ))}
                        </div>
                    </>
                )}

            </div>

            {showAccountForm && (
                <div className="account"
                    onClick={() => setShowAccountForm(false)}>
                    <div className="account-form"
                        onClick={(e) => e.stopPropagation()}>

                        <div className="input-wrapper">
                            <label>Nombre de la cuenta</label>
                            <input
                                type="text"
                                placeholder="Ingrese un nombre"
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                            />
                        </div>

                        <select
                            value={selectedCurrency}
                            onChange={(e) => setSelectedCurrency(e.target.value)}
                        >
                            <option value="">Tipo de moneda</option>

                            {currencies.map((cur) => (
                                <option key={cur.id_currency} value={cur.id_currency}>
                                    {cur.iso}
                                </option>
                            ))}
                        </select>

                        <button className="btn-primary" onClick={createAccount}>
                            Crear
                        </button>
                    </div>
                </div>
            )}
            
            {showEmailForm && (
                <div className="account" onClick={() => setShowEmailForm(false)}>
                    <div className="account-form" onClick={(e) => e.stopPropagation()}>
                        <div className="input-wrapper">
                            <label>App Password de Gmail</label>
                            <input
                                type="password"
                                placeholder="xxxx xxxx xxxx xxxx"
                                value={appPasswordInput}
                                onChange={(e) => setAppPasswordInput(e.target.value)}
                            />
                        </div>
                        <button className="btn-primary" onClick={connectEmail}>
                            Conectar
                        </button>
                    </div>
                </div>
            )}

                    </div>
                )
            }

export default Home;