import "./AccountCard.css";

function AccountCard({ name, balance, iso, type, providerCount, onClick }) {
    return (
        <div className={`AccCard ${type}`} onClick={onClick}>
            <h3>{name}</h3>
            <p className="balance">{Number(balance).toLocaleString()} {iso}</p>
            <span className="provider-count">
                {providerCount} proveedor{providerCount === 1 ? "" : "es"}
            </span>
        </div>
    );
}

export default AccountCard;