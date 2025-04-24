import React, { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import './FoodDatabase.css';

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
  FoodGroupID: string;
  FoodGroupName: string;
  Nutrients: Nutrient[];
}

const FoodDatabase: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [nutrientList, setNutrientList] = useState<Nutrient[]>([]);

  useEffect(() => {
    async function fetchFoods() {
      setLoading(true);
      const foodsRef = collection(db, 'foods');
      const q = query(foodsRef);
      const snapshot = await getDocs(q);
      const foodsArr: Food[] = snapshot.docs.map(doc => doc.data() as Food);
      setFoods(foodsArr);
      // Collect all unique nutrients for header
      const nutrientMap: { [nutrientID: string]: Nutrient } = {};
      foodsArr.forEach(food => {
        (food.Nutrients || []).forEach(nut => {
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
    const descMatch = f.FoodDescription?.toLowerCase().includes(search.toLowerCase());
    const codeMatch = search === ''
      ? true
      : !Number.isNaN(Number(search)) && Number(f.FoodID) === Number(search);
    return descMatch || codeMatch;
  });

  return (
    <div className="page-container">
      <h1 className="page-title">Canadian Nutrient Database from Government of Canada</h1>
      <div className="food-db-container">
        <input
          type="text"
          placeholder="Search food name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="food-db-search"
        />
        {loading ? (
          <div>Loading food database...</div>
        ) : (
          <div className="food-db-table-wrapper">
            <table className="food-db-table">
              <thead>
                <tr>
                  <th>Food Code</th>
                  <th>Description</th>
                  <th>Food Group</th>
                  {nutrientList.map((nutrient) => (
                    <th key={nutrient.NutrientID}>{nutrient.NutrientSymbol || nutrient.NutrientName}</th>
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
                      <td>{food.FoodGroupName}</td>
                      {nutrientList.map((nutrient) => {
                        const found = (food.Nutrients || []).find(n => n.NutrientID === nutrient.NutrientID);
                        return <td key={nutrient.NutrientID}>{found ? found.NutrientValue : ''}</td>;
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
            <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>
              Showing all filtered foods and 10 nutrients for performance. Data: Canadian Nutrient File, Health Canada.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDatabase;
