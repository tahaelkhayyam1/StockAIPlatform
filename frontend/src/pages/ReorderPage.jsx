import { useEffect, useState } from "react";
import { getReorderRecommendations } from "../api/recommendations";

export default function ReorderPage() {

  const [items, setItems] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getReorderRecommendations();
    setItems(data);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-3xl font-bold mb-6">
        Reorder Recommendations
      </h1>

      <div className="grid gap-4">

        {items.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow"
          >

            <div className="flex justify-between">

              <div>
                <h2 className="text-xl font-semibold">
                  {item.name}
                </h2>

                <p className="text-gray-500">
                  {item.reference}
                </p>
              </div>

              <div className="text-right">
                <p className="text-red-500 font-bold">
                  Stock: {item.currentStock}
                </p>

                <p>
                  Min: {item.minimumStock}
                </p>
              </div>

            </div>

            <div className="mt-4 flex justify-between">

              <div>
                <p className="text-gray-600">
                  Supplier: <b>{item.bestSupplierName}</b>
                </p>

                <p className="text-gray-500">
                  {item.reason}
                </p>
              </div>

              <div className="text-right">
                <p className="text-green-600 font-bold">
                  Recommended: {item.recommendedQuantity}
                </p>
              </div>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}