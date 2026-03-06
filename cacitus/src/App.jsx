import { useState } from "react";

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

const AFILIADOS_DEMO = [
  {
    id: "CAC-001",
    nombre: "Juan Carlos Mora Vega",
    comercio: "Artesanías La Ceiba",
    telefono: "8888-0001",
    activo: true,
    vence: "2025-12-31",
  },
  {
    id: "CAC-002",
    nombre: "María Fernanda Solís Cruz",
    comercio: "Restaurante El Sarchí",
    telefono: "8888-0002",
    activo: true,
    vence: "2025-06-30",
  },
  {
    id: "CAC-003",
    nombre: "Roberto Jiménez Araya",
    comercio: "Taller Maderas Finas",
    telefono: "8888-0003",
    activo: false,
    vence: "2024-12-31",
  },
];

function QRDecorativo({ size = 80, color = "#0d1b3e" }) {
  const b = "#ffffff";
  return (
    <svg width={size} height={size} viewBox="0 0 21 21">
      <rect width="21" height="21" fill={b} />
      <rect x="1" y="1" width="7" height="7" rx="1" fill={color} />
      <rect x="2" y="2" width="5" height="5" fill={b} />
      <rect x="3" y="3" width="3" height="3" fill={color} />
      <rect x="13" y="1" width="7" height="7" rx="1" fill={color} />
      <rect x="14" y="2" width="5" height="5" fill={b} />
      <rect x="15" y="3" width="3" height="3" fill={color} />
      <rect x="1" y="13" width="7" height="7" rx="1" fill={color} />
      <rect x="2" y="14" width="5" height="5" fill={b} />
      <rect x="3" y="15" width="3" height="3" fill={color} />
      <rect x="9" y="1" width="2" height="2" fill={color} />
      <rect x="9" y="4" width="2" height="2" fill={color} />
      <rect x="9" y="7" width="2" height="2" fill={color} />
      <rect x="12" y="9" width="2" height="2" fill={color} />
      <rect x="9" y="9" width="2" height="2" fill={color} />
      <rect x="12" y="12" width="4" height="2" fill={color} />
      <rect x="16" y="12" width="2" height="2" fill={color} />
      <rect x="9" y="12" width="2" height="2" fill={color} />
      <rect x="9" y="15" width="2" height="2" fill={color} />
      <rect x="12" y="15" width="2" height="2" fill={color} />
      <rect x="15" y="16" width="3" height="3" fill={color} />
      <rect x="9" y="18" width="2" height="2" fill={color} />
    </svg>
  );
}

