"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function Admin() {
  const [session, setSession] = useState(undefined); // undefined = cargando, null = sin sesión
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Mujer");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) loadProducts();
  }, [session]);

  async function loadProducts() {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setProducts(data || []);
    setLoadingProducts(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("Correo o contraseña incorrectos.");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !file) {
      alert("Falta el nombre o la foto del producto.");
      return;
    }
    setSaving(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase.from("products").insert({
        name: name.trim(),
        description: desc.trim(),
        price: price.trim(),
        category,
        image_url: publicUrlData.publicUrl,
      });
      if (insertError) throw insertError;

      setName("");
      setDesc("");
      setPrice("");
      setCategory("Mujer");
      setFile(null);
      setPreview(null);
      e.target.reset();
      await loadProducts();
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar el producto: " + err.message);
    }
    setSaving(false);
  }

  async function handleDelete(id, imageUrl) {
    if (!confirm("¿Eliminar este producto del catálogo?")) return;

    // Borra primero el registro del producto
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      alert("No se pudo eliminar.");
      return;
    }

    // Luego borra también la foto del almacenamiento, para no dejar archivos sueltos
    try {
      const marker = "/product-images/";
      const idx = imageUrl.indexOf(marker);
      if (idx !== -1) {
        const fileName = imageUrl.slice(idx + marker.length);
        await supabase.storage.from("product-images").remove([fileName]);
      }
    } catch (err) {
      // Si esto falla, el producto ya se borró igual; solo queda una foto huérfana.
      console.warn("No se pudo borrar la foto del almacenamiento:", err);
    }

    loadProducts();
  }

  if (session === undefined) {
    return <div className="loading">Cargando...</div>;
  }

  if (!session) {
    return (
      <div className="wrap">
        <div className="login-box">
          <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600 }}>
            Acceso administrador
          </h2>
          <p>Ingresa con la cuenta que creaste en Supabase para administrar Exclusiva.</p>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {loginError && <div className="err">{loginError}</div>}
            <div style={{ marginTop: 10 }}>
              <button className="btn" type="submit">
                Entrar
              </button>
            </div>
          </form>
          <p className="note">
            ¿No tienes cuenta todavía? Créala desde el panel de Supabase en Authentication → Users
            → Add user.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <header>
        <div>
          <div className="logo">
            Exclu<span>siva</span>
          </div>
          <div className="tagline">Panel de administrador</div>
        </div>
        <nav>
          <Link className="navbtn" href="/catalogo/">
            Ver catálogo público
          </Link>
        </nav>
      </header>

      <div className="panel">
        <h2>Subir nuevo producto</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid-form">
            <div className="field full">
              <label>Foto del producto</label>
              <div
                className="file-drop"
                onClick={() => document.getElementById("fileInput").click()}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="preview" />
                    <div>Cambiar foto</div>
                  </>
                ) : (
                  "Haz clic para elegir una foto"
                )}
              </div>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
            <div className="field">
              <label>Nombre</label>
              <input
                type="text"
                placeholder="Camisa de lino"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Precio</label>
              <input
                type="text"
                placeholder="S/ 89.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Categoría</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Mujer</option>
                <option>Hombre</option>
                <option>Niños</option>
                <option>Accesorios</option>
              </select>
            </div>
            <div className="field full">
              <label>Descripción</label>
              <textarea
                placeholder="Tela, tallas disponibles, detalles..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>
          <div className="panel-actions">
            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Publicar producto"}
            </button>
            <button className="btn btn-ghost" type="button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <h2>Productos publicados ({products.length})</h2>
        {loadingProducts ? (
          <div className="loading">Cargando...</div>
        ) : products.length === 0 ? (
          <p className="note">Aún no has publicado nada.</p>
        ) : (
          products.map((p) => (
            <div className="admin-row" key={p.id}>
              <img src={p.image_url} alt={p.name} />
              <div className="meta">
                <b>{p.name}</b>
                <small>
                  {p.category} {p.price ? "· " + p.price : ""}
                </small>
              </div>
              <button className="del" onClick={() => handleDelete(p.id, p.image_url)}>
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
