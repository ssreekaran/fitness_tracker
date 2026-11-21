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
  const [loadError, setLoadError] = useState("");
  const [nutrientList, setNutrientList] = useState<Nutrient[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const collectNutrients = (foodsArr: Food[]) => {
    const nutrientMap: { [nutrientID: string]: Nutrient } = {};
    foodsArr.forEach((food) => {
      (food.Nutrients || []).forEach((nut) => {
        if (nut.NutrientID && !nutrientMap[nut.NutrientID]) {
          nutrientMap[nut.NutrientID] = nut;
        }
      });
    });
    return Object.values(nutrientMap).slice(0, 10);
  };

  useEffect(() => {
    async function fetchFoods() {
      // The Canadian Nutrient File rarely changes, so cache it in
      // sessionStorage: the first visit fetches ~5,700 foods from
      // Firestore (several seconds), later visits render instantly.
      try {
        const cached = sessionStorage.getItem("fitness-tracker-foods-v1");
        if (cached) {
          const foodsArr: Food[] = JSON.parse(cached);
          setFoods(foodsArr);
          setNutrientList(collectNutrients(foodsArr));
          setLoading(false);
          return;
        }
      } catch {
        // Corrupt / oversized cache — fall through to a fresh fetch.
      }
      setLoading(true);
      setLoadError("");
      try {
        const foodsRef = collection(db, "foods");
        const q = query(foodsRef);
        const snapshot = await getDocs(q);
        const foodsArr: Food[] = snapshot.docs.map((doc) => doc.data() as Food);
        setFoods(foodsArr);
        setNutrientList(collectNutrients(foodsArr));
        try {
          sessionStorage.setItem(
            "fitness-tracker-foods-v1",
            JSON.stringify(foodsArr)
          );
        } catch {
          // Storage full / unavailable — the table still works, it just
          // fetches again next visit.
        }
      } catch (error) {
        console.error("Error loading food database:", error);
        setLoadError(
          "The food database could not be loaded. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
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

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredFoods.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFoods = filteredFoods
    .slice()
    .sort((a, b) => Number(a.FoodID) - Number(b.FoodID))
    .slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

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
          <div className="loading-state">
            Loading food database… this can take a few seconds on your first
            visit; later visits load instantly from a cache on your device.
          </div>
        ) : loadError ? (
          <div className="loading-state" role="alert">
            <p>{loadError}</p>
            <button
              className="pagination-btn"
              type="button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <p className="food-db-units">
              Values are per 100&nbsp;g of food. Units are shown in each
              column header; &ldquo;—&rdquo; means no value is listed for that
              food.
            </p>
            <div className="food-db-table-wrapper">
              <table className="food-db-table">
                <colgroup>
                  <col style={{ width: "70px" }} />
                  <col style={{ minWidth: "180px" }} />
                  {nutrientList.map((_, index) => (
                    <col key={`col-${index}`} style={{ minWidth: "72px" }} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    <th>Food Code</th>
                    <th>Description</th>
                    {nutrientList.map((nutrient) => (
                      <th key={nutrient.NutrientID} className="sticky-header">
                        {nutrient.NutrientSymbol || nutrient.NutrientName}
                        {nutrient.Unit ? (
                          <span className="nutrient-unit">
                            {" "}
                            ({nutrient.Unit})
                          </span>
                        ) : null}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedFoods.map((food) => (
                    <tr key={food.FoodID}>
                      <td>{food.FoodID}</td>
                      <td>{food.FoodDescription}</td>
                      {nutrientList.map((nutrient) => {
                        const found = (food.Nutrients || []).find(
                          (n) => n.NutrientID === nutrient.NutrientID
                        );
                        return (
                          <td key={nutrient.NutrientID}>
                            {found && found.NutrientValue !== ""
                              ? found.NutrientValue
                              : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination-info">
              <span>
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredFoods.length)} of{" "}
                {filteredFoods.length} foods
              </span>
            </div>

            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>

                <div className="pagination-numbers">
                  {getPageNumbers().map((page, index) =>
                    typeof page === "number" ? (
                      <button
                        key={index}
                        onClick={() => handlePageChange(page)}
                        className={`pagination-number ${
                          currentPage === page ? "active" : ""
                        }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={index} className="pagination-ellipsis">
                        {page}
                      </span>
                    )
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}

            <div className="data-source">
              <FaInfoCircle className="info-icon" />
              <span>
                Showing 10 nutrients for performance. Data: Canadian Nutrient
                File, Health Canada.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDatabase;
