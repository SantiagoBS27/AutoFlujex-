import { useState, useEffect} from 'react';
import axios from 'axios';


function Home() {
    const [accounts, setAccounts] = useState([]);
    const [name, setName] = useState("");

    const [providers, setProviders] = useState([]);
    const [emails, setEmails] = useState([]);

    const [activeSection, setActiveSection] = useState("home");
    const [showSidebar, setShowSidebar] = useState(false);
    const [showAccountForm, setShowAccountForm] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        axios.get(`${import.meta.env.VITE_API_URL}/home/accounts`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setAccounts(res.data.accounts);
                setName(res.data.name);
            })
            .catch(err => console.error(err));
    }, []);


    return (
        <div className="home-container">
            <h1>Bienvenido, {name}</h1>

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

            {activeSection === "accounts" && (
                    <>
                        <h2>Cuentas</h2>

                        <div className="accounts-grid">

                            {accounts.map((acc) => (
                                <AccountCard
                                    key={acc.id_account}
                                    name={acc.account_name}
                                    balance={acc.balance}
                                    iso={acc.iso}
                                    type={acc.type_name}
                                    onClick={() => navigate(`/account/${acc.id_account}`)}
                                />
                            ))}

                        </div>
                    </>
                )}

        </div>
    )
}