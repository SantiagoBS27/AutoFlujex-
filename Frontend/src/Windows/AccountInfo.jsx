import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from 'axios';
import "./AccountInfo.css";

function AccountInfo() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const [providers, setProviders] = useState([]);
    const [emails, setEmails] = useState([]);

    const authHeader = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/account/${id}`, authHeader())
            .then(res => {
                setAccount(res.data.account);
                setProviders(res.data.providers);
            })
            .catch(err => console.error(err));

        axios.get(`${import.meta.env.VITE_API_URL}/account/${id}/emails`, authHeader())
            .then(res => setEmails(res.data))
            .catch(err => {
                console.error("ERROR EMAILS:", err.response?.data || err.message);
            });
    }, [id]);

    if (!account) return <p className="loading-msg">Cargando...</p>;

    return (
        <div className="AccountInf">
            <button className="back-btn" onClick={() => navigate(-1)}>
                ← Volver
            </button>
            <div className="account-header">
                <p className="account-type">{account.type_name}</p>
                <h2>{account.account_name}</h2>
            </div>
            <div className="balance-container">
                <p className="balance-label">Balance</p>
                <h1>{Number(account.balance).toLocaleString()} <span>{account.iso}</span></h1>
            </div>
            <h3 className="providers-title">Proveedores asociados</h3>
            <div className="providers-list">
                {providers.length === 0 ? (
                    <p className="empty-msg">Aún no hay proveedores asociados a esta cuenta.</p>
                ) : (
                    providers.map((p) => (
                        <div key={p.id_provider} className="provider-row">
                            <div className="provider-avatar">
                                {p.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="provider-info">
                                <span className="provider-name">{p.name}</span>
                                <span className="provider-email">{p.email_identifier}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <h3 className="providers-title">Correos recientes</h3>
            <div className="emails-list-account">
                {emails.length === 0 ? (
                    <p className="empty-msg">No hay correos asociados a esta cuenta.</p>
                ) : (
                    emails.map((e) => (
                        <div key={e.id_correo} className="email-card known">
                            <div className="email-card-left">
                                <span className="email-provider-badge">{e.proveedor}</span>
                                <p className="email-subject">{e.asunto}</p>
                                <p className="email-sender">{e.remitente}</p>
                            </div>
                            <div className="email-card-right">
                                <p className="email-date">{new Date(e.fecha_correo).toLocaleDateString()} {new Date(e.fecha_correo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                {e.monto && <p className="email-amount">₡{Number(e.monto).toLocaleString()}</p>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default AccountInfo;