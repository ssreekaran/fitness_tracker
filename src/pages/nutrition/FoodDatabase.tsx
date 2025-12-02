import React, { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../firebase";
import "./FoodDatabase.css";
import { FaSearch, FaInfoCircle } from "react-icons/fa";

interface Nutrient {
  NutrientID: string;
  NutrientName: string;
  NutrientSymbol: string;
  Unit: string;
  NutrientValue: string;
}

interface Food {
  FoodID: string;
  FoodDescription: string;
  Nutrients: Nutrient[];
}

const FoodDatabase: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [nutrientList, setNutrientList] = useState<Nutrient[]>([]);

  useEffect(() => {
    async function fetchFoods() {
      setLoading(true);
      const foodsRef = collection(db, "foods");
      const q = query(foodsRef);
      const snapshot = await getDocs(q);
      const foodsArr: Food[] = snapshot.docs.map((doc) => doc.data() as Food);
      setFoods(foodsArr);
      // Collect all unique nutrients for header
      const nutrientMap: { [nutrientID: string]: Nutrient } = {};
      foodsArr.forEach((food) => {
        (food.Nutrients || []).forEach((nut) => {
          if (nut.NutrientID && !nutrientMap[nut.NutrientID]) {
            nutrientMap[nut.NutrientID] = nut;
          }
        });
      });
      setNutrientList(Object.values(nutrientMap).slice(0, 10));
      setLoading(false);
    }
    fetchFoods();
  }, []);

  const filteredFoods = foods.filter((f) => {
    const descMatch = f.FoodDescription?.toLowerCase().includes(
      search.toLowerCase()
    );
    const codeMatch =
      search === ""
        ? true
        : !Number.isNaN(Number(search)) && Number(f.FoodID) === Number(search);
    return descMatch || codeMatch;
  });

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="food-db-hero">
        <div className="food-db-hero-content">
          <h1>Food Database</h1>
          <p>
            Search and explore nutritional information for thousands of foods
            from the Canadian Nutrient File.
          </p>
          <div className="food-search-container">
            <div className="search-icon">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Search food name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="food-search-input"
            />
          </div>
        </div>
      </section>

      <div className="food-db-container">
        {loading ? (
          <div className="loading-state">Loading food database...</div>
        ) : (
          <div className="table-responsive">
            <div className="food-db-table-wrapper">
              <table className="food-db-table">
                <colgroup>
                  <col style={{ width: "80px" }} />
                  <col style={{ minWidth: "200px" }} />
                  {nutrientList.map((_, index) => (
                    <col key={`col-${index}`} style={{ minWidth: "100px" }} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    <th>Food Code</th>
                    <th>Description</th>
                    {nutrientList.map((nutrient) => (
                      <th key={nutrient.NutrientID} className="sticky-header">
                        {nutrient.NutrientSymbol || nutrient.NutrientName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredFoods
                    .slice()
                    .sort((a, b) => Number(a.FoodID) - Number(b.FoodID))
                    .map((food) => (
                      <tr key={food.FoodID}>
                        <td>{food.FoodID}</td>
                        <td>{food.FoodDescription}</td>
                        {nutrientList.map((nutrient) => {
                          const found = (food.Nutrients || []).find(
                            (n) => n.NutrientID === nutrient.NutrientID
                          );
                          return (
                            <td key={nutrient.NutrientID}>
                              {found ? found.NutrientValue : ""}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="data-source">
              <FaInfoCircle className="info-icon" />
              <span>
                Showing all filtered foods and 10 nutrients for performance.
                Data: Canadian Nutrient File, Health Canada.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDatabase;