function VistaVerificacion({ afiliado, onVolver }) {
  const hoy = new Date();
  const vence = new Date(afiliado.vence);
  const vigente = afiliado.activo && vence >= hoy;

  return (
    <div style={{ minHeight: "100vh", background: COLORES.grayLight, fontFamily: "Georgia, serif" }}>
      <div style={{
        background: COLORES.navy, padding: "20px 24px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: COLORES.gold,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 900, fontSize: 20, color: COLORES.navy,
        }}>C</div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: 2 }}>CACITUS</div>
          <div style={{ color: COLORES.gold, fontSize: 10, letterSpacing: 1 }}>
            CÁMARA DE COMERCIO · SARCHÍ
          </div>
        </div>
      </div>

      <div style={{
        background: vigente ? COLORES.green : COLORES.red,
        padding: "20px", textAlign: "center",
      }}>
        <div style={{ fontSize: 48 }}>{vigente ? "✓" : "✗"}</div>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 22, letterSpacing: 2, marginTop: 4 }}>
          {vigente ? "AFILIADO ACTIVO" : "AFILIADO INACTIVO"}
        </div>
        <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 }}>
          {vigente ? "Beneficios vigentes" : "Sin beneficios activos"}
        </div>
      </div>

      <div style={{ padding: "24px 20px", maxWidth: 420, margin: "0 auto" }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: "20px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: COLORES.navy,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px",
              fontSize: 28, color: "#fff", fontWeight: 700,
            }}>
              {afiliado.nombre.charAt(0)}
            </div>
            <div style={{ fontWeight: 700, fontSize: 20, color: COLORES.text }}>
              {afiliado.nombre}
            </div>
            <div style={{ color: COLORES.textLight, fontSize: 14, marginTop: 4 }}>
              {afiliado.comercio}
            </div>
          </div>

          {[
            ["Código", afiliado.id],
            ["Vence", new Date(afiliado.vence + "T00:00:00").toLocaleDateString("es-CR", { day: "2-digit", month: "long", year: "numeric" })],
            ["Estado", vigente ? "Activo" : "Inactivo"],
          ].map(([label, val]) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between",
              padding: "10px 0", borderBottom: `1px solid ${COLORES.grayMid}`, fontSize: 14,
            }}>
              <span style={{ color: COLORES.textLight }}>{label}</span>
              <span style={{
                fontWeight: 600,
                color: label === "Estado" ? (vigente ? COLORES.green : COLORES.red) : COLORES.text,
              }}>{val}</span>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 16, background: "#fff", borderRadius: 12,
          padding: "12px 16px", fontSize: 11, color: COLORES.textLight,
          textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}>
          Verificación en tiempo real · CACITUS · Sarchí, Costa Rica
        </div>

        <button onClick={onVolver} style={{
          display: "block", width: "100%", marginTop: 16,
          padding: "12px", borderRadius: 10,
          background: COLORES.navy, color: "#fff",
          border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
        }}>
          ← Volver al panel
        </button>
      </div>
    </div>
  );
}

function CarnetVisual({ afiliado }) {
  const hoy = new Date();
  const vence = new Date(afiliado.vence);
  const vigente = afiliado.activo && vence >= hoy;

  return (
    <div style={{
      width: 320, borderRadius: 16, overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      fontFamily: "Georgia, serif",
    }}>
      <div style={{
        background: COLORES.navy, padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: COLORES.gold,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 900, fontSize: 16, color: COLORES.navy,
        }}>C</div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, letterSpacing: 2 }}>CACITUS</div>
          <div style={{ color: COLORES.gold, fontSize: 8, letterSpacing: 1 }}>CÁMARA DE COMERCIO · SARCHÍ</div>
        </div>
        <div style={{
          marginLeft: "auto", fontSize: 9,
          color: "rgba(255,255,255,0.6)", textAlign: "right", lineHeight: 1.5,
        }}>
          CARNET<br />AFILIADO
        </div>
      </div>

      <div style={{ background: "#fff", padding: "16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: COLORES.navy,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, color: "#fff", fontWeight: 700, flexShrink: 0,
        }}>
          {afiliado.nombre.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: 14, color: COLORES.text,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {afiliado.nombre}
          </div>
          <div style={{ fontSize: 11, color: COLORES.textLight, marginTop: 2 }}>
            {afiliado.comercio}
          </div>
          <div style={{
            display: "inline-block", marginTop: 6,
            padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700,
            background: vigente ? "#dcfce7" : "#fee2e2",
            color: vigente ? COLORES.green : COLORES.red,
          }}>
            {vigente ? "● ACTIVO" : "● INACTIVO"}
          </div>
        </div>
      </div>

      <div style={{
        background: COLORES.grayLight, padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 14,
        borderTop: `1px solid ${COLORES.grayMid}`,
      }}>
        <div style={{ border: `2px solid ${COLORES.navy}`, borderRadius: 6, padding: 3 }}>
          <QRDecorativo size={64} color={COLORES.navy} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: COLORES.textLight }}>Código de afiliado</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: COLORES.navy, letterSpacing: 2, marginTop: 2 }}>
            {afiliado.id}
          </div>
          <div style={{ fontSize: 9, color: COLORES.textLight, marginTop: 2 }}>
            Vence: {new Date(afiliado.vence + "T00:00:00").toLocaleDateString("es-CR")}
          </div>
        </div>
      </div>

      <div style={{
        background: COLORES.navy, padding: "6px 16px",
        textAlign: "center", fontSize: 8, color: COLORES.gold, letterSpacing: 1,
      }}>
        Escanee el QR para verificar vigencia en tiempo real
      </div>
    </div>
  );
}

