import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './FoodDatabase.css';

interface FoodName {
  ID: string;
  FoodID: string;
  FoodDescription: string;
  FoodGroupID: string;
}

interface FoodGroup {
  ID: string;
  FoodGroupName: string;
}

interface NutrientAmount {
  ID: string;
  FoodID: string;
  NutrientID: string;
  NutrientValue: string;
  Unit?: string;
}

interface NutrientName {
  ID: string;
  NutrientID: string;
  NutrientSymbol: string;
  NutrientName: string;
  Unit: string;
}

const CSV_PATH = '/cnf-fcen-csv/';
const FOOD_NAME_CSV = CSV_PATH + 'FOOD NAME.csv';
const FOOD_GROUP_CSV = CSV_PATH + 'FOOD GROUP.csv';
const NUTRIENT_AMOUNT_CSV = CSV_PATH + 'NUTRIENT AMOUNT.csv';
const NUTRIENT_NAME_CSV = CSV_PATH + 'NUTRIENT NAME.csv';

const FoodDatabase: React.FC = () => {
  const [foods, setFoods] = useState<FoodName[]>([]);
  const [groups, setGroups] = useState<{ [id: string]: string }>({});
  const [foodNutrients, setFoodNutrients] = useState<{ [foodID: string]: { [nutrientID: string]: string } }>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [nutrientList, setNutrientList] = useState<NutrientName[]>([]);

  useEffect(() => {
    async function fetchCSVs() {
      setLoading(true);
      // Fetch food groups
      const groupResp = await fetch(FOOD_GROUP_CSV);
      const groupText = await groupResp.text();
      const groupParsed = Papa.parse(groupText, { header: true });
      const groupMap: { [id: string]: string } = {};
      (groupParsed.data as FoodGroup[]).forEach((g) => {
        if (g.ID && g.FoodGroupName) groupMap[g.ID] = g.FoodGroupName;
      });
      setGroups(groupMap);

      // Fetch food names
      const foodResp = await fetch(FOOD_NAME_CSV);
      const foodText = await foodResp.text();
      const foodParsed = Papa.parse(foodText, { header: true });
      setFoods(foodParsed.data as FoodName[]);

      // Fetch nutrient names
      const nutNameResp = await fetch(NUTRIENT_NAME_CSV);
      const nutNameText = await nutNameResp.text();
      const nutNameParsed = Papa.parse(nutNameText, { header: true });
      setNutrientList(
        (nutNameParsed.data as NutrientName[]).filter((n) => n.NutrientID && n.NutrientName)
      );

      // Fetch nutrient amounts (large file, so only for first 100 foods for now)
      const nutAmtResp = await fetch(NUTRIENT_AMOUNT_CSV);
      const nutAmtText = await nutAmtResp.text();
      const nutAmtParsed = Papa.parse(nutAmtText, { header: true });
      const foodNut: { [foodID: string]: { [nutrientID: string]: string } } = {};
      (nutAmtParsed.data as NutrientAmount[]).forEach((na) => {
        if (!foodNut[na.FoodID]) foodNut[na.FoodID] = {};
        foodNut[na.FoodID][na.NutrientID] = na.NutrientValue;
      });
      setFoodNutrients(foodNut);

      setLoading(false);
    }
    fetchCSVs();
  }, []);

  const filteredFoods = foods.filter(
    (f) =>
      f.FoodDescription?.toLowerCase().includes(search.toLowerCase()) ||
      f.FoodID?.includes(search)
  );

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
                  {nutrientList.slice(0, 10).map((nutrient) => (
                    <th key={nutrient.NutrientID}>{nutrient.NutrientSymbol || nutrient.NutrientName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFoods.map((food) => (
                  <tr key={food.FoodID}>
                    <td>{food.FoodID}</td>
                    <td>{food.FoodDescription}</td>
                    <td>{groups[food.FoodGroupID]}</td>
                    {nutrientList.slice(0, 10).map((nutrient) => (
                      <td key={nutrient.NutrientID}>
                        {foodNutrients[food.FoodID]?.[nutrient.NutrientID] ?? ''}
                      </td>
                    ))}
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
