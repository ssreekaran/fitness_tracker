import React, { useMemo, useState } from "react";
import "./HealthyFood.css";

type Resource = { name: string; url: string; desc: string; tag: string };

const healthyLinks: Resource[] = [
  { name: "Harvard Healthy Eating Plate", url: "https://www.hsph.harvard.edu/nutritionsource/healthy-eating-plate/", desc: "A visual guide to balanced eating from Harvard's School of Public Health.", tag: "Guides" },
  { name: "American Heart Association: Healthy Eating", url: "https://www.heart.org/en/healthy-living/healthy-eating", desc: "Heart-healthy food tips and recipes from the AHA.", tag: "Heart Health" },
  { name: "ChooseMyPlate.gov", url: "https://www.myplate.gov/", desc: "USDA's guide to building a healthy plate for every meal.", tag: "Government" },
  { name: "Mayo Clinic Healthy Diet", url: "https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating", desc: "Practical healthy eating advice from Mayo Clinic experts.", tag: "Medical" },
  { name: "CDC Nutrition", url: "https://www.cdc.gov/nutrition/index.html", desc: "Nutrition basics and resources from the CDC.", tag: "Government" }
];

const HealthyFood: React.FC = () => {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>("All");

  const tags = useMemo(() => ["All", ...Array.from(new Set(healthyLinks.map(l => l.tag)))], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return healthyLinks.filter(l => {
      const matchesText = !q || l.name.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q);
      const matchesTag = activeTag === "All" || l.tag === activeTag;
      return matchesText && matchesTag;
    });
  }, [query, activeTag]);

  return (
    <div className="hf-container">
      <section className="hf-hero">
        <div>
          <h1 className="hf-title">Healthy Food Inspiration</h1>
          <p className="hf-subtitle">Curated resources from trusted health organizations to help you eat well every day.</p>
        </div>
        <div className="hf-search">
          <input
            className="hf-input"
            type="text"
            placeholder="Search resources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search healthy food resources"
          />
        </div>
        <div className="hf-tags">
          {tags.map(t => (
            <button
              key={t}
              className={`hf-tag ${activeTag === t ? "active" : ""}`}
              onClick={() => setActiveTag(t)}
              aria-pressed={activeTag === t}
            >{t}</button>
          ))}
        </div>
      </section>

      <section className="hf-grid">
        {filtered.map(link => (
          <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="hf-card">
            <div className="hf-card-content">
              <div className="hf-card-header">
                <h3 className="hf-card-title">{link.name}</h3>
                <span className="hf-badge">{link.tag}</span>
              </div>
              <p className="hf-card-desc">{link.desc}</p>
              <span className="hf-card-link">Visit resource →</span>
            </div>
          </a>
        ))}
        {filtered.length === 0 && (
          <div className="hf-empty">No resources match your search.</div>
        )}
      </section>
    </div>
  );
};

export default HealthyFood;
