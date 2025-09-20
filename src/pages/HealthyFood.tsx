import React, { useMemo, useState } from "react";
import "./HealthyFood.css";

type Resource = { name: string; url: string; desc: string; tag: string };

const healthyLinks: Resource[] = [
  { name: "Harvard Healthy Eating Plate", url: "https://www.hsph.harvard.edu/nutritionsource/healthy-eating-plate/", desc: "A visual guide to balanced eating from Harvard's School of Public Health.", tag: "Guides" },
  { name: "American Heart Association: Healthy Eating", url: "https://www.heart.org/en/healthy-living/healthy-eating", desc: "Heart-healthy food tips and recipes from the AHA.", tag: "Heart Health" },
  { name: "ChooseMyPlate.gov", url: "https://www.myplate.gov/", desc: "USDA's guide to building a healthy plate for every meal.", tag: "Government" },
  { name: "Mayo Clinic Healthy Diet", url: "https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating", desc: "Practical healthy eating advice from Mayo Clinic experts.", tag: "Medical" },
  { name: "CDC Nutrition", url: "https://www.cdc.gov/nutrition/index.html", desc: "Nutrition basics and resources from the CDC.", tag: "Government" },
  // Additional diverse and authoritative resources
  { name: "WHO: Nutrition", url: "https://www.who.int/health-topics/nutrition", desc: "Global guidance and fact sheets on nutrition from the World Health Organization.", tag: "Guides" },
  { name: "NHS: Healthy eating", url: "https://www.nhs.uk/live-well/eat-well/", desc: "UK National Health Service guidance on healthy eating and diet.", tag: "Government" },
  { name: "Academy of Nutrition and Dietetics", url: "https://www.eatright.org/health", desc: "Evidence-based articles on nutrition topics from registered dietitians.", tag: "Guides" },
  { name: "Oldways: Mediterranean Diet", url: "https://www.oldwayspt.org/traditional-diets/mediterranean-diet", desc: "Mediterranean diet pyramids, guides, and recipes.", tag: "Heart Health" },
  { name: "NHLBI: DASH Eating Plan", url: "https://www.nhlbi.nih.gov/education/dash-eating-plan", desc: "Dietary Approaches to Stop Hypertension (DASH) resources and meal plans.", tag: "Heart Health" },
  { name: "Diabetes Food Hub (ADA)", url: "https://www.diabetesfoodhub.org/", desc: "American Diabetes Association recipe hub tailored for blood sugar management.", tag: "Diabetes" },
  { name: "MyPlate Kitchen Recipes", url: "https://www.myplate.gov/myplate-kitchen/recipes", desc: "Budget-friendly recipes aligned with USDA MyPlate guidance.", tag: "Budget" },
  { name: "FoodSafety.gov", url: "https://www.foodsafety.gov/", desc: "Food safety basics, storage charts, and foodborne illness prevention.", tag: "Food Safety" },
  { name: "EAT-Lancet: Planetary Health Diet", url: "https://eatforum.org/learn-and-discover/the-planetary-health-diet/", desc: "Framework for healthy and sustainable dietary patterns.", tag: "Budget" },
  { name: "HealthyChildren.org: Nutrition (AAP)", url: "https://www.healthychildren.org/English/healthy-living/nutrition/Pages/default.aspx", desc: "Nutrition guidance for infants, children, and teens from pediatricians.", tag: "Family" },
  { name: "Vegetarian Resource Group", url: "https://www.vrg.org/nutrition/", desc: "Plant-based nutrition guides and resources.", tag: "Budget" },
  { name: "National Kidney Foundation: Nutrition", url: "https://www.kidney.org/kidney-topics/nutrition", desc: "Diet guidance for kidney health, including sodium and protein tips.", tag: "Medical" },
  { name: "FDA: Added Sugars", url: "https://www.fda.gov/food/nutrition-education-resources-materials/added-sugars", desc: "Learn about added sugars and how to read the Nutrition Facts label.", tag: "Guides" },
  { name: "Celiac Disease Foundation: Gluten-Free Diet", url: "https://celiac.org/gluten-free-living/what-is-gluten/gluten-free-diet/", desc: "Guidance on adopting and maintaining a strict gluten-free diet.", tag: "Medical" },
  { name: "American Cancer Society: Eat Healthy & Get Active", url: "https://www.cancer.org/healthy/eat-healthy-get-active.html", desc: "Nutrition and activity guidance for cancer prevention and survivorship.", tag: "Heart Health" },
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
