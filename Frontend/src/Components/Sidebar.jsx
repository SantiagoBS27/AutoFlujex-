import "./Sidebar.css";

function Sidebar({
    showSidebar,
    setShowSidebar,
    activeSection,
    setActiveSection,
    setShowAccountForm,
    fetchAccounts,
    fetchProviders,
    fetchEmails,
    fetchAlerts
}) {

    return (
        <div className={`sidebar ${showSidebar ? "open" : ""}`}>

            <div className="sidebar-content">
                <button
                    className="close-sidebar"
                    onClick={() => setShowSidebar(false)}
                >
                    ✕
                </button>

                <h1 className="logo">
                    Auto<span>Flujex</span>
                </h1>

                <nav className="sidebar-nav">
                    <button
                        className={`sidebar-btn ${activeSection === "home" ? "active" : ""}`}
                        onClick={() => {
                            setActiveSection("home");
                            fetchAccounts();
                            setShowSidebar(false);
                        }}
                    >
                        Inicio
                    </button>

                    <button
                        className={`sidebar-btn ${activeSection === "providers" ? "active" : ""}`}
                        onClick={() => {
                            setActiveSection("providers");
                            fetchProviders();
                            setShowSidebar(false);
                        }}
                    >
                        Proveedores
                    </button>

                    <button
                        className={`sidebar-btn ${activeSection === "emails" ? "active" : ""}`}
                        onClick={() => {
                            setActiveSection("emails");
                            fetchEmails();
                            setShowSidebar(false);
                        }}
                    >
                        Correos
                    </button>

                    <button
                        className={`sidebar-btn ${activeSection === "alerts" ? "active" : ""}`}
                        onClick={() => {
                            setActiveSection("alerts");
                            fetchAlerts();
                            setShowSidebar(false);
                        }}
                    >
                        Alertas
                    </button>
                </nav>

                <div className="sidebar-divider"></div>

                <button
                    className="sidebar-btn new-account-btn"
                    onClick={() => {
                        setShowAccountForm(true);
                        setShowSidebar(false);
                    }}
                >
                    + Nueva cuenta
                </button>
            </div>

        </div>
    );
}

export default Sidebar;