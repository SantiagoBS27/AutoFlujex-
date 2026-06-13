const parseBACEmail = (cuerpo) => {
    try {
        const montoMatch = cuerpo.match(/monto de ([\d,.]+)\s*Colones/i);
        const comercioMatch = cuerpo.match(/Comercio:\s*\n(.+)/i);
        const tipoMatch = cuerpo.match(/Tipo de Transacción:\s*\n(.+)/i);

        const monto = montoMatch ? parseFloat(montoMatch[1].replace(/\./g, '').replace(/,/g, '.')) : null;
        const comercio = comercioMatch ? comercioMatch[1].trim() : null;
        const tipo = tipoMatch ? tipoMatch[1].trim() : null;

        if (!monto || tipo !== 'COMPRA') return null;

        return { monto, comercio };
    } catch (e) {
        return null;
    }
};

const parseEmail = (remitente, cuerpo) => {
    if (remitente.includes('notificacionesbaccr.com')) {
        return parseBACEmail(cuerpo);
    }
    if (remitente.includes('grupomutual.fi.cr')) {
        return parseMutualEmail(cuerpo);
    }
    return null;
};

const parseMutualEmail = (cuerpo) => {
    try {
        const montoMatch = cuerpo.match(/monto de ([\d,]+\.?\d*)\s*Colones/i);
        const conceptoMatch = cuerpo.match(/concepto de "(.*)"/i);

        if (!montoMatch) return null;

        const montoStr = montoMatch[1].replace(/,/g, '');
        const monto = parseFloat(montoStr);

        if (!monto) return null;

        return { monto, comercio: conceptoMatch ? conceptoMatch[1] : null };
    } catch (e) {
        return null;
    }
};

module.exports = { parseEmail };