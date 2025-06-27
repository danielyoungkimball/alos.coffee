"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define the menu structure to match the main page
const MENU_ITEMS = [
  { id: 1, name: "☕ Americano", category: "Bebidas 16 oz", group: "Café" },
  { id: 2, name: "☕ Cappuchino", category: "Bebidas 16 oz", group: "Café" },
  { id: 3, name: "☕ Moka", category: "Bebidas 16 oz", group: "Café" },
  { id: 4, name: "☕ Latte", category: "Bebidas 16 oz", group: "Café" },
  { id: 5, name: "🍮 Caramel Latte", category: "Bebidas 16 oz", group: "Café" },
  { id: 6, name: "🍦 Vainilla Latte", category: "Bebidas 16 oz", group: "Café" },
  { id: 7, name: "🌰 Avellana Latte", category: "Bebidas 16 oz", group: "Café" },
  { id: 8, name: "🍵 Matcha Latte", category: "Bebidas 16 oz", group: "Café" },
  { id: 9, name: "🍵 Chai Latte", category: "Bebidas 16 oz", group: "Café" },
  { id: 10, name: "🍫 Chocolate", category: "Bebidas 16 oz", group: "Café" },
  { id: 11, name: "🍊 Naranja", category: "Bebidas 16 oz", group: "Jugos" },
  { id: 12, name: "🥤 Verde", category: "Bebidas 16 oz", group: "Jugos" },
  { id: 13, name: "🥕 Zanahoria", category: "Bebidas 16 oz", group: "Jugos" },
  { id: 14, name: "🍰 Postre de la semana", category: "Alimentos", group: "Repostería" },
  { id: 15, name: "🥞 Crepas de avena", category: "Alimentos", group: "Repostería" },
  { id: 16, name: "🥞 Hot Cakes de avena", category: "Alimentos", group: "Repostería" },
  { id: 17, name: "🧇 Marquesitas", category: "Alimentos", group: "Repostería" },
  { id: 18, name: "🥪 Mini Sandwich de manzana", category: "Alimentos", group: "Repostería" },
  { id: 19, name: "🍞 Pan francés", category: "Alimentos", group: "Repostería" },
  { id: 20, name: "🍓 Fresas con crema", category: "Alimentos", group: "Repostería" },
];

const CORRECT_PASSWORD = "HARRYLU";

export default function SettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [disabledItems, setDisabledItems] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const router = useRouter();

  // Load disabled items on component mount
  useEffect(() => {
    loadDisabledItems();
  }, []);

  const loadDisabledItems = async () => {
    try {
      const response = await fetch('/api/settings/disabled-items');
      if (response.ok) {
        const data = await response.json();
        setDisabledItems(data.disabledItems || []);
      }
    } catch (error) {
      console.error('Error loading disabled items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError("");
    } else {
      setPasswordError("Contraseña incorrecta");
    }
  };

  const toggleItem = (itemId: number) => {
    setDisabledItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveMessage("");
    
    try {
      const response = await fetch('/api/settings/disabled-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disabledItems }),
      });

      if (response.ok) {
        setSaveMessage("Configuración guardada exitosamente");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("Error al guardar la configuración");
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage("Error al guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  const groupItemsByCategory = () => {
    const grouped: { [key: string]: { [key: string]: typeof MENU_ITEMS } } = {};
    
    MENU_ITEMS.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = {};
      }
      if (!grouped[item.category][item.group]) {
        grouped[item.category][item.group] = [];
      }
      grouped[item.category][item.group].push(item);
    });
    
    return grouped;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-2xl text-verde">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-sansita font-bold text-center text-verde mb-6">
            Configuración
          </h1>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde focus:border-transparent"
                placeholder="Ingresa la contraseña"
                required
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-verde text-white py-3 px-4 rounded-lg font-bold hover:bg-green-700 transition-colors"
            >
              Acceder
            </button>
          </form>
          <button
            onClick={() => router.push('/')}
            className="w-full mt-4 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Volver al menú
          </button>
        </div>
      </div>
    );
  }

  const groupedItems = groupItemsByCategory();

  return (
    <div className="min-h-screen bg-parchment p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-sansita font-bold text-verde">
            Configuración del Menú
          </h1>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Volver al menú
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-verde">
              Gestionar Disponibilidad
            </h2>
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className="bg-verde text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
          
          {saveMessage && (
            <div className={`p-3 rounded-lg mb-4 ${
              saveMessage.includes("exitosamente") 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {saveMessage}
            </div>
          )}

          <p className="text-gray-600 mb-4">
            Marca los elementos que están agotados para mostrarlos como &quot;AGOTADO&quot; en el menú público.
          </p>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, groups]) => (
            <div key={category} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-sansita font-bold text-verde mb-4">
                {category}
              </h3>
              
              {Object.entries(groups).map(([groupName, items]) => (
                <div key={groupName} className="mb-6">
                  <h4 className="text-xl font-bold text-verde mb-3">
                    {groupName}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          disabledItems.includes(item.id)
                            ? "border-red-300 bg-red-50"
                            : "border-green-300 bg-green-50 hover:bg-green-100"
                        }`}
                        onClick={() => toggleItem(item.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">
                            {item.name}
                          </span>
                          <div className="flex items-center">
                            {disabledItems.includes(item.id) ? (
                              <span className="text-red-600 text-sm font-bold">
                                AGOTADO
                              </span>
                            ) : (
                              <span className="text-green-600 text-sm font-bold">
                                DISPONIBLE
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-verde mb-4">
            Resumen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {MENU_ITEMS.length - disabledItems.length}
              </div>
              <div className="text-green-800">Elementos Disponibles</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {disabledItems.length}
              </div>
              <div className="text-red-800">Elementos Agotados</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 