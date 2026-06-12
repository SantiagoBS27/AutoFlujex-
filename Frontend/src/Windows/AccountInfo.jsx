import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from 'axios';
import "./AccountInfo.css";

function AccountInfo() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [account, setAccount] = useState(null);
    const [providers, setProviders] = useState([]);

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

        </div>
    );
}

export default AccountInfo;