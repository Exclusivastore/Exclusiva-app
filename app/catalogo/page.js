"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function Catalogo() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [modalProduct, setModalProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError(
        "No se pudo cargar el catálogo. Revisa que las variables de Supabase estén configuradas."
      );
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }

  const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.category)))];
  const shown =
    activeFilter === "Todos" ? products : products.filter((p) => p.category === activeFilter);

  return (
    <div className="wrap">
      <header>
        <div>
          <div className="logo">
            Exclu<span>siva</span>
          </div>
          <div className="tagline">Catálogo · Colección 2026</div>
        </div>
        <nav>
          <Link className="navbtn" href="/admin/">
            Administrador
          </Link>
        </nav>
      </header>

      {error && <div className="err">{error}</div>}

      {loading ? (
        <div className="loading">Cargando catálogo...</div>
      ) : (
        <>
          <div className="filters">
            {categories.map((c) => (
              <button
                key={c}
                className={`chip ${c === activeFilter ? "active" : ""}`}
                onClick={() => setActiveFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <div className="empty">
              Todavía no hay productos {activeFilter !== "Todos" ? <>en <b>{activeFilter}</b></> : "en el catálogo"}.
            </div>
          ) : (
            <div className="gallery">
              {shown.map((p, i) => (
                <div
                  key={p.id}
                  className="tag-card"
                  style={{ "--r": `${i % 2 === 0 ? -1.5 : 1.5}deg` }}
                  onClick={() => setModalProduct(p)}
                >
                  <div className="hole"></div>
                  <img className="photo" src={p.image_url} alt={p.name} />
                  <span className="cat">{p.category}</span>
                  <h3>{p.name}</h3>
                  <p className="desc">{p.description}</p>
                  <div className="price">
                    <span>{p.price || "—"}</span>
                    <span>Ver →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {modalProduct && (
        <div className="modal-bg" onClick={() => setModalProduct(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-x" onClick={() => setModalProduct(null)}>
              ✕
            </button>
            <img src={modalProduct.image_url} alt={modalProduct.name} />
            <span className="cat">{modalProduct.category}</span>
            <h2>{modalProduct.name}</h2>
            <div className="price">{modalProduct.price}</div>
            <p>{modalProduct.description || "Sin descripción."}</p>
          </div>
        </div>
      )}
    </div>
  );
}
