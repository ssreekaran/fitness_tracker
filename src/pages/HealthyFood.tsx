import React from "react";
import { ListGroup } from "react-bootstrap";
import "./HealthyFood.css";

const healthyLinks = [
  { name: "Harvard Healthy Eating Plate", url: "https://www.hsph.harvard.edu/nutritionsource/healthy-eating-plate/", desc: "A visual guide to balanced eating from Harvard's School of Public Health." },
  { name: "American Heart Association: Healthy Eating", url: "https://www.heart.org/en/healthy-living/healthy-eating", desc: "Heart-healthy food tips and recipes from the AHA." },
  { name: "ChooseMyPlate.gov", url: "https://www.myplate.gov/", desc: "USDA's guide to building a healthy plate for every meal." },
  { name: "Mayo Clinic Healthy Diet", url: "https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating", desc: "Practical healthy eating advice from Mayo Clinic experts." },
  { name: "CDC Nutrition", url: "https://www.cdc.gov/nutrition/index.html", desc: "Nutrition basics and resources from the CDC." }
];

const HealthyFood: React.FC = () => (
  <div className="food-blog-container">
    <h1 className="food-blog-title">Healthy Food Options</h1>
    <div className="food-blog-intro">
      Discover delicious ways to eat well! Explore these trusted guides and resources to help you make healthy food choices every day.
    </div>
    {healthyLinks.map(link => (
      <div key={link.url} className="food-blog-list">
        <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <ListGroup>
            <ListGroup.Item>
              <strong>{link.name}</strong>
              <div style={{ fontSize: '1rem', color: '#7c6847', marginTop: '0.3rem' }}>{link.desc}</div>
            </ListGroup.Item>
          </ListGroup>
        </a>
      </div>
    ))}
  </div>
);

export default HealthyFood;