function btnIconStyle(bg, color) {
  return {
    width: 32, height: 32, borderRadius: 8, border: "none",
    background: bg, color, cursor: "pointer", fontSize: 14,
    display: "flex", alignItems: "center", justifyContent: "center",
  };
}

export default function App() {
  const [afiliados, setAfiliados] = useState(AFILIADOS_DEMO);
  const [tab, setTab] = useState("lista");
  const [busqueda, setBusqueda] = useState("");
  const [verCarnet, setVerCarnet] = useState(null);
  const [codigoVerif, setCodigoVerif] = useState("");
  const [resultadoVerif, setResultadoVerif] = useState(null);
  const [editando, setEditando] = useState(null);
  const [nuevo, setNuevo] = useState(false);
  const [form, setForm] = useState({ nombre: "", comercio: "", telefono: "", vence: "", activo: true });

  if (verCarnet) {
    return <VistaVerificacion afiliado={verCarnet} onVolver={() => setVerCarnet(null)} />;
  }

  const hoy = new Date();
  const filtrados = afiliados.filter(a =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.id.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.comercio.toLowerCase().includes(busqueda.toLowerCase())
  );

  function toggleActivo(id) {
    setAfiliados(prev => prev.map(a => a.id === id ? { ...a, activo: !a.activo } : a));
  }

  function eliminar(id) {
    if (confirm("¿Eliminar este afiliado?")) {
      setAfiliados(prev => prev.filter(a => a.id !== id));
    }
  }

  function abrirEditar(a) {
    setForm({ nombre: a.nombre, comercio: a.comercio, telefono: a.telefono, vence: a.vence, activo: a.activo });
    setEditando(a.id);
    setNuevo(false);
  }

  function abrirNuevo() {
    const nextNum = afiliados.length + 1;
    const nextId = "CAC-" + String(nextNum).padStart(3, "0");
    setForm({ id: nextId, nombre: "", comercio: "", telefono: "", vence: "", activo: true });
    setNuevo(true);
    setEditando(null);
  }

  function guardar() {
    if (!form.nombre || !form.comercio || !form.vence) return alert("Complete todos los campos obligatorios");
    if (nuevo) {
      setAfiliados(prev => [...prev, { ...form }]);
    } else {
      setAfiliados(prev => prev.map(a => a.id === editando ? { ...a, ...form } : a));
    }
    setEditando(null);
    setNuevo(false);
  }

  function verificar() {
    const encontrado = afiliados.find(a => a.id.toUpperCase() === codigoVerif.toUpperCase().trim());
    setResultadoVerif(encontrado || "no_encontrado");
  }

  const btnTab = (key, label) => (
    <button onClick={() => setTab(key)} style={{
      flex: 1, padding: "10px 0", border: "none", cursor: "pointer",
      fontWeight: tab === key ? 700 : 400, fontSize: 13,
      background: tab === key ? COLORES.navy : "#e9eef5",
      color: tab === key ? "#fff" : COLORES.textLight,
      borderRadius: 8, transition: "all 0.15s",
    }}>
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: COLORES.grayLight, fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{
        background: COLORES.navy, padding: "16px 24px",
        display: "flex", alignItems: "center", gap: 12,
        boxShadow: "0 3px 12px rgba(0,0,0,0.25)",
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: "50%", background: COLORES.gold,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 900, fontSize: 20, color: COLORES.navy,
        }}>C</div>
        <div>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, letterSpacing: 3 }}>CACITUS</div>
          <div style={{ color: COLORES.gold, fontSize: 9, letterSpacing: 1.5 }}>SISTEMA DE CARNETS DIGITALES</div>
        </div>
        <div style={{ marginLeft: "auto", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
          {afiliados.length} afiliados
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "16px 20px 0", display: "flex", gap: 8 }}>
        {btnTab("lista", "👥 Afiliados")}
        {btnTab("verificar", "🔍 Verificar")}
        {btnTab("carnets", "🪪 Carnets")}
      </div>

      <div style={{ padding: "16px 20px", maxWidth: 960, margin: "0 auto" }}>

        {/* TAB: Lista */}
        {tab === "lista" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <input
                placeholder="Buscar por nombre, código o comercio..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 10,
                  border: `1px solid ${COLORES.grayMid}`, fontSize: 14, outline: "none",
                }}
              />
              <button onClick={abrirNuevo} style={{
                padding: "10px 18px", borderRadius: 10, border: "none",
                background: COLORES.green, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14,
              }}>
                + Nuevo
              </button>
            </div>

            {(editando || nuevo) && (
              <div style={{
                background: "#fff", borderRadius: 14, padding: 20,
                marginBottom: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                border: `2px solid ${COLORES.gold}`,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 14, color: COLORES.navy, fontSize: 16 }}>
                  {nuevo ? "➕ Nuevo Afiliado" : "✏️ Editar Afiliado"}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    ["Nombre completo", "nombre", "text"],
                    ["Comercio / Empresa", "comercio", "text"],
                    ["Teléfono", "telefono", "text"],
                    ["Fecha de vencimiento", "vence", "date"],
                  ].map(([label, field, type]) => (
                    <div key={field}>
                      <div style={{ fontSize: 12, color: COLORES.textLight, marginBottom: 4 }}>{label}</div>
                      <input
                        type={type}
                        value={form[field]}
                        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                        style={{
                          width: "100%", padding: "8px 12px", borderRadius: 8,
                          border: `1px solid ${COLORES.grayMid}`, fontSize: 14,
                          outline: "none", boxSizing: "border-box",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                  <input type="checkbox" id="activo" checked={form.activo}
                    onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))} />
                  <label htmlFor="activo" style={{ fontSize: 13, color: COLORES.text }}>Afiliado activo</label>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button onClick={guardar} style={{
                    padding: "9px 20px", borderRadius: 8, border: "none",
                    background: COLORES.navy, color: "#fff", fontWeight: 700, cursor: "pointer",
                  }}>Guardar</button>
                  <button onClick={() => { setEditando(null); setNuevo(false); }} style={{
                    padding: "9px 20px", borderRadius: 8, border: "none",
                    background: COLORES.grayMid, color: COLORES.text, cursor: "pointer",
                  }}>Cancelar</button>
                </div>
              </div>
            )}

            <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              {filtrados.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: COLORES.textLight }}>
                  No se encontraron afiliados
                </div>
              ) : filtrados.map((a, i) => {
                const vigente = a.activo && new Date(a.vence) >= hoy;
                return (
                  <div key={a.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 18px",
                    borderBottom: i < filtrados.length - 1 ? `1px solid ${COLORES.grayMid}` : "none",
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: "50%",
                      background: vigente ? COLORES.navy : "#cbd5e0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0,
                    }}>
                      {a.nombre.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: COLORES.text }}>{a.nombre}</div>
                      <div style={{ fontSize: 12, color: COLORES.textLight }}>{a.comercio}</div>
                    </div>
                    <div style={{
                      fontSize: 12, fontWeight: 700, color: COLORES.navy,
                      background: COLORES.grayLight, padding: "3px 10px", borderRadius: 6, letterSpacing: 1,
                    }}>{a.id}</div>
                    <div style={{
                      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: vigente ? "#dcfce7" : "#fee2e2",
                      color: vigente ? COLORES.green : COLORES.red,
                      minWidth: 72, textAlign: "center",
                    }}>
                      {vigente ? "✓ Activo" : "✗ Inactivo"}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setVerCarnet(a)} title="Ver carnet" style={btnIconStyle("#e0f2fe", "#0369a1")}>🪪</button>
                      <button onClick={() => abrirEditar(a)} title="Editar" style={btnIconStyle("#fef9c3", "#854d0e")}>✏️</button>
                      <button onClick={() => toggleActivo(a.id)} title="Cambiar estado" style={btnIconStyle("#f0fdf4", "#15803d")}>
                        {a.activo ? "⏸" : "▶"}
                      </button>
                      <button onClick={() => eliminar(a.id)} title="Eliminar" style={btnIconStyle("#fee2e2", "#991b1b")}>🗑</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: Verificar */}
        {tab === "verificar" && (
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <div style={{
              background: "#fff", borderRadius: 16, padding: 28,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: COLORES.navy, marginBottom: 6 }}>
                Verificar afiliado
              </div>
              <div style={{ fontSize: 13, color: COLORES.textLight, marginBottom: 20 }}>
                Ingrese el código del carnet para verificar su vigencia
              </div>
              <input
                placeholder="Ej: CAC-001"
                value={codigoVerif}
                onChange={e => { setCodigoVerif(e.target.value); setResultadoVerif(null); }}
                onKeyDown={e => e.key === "Enter" && verificar()}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 10,
                  border: `2px solid ${COLORES.grayMid}`, fontSize: 16,
                  outline: "none", boxSizing: "border-box",
                  letterSpacing: 2, fontWeight: 600,
                }}
              />
              <button onClick={verificar} style={{
                width: "100%", marginTop: 12, padding: "12px", borderRadius: 10,
                border: "none", background: COLORES.navy, color: "#fff",
                fontWeight: 700, fontSize: 15, cursor: "pointer",
              }}>
                Verificar →
              </button>

              {resultadoVerif && (
                <div style={{ marginTop: 20 }}>
                  {resultadoVerif === "no_encontrado" ? (
                    <div style={{
                      background: "#fee2e2", borderRadius: 12, padding: 16,
                      textAlign: "center", color: COLORES.red, fontWeight: 600,
                    }}>
                      ✗ Código no encontrado
                    </div>
                  ) : (() => {
                    const vigente = resultadoVerif.activo && new Date(resultadoVerif.vence) >= hoy;
                    return (
                      <div style={{
                        borderRadius: 12, overflow: "hidden",
                        border: `2px solid ${vigente ? COLORES.green : COLORES.red}`,
                      }}>
                        <div style={{
                          background: vigente ? COLORES.green : COLORES.red,
                          padding: "12px 16px", color: "#fff",
                          fontWeight: 700, fontSize: 16, textAlign: "center",
                        }}>
                          {vigente ? "✓ AFILIADO ACTIVO" : "✗ AFILIADO INACTIVO"}
                        </div>
                        <div style={{ background: "#fff", padding: 16 }}>
                          <div style={{ fontWeight: 700, fontSize: 16 }}>{resultadoVerif.nombre}</div>
                          <div style={{ color: COLORES.textLight, fontSize: 13, marginTop: 2 }}>{resultadoVerif.comercio}</div>
                          <div style={{ fontSize: 12, color: COLORES.textLight, marginTop: 8 }}>
                            Vence: {new Date(resultadoVerif.vence + "T00:00:00").toLocaleDateString("es-CR")}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Carnets */}
        {tab === "carnets" && (
          <div>
            <div style={{
              fontSize: 13, color: COLORES.textLight, marginBottom: 16,
              background: "#fff", padding: "10px 16px", borderRadius: 10,
              border: `1px solid ${COLORES.grayMid}`,
            }}>
              💡 Cada carnet tiene un QR único. Al escanearlo, el comercio ve el estado actual del afiliado en tiempo real.
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
              {afiliados.map(a => (
                <div key={a.id}>
                  <CarnetVisual afiliado={a} />
                  <div style={{ textAlign: "center", marginTop: 10 }}>
                    <button onClick={() => setVerCarnet(a)} style={{
                      padding: "7px 18px", borderRadius: 8, border: "none",
                      background: COLORES.navy, color: "#fff",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}>
                      Simular escaneo QR →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
