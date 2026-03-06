import { useState, useEffect, useRef, useCallback } from "react";

const COLORES = {
  navy: "#0d1b3e",
  gold: "#f5c842",
  green: "#00c896",
  red: "#ff4d6d",
  grayLight: "#f4f6fa",
  grayMid: "#e2e8f0",
  text: "#1a202c",
  textLight: "#718096",
};

const SHEETS_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjqr9ens0Kv6iN8Sb757_JkPM-yeWzeCYL0WALzLaIChu_-qckPeksCzeGBwY9I-x8YFtHbU7MAJbz/pub?gid=0&single=true&output=csv";

const BASE_URL = "https://cacitus-carnet-afiliado.vercel.app";

function parsearCSV(texto) {
  const lineas = texto.trim().split("\n");
  const encabezados = lineas[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  return lineas.slice(1).map((linea) => {
    const valores = linea.split(",").map((v) => v.trim().replace(/"/g, ""));
    const obj = {};
    encabezados.forEach((h, i) => (obj[h] = valores[i] || ""));
    obj.activo = obj.activo === "TRUE" || obj.activo === "true";
    return obj;
  }).filter((a) => a.id);
}

// ── Cargar QRCode.js una vez ─────────────────────────────────────
let _qrPromise = null;
function loadQRLib() {
  if (!_qrPromise) {
    _qrPromise = new Promise((res, rej) => {
      if (window.QRCode) return res();
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  return _qrPromise;
}

// ── Componente QR ────────────────────────────────────────────────
function QRCode({ text, size = 72 }) {
  const ref = useRef(null);
  useEffect(() => {
    let alive = true;
    loadQRLib().then(() => {
      if (!alive || !ref.current) return;
      ref.current.innerHTML = "";
      new window.QRCode(ref.current, {
        text,
        width: size,
        height: size,
        colorDark: COLORES.navy,
        colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    });
    return () => { alive = false; };
  }, [text, size]);
  return <div ref={ref} style={{ width: size, height: size }} />;
}

// ── Genera imagen del carnet usando canvas (sin html2canvas) ─────
async function generarImagenCarnet(afiliado, vigente) {
  await loadQRLib();

  const W = 640, H = 420;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Fondo blanco
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Header navy
  ctx.fillStyle = COLORES.navy;
  ctx.fillRect(0, 0, W, 90);

  // Círculo gold con "C"
  ctx.fillStyle = COLORES.gold;
  ctx.beginPath();
  ctx.arc(52, 45, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORES.navy;
  ctx.font = "bold 26px Georgia";
  ctx.textAlign = "center";
  ctx.fillText("C", 52, 54);

  // Texto CACITUS
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Georgia";
  ctx.textAlign = "left";
  ctx.letterSpacing = "4px";
  ctx.fillText("CACITUS", 94, 42);
  ctx.fillStyle = COLORES.gold;
  ctx.font = "12px Arial";
  ctx.fillText("CÁMARA DE COMERCIO · SARCHÍ", 94, 65);

  // CARNET AFILIADO (derecha)
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "11px Arial";
  ctx.textAlign = "right";
  ctx.fillText("CARNET AFILIADO", W - 24, 50);

  // Avatar círculo
  ctx.fillStyle = vigente ? COLORES.navy : "#94a3b8";
  ctx.beginPath();
  ctx.arc(80, 165, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px Georgia";
  ctx.textAlign = "center";
  ctx.fillText(afiliado.nombre.charAt(0).toUpperCase(), 80, 178);

  // Nombre y comercio
  ctx.fillStyle = COLORES.text;
  ctx.font = "bold 22px Georgia";
  ctx.textAlign = "left";
  ctx.fillText(afiliado.nombre, 144, 152);
  ctx.fillStyle = COLORES.textLight;
  ctx.font = "15px Arial";
  ctx.fillText(afiliado.comercio, 144, 176);

  // Badge estado
  const badgeX = 144, badgeY = 190;
  const badgeW = 110, badgeH = 26;
  ctx.fillStyle = vigente ? "#dcfce7" : "#fee2e2";
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 13);
  ctx.fill();
  ctx.fillStyle = vigente ? COLORES.green : COLORES.red;
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "center";
  ctx.fillText(vigente ? "● ACTIVO" : "● INACTIVO", badgeX + badgeW / 2, badgeY + 18);

  // Separador
  ctx.strokeStyle = COLORES.grayMid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, 238); ctx.lineTo(W - 24, 238);
  ctx.stroke();

  // Zona QR — fondo gris
  ctx.fillStyle = COLORES.grayLight;
  ctx.fillRect(0, 238, W, 138);

  // Generar QR en canvas temporal
  const qrText = `${BASE_URL}/?verificar=${afiliado.id}`;
  const qrSize = 100;
  const qrDiv = document.createElement("div");
  qrDiv.style.cssText = "position:fixed;left:-9999px;top:-9999px;";
  document.body.appendChild(qrDiv);

  await new Promise((resolve) => {
    new window.QRCode(qrDiv, {
      text: qrText,
      width: qrSize,
      height: qrSize,
      colorDark: COLORES.navy,
      colorLight: "#ffffff",
      correctLevel: window.QRCode.CorrectLevel.M,
    });
    setTimeout(resolve, 300);
  });

  const qrCanvas = qrDiv.querySelector("canvas");
  if (qrCanvas) {
    // Marco del QR
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = COLORES.navy;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(24, 250, qrSize + 16, qrSize + 16, 8);
    ctx.fill(); ctx.stroke();
    ctx.drawImage(qrCanvas, 32, 258, qrSize, qrSize);
  }
  document.body.removeChild(qrDiv);

  // Código y detalles
  ctx.fillStyle = COLORES.textLight;
  ctx.font = "13px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Código de afiliado", 158, 272);

  ctx.fillStyle = COLORES.navy;
  ctx.font = "bold 30px Georgia";
  ctx.fillText(afiliado.id, 158, 310);

  const fechaVence = new Date(afiliado.vence + "T00:00:00").toLocaleDateString("es-CR");
  ctx.fillStyle = COLORES.textLight;
  ctx.font = "13px Arial";
  ctx.fillText(`Vence: ${fechaVence}`, 158, 336);

  // Pie navy
  ctx.fillStyle = COLORES.navy;
  ctx.fillRect(0, 376, W, 44);
  ctx.fillStyle = COLORES.gold;
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Escanee el QR para verificar vigencia en tiempo real · CACITUS · Sarchí", W / 2, 402);

  return canvas.toDataURL("image/png");
}

// ── Vista de verificación ────────────────────────────────────────
function VistaVerificacion({ afiliado, onVolver }) {
  const hoy = new Date();
  const vigente = afiliado.activo && new Date(afiliado.vence) >= hoy;

  return (
    <div style={{ minHeight: "100vh", background: COLORES.grayLight, fontFamily: "Georgia, serif" }}>
      <div style={{ background: COLORES.navy, padding: "20px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%", background: COLORES.gold,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 900, fontSize: 20, color: COLORES.navy,
        }}>C</div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: 2 }}>CACITUS</div>
          <div style={{ color: COLORES.gold, fontSize: 10, letterSpacing: 1 }}>CÁMARA DE COMERCIO · SARCHÍ</div>
        </div>
      </div>

      <div style={{ background: vigente ? COLORES.green : COLORES.red, padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>{vigente ? "✓" : "✗"}</div>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 22, letterSpacing: 2, marginTop: 4 }}>
          {vigente ? "AFILIADO ACTIVO" : "AFILIADO INACTIVO"}
        </div>
        <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 }}>
          {vigente ? "Beneficios vigentes" : "Sin beneficios activos"}
        </div>
      </div>

      <div style={{ padding: "24px 20px", maxWidth: 420, margin: "0 auto" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%", background: COLORES.navy,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px", fontSize: 28, color: "#fff", fontWeight: 700,
            }}>{afiliado.nombre.charAt(0)}</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: COLORES.text }}>{afiliado.nombre}</div>
            <div style={{ color: COLORES.textLight, fontSize: 14, marginTop: 4 }}>{afiliado.comercio}</div>
          </div>
          {[
            ["Código", afiliado.id],
            ["Teléfono", afiliado.telefono],
            ["Vence", new Date(afiliado.vence + "T00:00:00").toLocaleDateString("es-CR", { day: "2-digit", month: "long", year: "numeric" })],
            ["Estado", vigente ? "Activo" : "Inactivo"],
          ].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${COLORES.grayMid}`, fontSize: 14 }}>
              <span style={{ color: COLORES.textLight }}>{label}</span>
              <span style={{ fontWeight: 600, color: label === "Estado" ? (vigente ? COLORES.green : COLORES.red) : COLORES.text }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, background: "#fff", borderRadius: 12, padding: "12px 16px", fontSize: 11, color: COLORES.textLight, textAlign: "center" }}>
          Verificación en tiempo real · CACITUS · Sarchí, Costa Rica
        </div>
        {onVolver && (
          <button onClick={onVolver} style={{
            display: "block", width: "100%", marginTop: 16, padding: "12px", borderRadius: 10,
            background: COLORES.navy, color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
          }}>← Volver al panel</button>
        )}
      </div>
    </div>
  );
}

// ── Carnet visual (para pantalla) ────────────────────────────────
function CarnetVisual({ afiliado }) {
  const hoy = new Date();
  const vigente = afiliado.activo && new Date(afiliado.vence) >= hoy;
  const qrUrl = `${BASE_URL}/?verificar=${afiliado.id}`;

  return (
    <div style={{ width: 320, borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", fontFamily: "Georgia, serif" }}>
      <div style={{ background: COLORES.navy, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORES.gold, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: COLORES.navy }}>C</div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, letterSpacing: 2 }}>CACITUS</div>
          <div style={{ color: COLORES.gold, fontSize: 8, letterSpacing: 1 }}>CÁMARA DE COMERCIO · SARCHÍ</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 9, color: "rgba(255,255,255,0.6)", textAlign: "right", lineHeight: 1.5 }}>CARNET<br />AFILIADO</div>
      </div>

      <div style={{ background: "#fff", padding: "16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: COLORES.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
          {afiliado.nombre.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: COLORES.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{afiliado.nombre}</div>
          <div style={{ fontSize: 11, color: COLORES.textLight, marginTop: 2 }}>{afiliado.comercio}</div>
          <div style={{ display: "inline-block", marginTop: 6, padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: vigente ? "#dcfce7" : "#fee2e2", color: vigente ? COLORES.green : COLORES.red }}>
            {vigente ? "● ACTIVO" : "● INACTIVO"}
          </div>
        </div>
      </div>

      <div style={{ background: COLORES.grayLight, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, borderTop: `1px solid ${COLORES.grayMid}` }}>
        <div style={{ border: `2px solid ${COLORES.navy}`, borderRadius: 6, padding: 3, background: "#fff" }}>
          <QRCode text={qrUrl} size={68} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: COLORES.textLight }}>Código de afiliado</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: COLORES.navy, letterSpacing: 2, marginTop: 2 }}>{afiliado.id}</div>
          <div style={{ fontSize: 9, color: COLORES.textLight, marginTop: 2 }}>
            Vence: {new Date(afiliado.vence + "T00:00:00").toLocaleDateString("es-CR")}
          </div>
        </div>
      </div>

      <div style={{ background: COLORES.navy, padding: "6px 16px", textAlign: "center", fontSize: 8, color: COLORES.gold, letterSpacing: 1 }}>
        Escanee el QR para verificar vigencia en tiempo real
      </div>
    </div>
  );
}

// ── Carnet con botón de descarga ─────────────────────────────────
function CarnetConDescarga({ afiliado, onSimular }) {
  const [descargando, setDescargando] = useState(false);
  const hoy = new Date();
  const vigente = afiliado.activo && new Date(afiliado.vence) >= hoy;

  async function descargar() {
    setDescargando(true);
    try {
      const dataUrl = await generarImagenCarnet(afiliado, vigente);
      const link = document.createElement("a");
      link.download = `carnet-${afiliado.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
      alert("No se pudo generar la imagen. Intente de nuevo.");
    }
    setDescargando(false);
  }

  return (
    <div>
      <CarnetVisual afiliado={afiliado} />
      <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "center" }}>
        <button onClick={descargar} disabled={descargando} style={{
          padding: "8px 16px", borderRadius: 8, border: "none",
          background: descargando ? "#94a3b8" : COLORES.green,
          color: "#fff", fontSize: 12, fontWeight: 600,
          cursor: descargando ? "wait" : "pointer",
        }}>
          {descargando ? "⏳ Generando..." : "⬇️ Descargar imagen"}
        </button>
        <button onClick={() => onSimular(afiliado)} style={{
          padding: "8px 16px", borderRadius: 8, border: "none",
          background: COLORES.navy, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}>
          🔍 Simular QR
        </button>
      </div>
    </div>
  );
}

function btnIconStyle(bg, color) {
  return { width: 32, height: 32, borderRadius: 8, border: "none", background: bg, color, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" };
}

// ── App principal ────────────────────────────────────────────────
export default function App() {
  const [afiliados, setAfiliados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("lista");
  const [busqueda, setBusqueda] = useState("");
  const [verCarnet, setVerCarnet] = useState(null);
  const [codigoVerif, setCodigoVerif] = useState("");
  const [resultadoVerif, setResultadoVerif] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codigo = params.get("verificar");
    cargarAfiliados(codigo);
  }, []);

  async function cargarAfiliados(codigoDirecto) {
    try {
      setCargando(true);
      setError(null);
      const res = await fetch(SHEETS_URL);
      const texto = await res.text();
      const datos = parsearCSV(texto);
      setAfiliados(datos);
      if (codigoDirecto) {
        const encontrado = datos.find((a) => a.id.toUpperCase() === codigoDirecto.toUpperCase());
        if (encontrado) setVerCarnet(encontrado);
      }
    } catch (e) {
      setError("No se pudo cargar la base de datos.");
    } finally {
      setCargando(false);
    }
  }

  const esVistaQR = new URLSearchParams(window.location.search).get("verificar");

  if (verCarnet && esVistaQR) return <VistaVerificacion afiliado={verCarnet} onVolver={null} />;
  if (verCarnet) return <VistaVerificacion afiliado={verCarnet} onVolver={() => setVerCarnet(null)} />;

  const hoy = new Date();
  const filtrados = afiliados.filter((a) =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.id.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.comercio.toLowerCase().includes(busqueda.toLowerCase())
  );
  const activos = afiliados.filter((a) => a.activo && new Date(a.vence) >= hoy).length;

  function verificar() {
    const encontrado = afiliados.find((a) => a.id.toUpperCase() === codigoVerif.toUpperCase().trim());
    setResultadoVerif(encontrado || "no_encontrado");
  }

  const btnTab = (key, label) => (
    <button onClick={() => setTab(key)} style={{
      flex: 1, padding: "10px 0", border: "none", cursor: "pointer",
      fontWeight: tab === key ? 700 : 400, fontSize: 13,
      background: tab === key ? COLORES.navy : "#e9eef5",
      color: tab === key ? "#fff" : COLORES.textLight, borderRadius: 8,
    }}>{label}</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: COLORES.grayLight, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: COLORES.navy, padding: "16px 24px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 3px 12px rgba(0,0,0,0.25)" }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: COLORES.gold, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20, color: COLORES.navy }}>C</div>
        <div>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, letterSpacing: 3 }}>CACITUS</div>
          <div style={{ color: COLORES.gold, fontSize: 9, letterSpacing: 1.5 }}>SISTEMA DE CARNETS DIGITALES</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{afiliados.length} afiliados</div>
          <div style={{ color: COLORES.green, fontSize: 11, fontWeight: 600 }}>{activos} activos</div>
        </div>
      </div>

      <div style={{ padding: "16px 20px 0", display: "flex", gap: 8 }}>
        {btnTab("lista", "👥 Afiliados")}
        {btnTab("verificar", "🔍 Verificar")}
        {btnTab("carnets", "🪪 Carnets")}
      </div>

      <div style={{ padding: "16px 20px", maxWidth: 960, margin: "0 auto" }}>
        {cargando && (
          <div style={{ textAlign: "center", padding: 60, color: COLORES.textLight }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
            Cargando afiliados desde Google Sheets...
          </div>
        )}
        {error && (
          <div style={{ background: "#fee2e2", borderRadius: 12, padding: 20, color: COLORES.red, textAlign: "center" }}>
            ⚠️ {error}
            <br />
            <button onClick={() => cargarAfiliados(null)} style={{ marginTop: 12, padding: "8px 20px", borderRadius: 8, border: "none", background: COLORES.navy, color: "#fff", cursor: "pointer" }}>Reintentar</button>
          </div>
        )}

        {!cargando && !error && (
          <>
            {tab === "lista" && (
              <div>
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  <input
                    placeholder="Buscar por nombre, código o comercio..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORES.grayMid}`, fontSize: 14, outline: "none" }}
                  />
                  <button onClick={() => cargarAfiliados(null)} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: COLORES.navy, color: "#fff", fontWeight: 700, cursor: "pointer" }}>🔄</button>
                </div>
                <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  {filtrados.map((a, i) => {
                    const vigente = a.activo && new Date(a.vence) >= hoy;
                    return (
                      <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: i < filtrados.length - 1 ? `1px solid ${COLORES.grayMid}` : "none" }}>
                        <div style={{ width: 42, height: 42, borderRadius: "50%", background: vigente ? COLORES.navy : "#cbd5e0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                          {a.nombre.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: COLORES.text }}>{a.nombre}</div>
                          <div style={{ fontSize: 12, color: COLORES.textLight }}>{a.comercio}</div>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: COLORES.navy, background: COLORES.grayLight, padding: "3px 10px", borderRadius: 6, letterSpacing: 1 }}>{a.id}</div>
                        <div style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: vigente ? "#dcfce7" : "#fee2e2", color: vigente ? COLORES.green : COLORES.red, minWidth: 72, textAlign: "center" }}>
                          {vigente ? "✓ Activo" : "✗ Inactivo"}
                        </div>
                        <button onClick={() => setVerCarnet(a)} title="Ver verificación" style={btnIconStyle("#e0f2fe", "#0369a1")}>🪪</button>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: COLORES.textLight, textAlign: "center" }}>
                  📊 Datos desde Google Sheets · Edite la planilla para hacer cambios
                </div>
              </div>
            )}

            {tab === "verificar" && (
              <div style={{ maxWidth: 480, margin: "0 auto" }}>
                <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: COLORES.navy, marginBottom: 6 }}>Verificar afiliado</div>
                  <div style={{ fontSize: 13, color: COLORES.textLight, marginBottom: 20 }}>Ingrese el código del carnet para verificar su vigencia</div>
                  <input
                    placeholder="Ej: AF-941645"
                    value={codigoVerif}
                    onChange={(e) => { setCodigoVerif(e.target.value); setResultadoVerif(null); }}
                    onKeyDown={(e) => e.key === "Enter" && verificar()}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `2px solid ${COLORES.grayMid}`, fontSize: 16, outline: "none", boxSizing: "border-box", letterSpacing: 2, fontWeight: 600 }}
                  />
                  <button onClick={verificar} style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 10, border: "none", background: COLORES.navy, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                    Verificar →
                  </button>
                  {resultadoVerif && (
                    <div style={{ marginTop: 20 }}>
                      {resultadoVerif === "no_encontrado" ? (
                        <div style={{ background: "#fee2e2", borderRadius: 12, padding: 16, textAlign: "center", color: COLORES.red, fontWeight: 600 }}>✗ Código no encontrado</div>
                      ) : (() => {
                        const v = resultadoVerif.activo && new Date(resultadoVerif.vence) >= hoy;
                        return (
                          <div style={{ borderRadius: 12, overflow: "hidden", border: `2px solid ${v ? COLORES.green : COLORES.red}` }}>
                            <div style={{ background: v ? COLORES.green : COLORES.red, padding: "12px 16px", color: "#fff", fontWeight: 700, fontSize: 16, textAlign: "center" }}>
                              {v ? "✓ AFILIADO ACTIVO" : "✗ AFILIADO INACTIVO"}
                            </div>
                            <div style={{ background: "#fff", padding: 16 }}>
                              <div style={{ fontWeight: 700, fontSize: 16 }}>{resultadoVerif.nombre}</div>
                              <div style={{ color: COLORES.textLight, fontSize: 13, marginTop: 2 }}>{resultadoVerif.comercio}</div>
                              <div style={{ fontSize: 12, color: COLORES.textLight, marginTop: 4 }}>📞 {resultadoVerif.telefono}</div>
                              <div style={{ fontSize: 12, color: COLORES.textLight, marginTop: 4 }}>Vence: {new Date(resultadoVerif.vence + "T00:00:00").toLocaleDateString("es-CR")}</div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "carnets" && (
              <div>
                <div style={{ fontSize: 13, color: COLORES.textLight, marginBottom: 16, background: "#fff", padding: "10px 16px", borderRadius: 10, border: `1px solid ${COLORES.grayMid}` }}>
                  💡 Descargue cada carnet como imagen y envíelo por WhatsApp. El QR lleva al comercio a la verificación en tiempo real.
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 28, justifyContent: "center" }}>
                  {afiliados.map((a) => (
                    <CarnetConDescarga key={a.id} afiliado={a} onSimular={setVerCarnet} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
