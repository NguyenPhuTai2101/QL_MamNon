"use client";

import React, { useState, useEffect, useMemo } from "react";
import Portal from "@/components/portal";
import {
  UtensilsCrossed,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  Copy,
  Check,
  Calculator,
  Scale,
  X,
  Printer,
  Download,
  ShoppingCart,
  Save,
  Sparkles,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Info,
  Layers,
  CheckCircle2,
  RefreshCw,
  Soup,
  Apple,
  Milk,
  Drumstick,
  Carrot,
  Warehouse,
  Boxes,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  CheckSquare,
  Square,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";

export interface MenuIngredientItem {
  id: string;
  meal: "BREAKFAST" | "LUNCH" | "SNACK";
  warehouseId?: string;
  code?: string;
  name: string;
  category: "PROTEIN" | "CARB" | "VEG" | "FRUIT_DAIRY" | "SPICE_OTHER";
  gramsPerKid: number; // Định lượng gram/trẻ hoặc số lượng/trẻ
  unit: string; // kg, lít, quả, hộp, g...
  unitPrice: number;
  supplier?: string;
}

export interface DailyMenuItem {
  id: string;
  date: string; // "YYYY-MM-DD"
  dayOfWeek: string; // "Thứ Hai", "Thứ Ba"...
  breakfast: string;
  lunch: string;
  snack: string;
  costPerStudent: number;
  ingredients?: MenuIngredientItem[];
}

export interface WarehouseItem {
  id: string;
  code: string; // TP001, TP002...
  name: string;
  category: "PROTEIN" | "CARB" | "VEG" | "FRUIT_DAIRY" | "SPICE_OTHER";
  stockQuantity: number; // Số lượng tồn kho hiện tại
  unit: string; // kg, lít, quả, hộp, thùng, chai
  unitPrice: number; // VNĐ
  supplier: string;
}

export interface GroceryItem {
  id: string;
  warehouseId?: string; // ID nguyên liệu trong kho nếu được liên kết
  code?: string; // Mã nguyên liệu kho (TP001...)
  name: string;
  category: "PROTEIN" | "CARB" | "VEG" | "FRUIT_DAIRY" | "SPICE_OTHER";
  standardPerKidGrams: number; // Định lượng gram/trẻ lý thuyết
  theoreticalQty: number; // Định lượng cần dùng theo sĩ số (kg/lít/quả)
  actualQty: number; // Khối lượng mua thực tế (kg/lít/quả)
  stockQty: number; // Số lượng còn lại trong kho hiện tại
  unit: string; // kg, lít, quả, bó, chai, hộp, thùng
  unitPrice: number; // VNĐ
  totalCost: number; // actualQty * unitPrice (Thành tiền mua)
  supplier: string;
  selected?: boolean; // Tích chọn để lưu vào CSDL
}

// Bảng kho thực phẩm mẫu chuẩn định lượng dinh dưỡng cho trẻ mầm non
const DEFAULT_WAREHOUSE_ITEMS: WarehouseItem[] = [
  {
    id: "wh-1",
    code: "TP001",
    name: "Thịt heo nạc xay",
    category: "PROTEIN",
    stockQuantity: 15.5,
    unit: "kg",
    unitPrice: 140000,
    supplier: "Công ty Thực phẩm CP",
  },
  {
    id: "wh-2",
    code: "TP002",
    name: "Thịt bò tươi",
    category: "PROTEIN",
    stockQuantity: 8.0,
    unit: "kg",
    unitPrice: 240000,
    supplier: "Cửa hàng Thịt sạch",
  },
  {
    id: "wh-3",
    code: "TP003",
    name: "Tôm đồng tươi",
    category: "PROTEIN",
    stockQuantity: 6.2,
    unit: "kg",
    unitPrice: 180000,
    supplier: "Chợ hải sản",
  },
  {
    id: "wh-4",
    code: "TP004",
    name: "Trứng gà ta",
    category: "PROTEIN",
    stockQuantity: 120,
    unit: "quả",
    unitPrice: 3500,
    supplier: "Nông trại Ba Vì",
  },
  {
    id: "wh-5",
    code: "TP005",
    name: "Cá lóc phi lê tươi",
    category: "PROTEIN",
    stockQuantity: 10.0,
    unit: "kg",
    unitPrice: 140000,
    supplier: "Công ty Thực phẩm Sạch B",
  },
  {
    id: "wh-6",
    code: "TP006",
    name: "Gạo tẻ ST25",
    category: "CARB",
    stockQuantity: 50.0,
    unit: "kg",
    unitPrice: 26000,
    supplier: "Đại lý Gạo sạch",
  },
  {
    id: "wh-7",
    code: "TP007",
    name: "Bí đỏ hồ lô",
    category: "VEG",
    stockQuantity: 18.0,
    unit: "kg",
    unitPrice: 18000,
    supplier: "HTX Rau an toàn",
  },
  {
    id: "wh-8",
    code: "TP008",
    name: "Rau cải ngọt hữu cơ",
    category: "VEG",
    stockQuantity: 14.5,
    unit: "kg",
    unitPrice: 22000,
    supplier: "HTX Rau an toàn",
  },
  {
    id: "wh-9",
    code: "TP009",
    name: "Chuối tiêu chín",
    category: "FRUIT_DAIRY",
    stockQuantity: 25.0,
    unit: "kg",
    unitPrice: 20000,
    supplier: "Vựa trái cây",
  },
  {
    id: "wh-10",
    code: "TP010",
    name: "Sữa tươi tiệt trùng Vinamilk",
    category: "FRUIT_DAIRY",
    stockQuantity: 36.0,
    unit: "lít",
    unitPrice: 34000,
    supplier: "Đại lý Vinamilk",
  },
  {
    id: "wh-11",
    code: "TP011",
    name: "Sữa chua Vinamilk có đường",
    category: "FRUIT_DAIRY",
    stockQuantity: 96,
    unit: "hộp",
    unitPrice: 6500,
    supplier: "Đại lý Vinamilk",
  },
  {
    id: "wh-12",
    code: "TP012",
    name: "Dầu ăn & Gia vị an toàn",
    category: "SPICE_OTHER",
    stockQuantity: 12,
    unit: "chai",
    unitPrice: 15000,
    supplier: "Bách Hóa Xanh",
  },
];

// Helper tính số tuần trong năm theo chuẩn ISO-8601
function getISOWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatDateToISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateToDisplay(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const y = d.getFullYear();
  return `${day}/${m}/${y}`;
}

// Tạo danh sách các tuần động quanh ngày hiện tại
function generateDynamicWeeksList(baseDate = new Date()) {
  const now = new Date(baseDate);
  const currentDay = now.getDay(); // 0: Chủ nhật, 1: Thứ 2,...
  const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay;
  const currentMonday = new Date(now);
  currentMonday.setDate(now.getDate() + diffToMonday);
  currentMonday.setHours(0, 0, 0, 0);

  const list = [];
  // Duyệt từ tương lai (+4 tuần) về quá khứ (-12 tuần)
  for (let offset = 4; offset >= -12; offset--) {
    const monday = new Date(currentMonday);
    monday.setDate(currentMonday.getDate() + offset * 7);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const weekNum = getISOWeekNumber(monday);
    const startStr = formatDateToISO(monday);
    const endStr = formatDateToISO(sunday);

    let tag = "";
    if (offset === 0) {
      tag = " [Hiện tại]";
    } else if (offset === -1) {
      tag = " [Tuần trước]";
    } else if (offset === 1) {
      tag = " [Tuần sau]";
    }

    list.push({
      id: `${monday.getFullYear()}-W${String(weekNum).padStart(2, "0")}`,
      label: `Tuần ${weekNum}${tag} (${formatDateToDisplay(monday)} - ${formatDateToDisplay(sunday)})`,
      start: startStr,
      end: endStr,
      isCurrent: offset === 0,
    });
  }
  return list;
}

export default function MenuTab() {
  // Lịch sử các tuần làm việc tự động tính theo ngày thực tế
  const weeksList = useMemo(() => generateDynamicWeeksList(), []);
  const initialCurrentIndex = useMemo(() => {
    const idx = weeksList.findIndex((w) => w.isCurrent);
    return idx >= 0 ? idx : 0;
  }, [weeksList]);

  const [selectedWeekIndex, setSelectedWeekIndex] =
    useState(initialCurrentIndex);
  const [weeklyMenus, setWeeklyMenus] = useState<DailyMenuItem[]>([]);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Danh mục kho thực phẩm tổng thể
  const [warehouseInventory, setWarehouseInventory] = useState<WarehouseItem[]>(
    DEFAULT_WAREHOUSE_ITEMS,
  );

  // Modal Thêm / Sửa Thực đơn ngày
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<DailyMenuItem | null>(null);
  const [menuForm, setMenuForm] = useState<{
    date: string;
    breakfast: string;
    lunch: string;
    snack: string;
    costPerStudent: number;
    ingredients: MenuIngredientItem[];
  }>({
    date: new Date().toISOString().split("T")[0],
    breakfast: "",
    lunch: "",
    snack: "",
    costPerStudent: 30000,
    ingredients: [],
  });

  // Tab bữa ăn đang chọn cấu hình nguyên liệu trong modal thực đơn
  const [activeMenuMealTab, setActiveMenuMealTab] = useState<
    "BREAKFAST" | "LUNCH" | "SNACK"
  >("BREAKFAST");

  // Form thêm nhanh nguyên liệu vào bữa ăn trong modal thực đơn
  const [selectedWarehouseForMenu, setSelectedWarehouseForMenu] =
    useState<string>("");
  const [menuIngQtyGrams, setMenuIngQtyGrams] = useState<number>(50);

  // =========================================================================
  // PHẦN 2: ĐỊNH LƯỢNG THỰC TẾ ĐI CHỢ & LIÊN KẾT TỒN KHO
  // =========================================================================
  const [selectedGroceryDate, setSelectedGroceryDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [groceryKidCount, setGroceryKidCount] = useState<number>(25);
  const [mealFeePerKid, setMealFeePerKid] = useState<number>(30000);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [isSavingGroceries, setIsSavingGroceries] = useState(false);

  // Modal Chọn nguyên liệu từ Kho (Hỗ trợ tích chọn nhiều món và xem tồn kho)
  const [isWarehousePickerOpen, setIsWarehousePickerOpen] = useState(false);
  const [warehouseSearch, setWarehouseSearch] = useState("");
  const [warehouseCategoryFilter, setWarehouseCategoryFilter] = useState("ALL");
  const [selectedInModal, setSelectedInModal] = useState<
    Record<string, { selected: boolean; qty: number }>
  >({});

  // Modal Thêm món mới ngoài kho
  const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState(false);
  const [customGroceryForm, setCustomGroceryForm] = useState({
    name: "",
    category: "PROTEIN" as GroceryItem["category"],
    actualQty: 1,
    unit: "kg",
    unitPrice: 50000,
    supplier: "Chợ đầu mối",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Tính định lượng chuẩn lý thuyết cho 1 nguyên liệu dựa vào sĩ số
  const calculateSuggestedQty = (wh: WarehouseItem, kidCount: number) => {
    let stdGrams = 50;
    if (wh.category === "PROTEIN") stdGrams = wh.name.includes("heo") ? 70 : 50;
    if (wh.category === "CARB") stdGrams = 80;
    if (wh.category === "VEG") stdGrams = 50;
    if (wh.category === "FRUIT_DAIRY") stdGrams = wh.unit === "lít" ? 180 : 60;
    if (wh.category === "SPICE_OTHER") stdGrams = 10;

    if (wh.unit === "kg" || wh.unit === "lít") {
      return parseFloat(((kidCount * stdGrams) / 1000).toFixed(2));
    } else if (wh.unit === "quả" || wh.unit === "hộp") {
      return Math.ceil((kidCount * stdGrams) / 40);
    }
    return 1;
  };

  // Tải danh sách nguyên liệu và số lượng tồn kho từ CSDL
  const loadWarehouseInventory = async () => {
    try {
      const res = await fetch("/api/ingredients");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: WarehouseItem[] = data.map((item: any, idx: number) => {
          const rawCode =
            item.name.match(/\[(.*?)\]/)?.[1] ||
            `TP0${idx + 1 < 10 ? `0${idx + 1}` : idx + 1}`;
          const cleanName = item.name.replace(/\[.*?\]/, "").trim();
          return {
            id: item.id,
            code: rawCode,
            name: cleanName,
            category: (item.notes?.includes("Rau")
              ? "VEG"
              : item.notes?.includes("Sữa")
                ? "FRUIT_DAIRY"
                : "PROTEIN") as any,
            stockQuantity: item.quantity || 0,
            unit: item.unit || "kg",
            unitPrice: item.unitPrice || 0,
            supplier:
              item.notes?.replace("Nhà cung cấp: ", "") || "Kho Bếp Trường",
          };
        });
        setWarehouseInventory(mapped);
      } else {
        setWarehouseInventory(DEFAULT_WAREHOUSE_ITEMS);
      }
    } catch (e) {
      console.error(e);
      setWarehouseInventory(DEFAULT_WAREHOUSE_ITEMS);
    }
  };

  // Tải danh sách thực đơn từ CSDL theo tuần được chọn
  const loadMenus = async () => {
    setIsLoadingMenus(true);
    const currWeek = weeksList[selectedWeekIndex];
    try {
      const res = await fetch(
        `/api/menus?startDate=${currWeek.start}&endDate=${currWeek.end}`,
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        const dayNames = [
          "Chủ Nhật",
          "Thứ Hai",
          "Thứ Ba",
          "Thứ Tư",
          "Thứ Năm",
          "Thứ Sáu",
          "Thứ Bảy",
        ];
        const mapped: DailyMenuItem[] = data.map((m: any) => {
          const d = new Date(m.date);
          const dateStr = d.toISOString().split("T")[0];
          let parsedIngredients: MenuIngredientItem[] = [];
          if (m.ingredientsJson) {
            try {
              parsedIngredients =
                typeof m.ingredientsJson === "string"
                  ? JSON.parse(m.ingredientsJson)
                  : m.ingredientsJson;
            } catch (err) {
              console.error("Failed to parse ingredientsJson", err);
            }
          }
          return {
            id: m.id,
            date: dateStr,
            dayOfWeek: dayNames[d.getDay()] || "Thứ Hai",
            breakfast: m.breakfast || "",
            lunch: m.lunch || "",
            snack: m.snack || "",
            costPerStudent: m.costPerStudent || 30000,
            ingredients: parsedIngredients,
          };
        });
        setWeeklyMenus(mapped);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMenus(false);
    }
  };

  // Hàm chuyển đổi các nguyên liệu đã cấu hình trong Thực Đơn Ngày thành danh sách Đi Chợ
  const generateGroceriesFromMenu = (
    menu: DailyMenuItem,
    currentWarehouse: WarehouseItem[],
    kidCount: number,
  ): GroceryItem[] => {
    if (!menu.ingredients || menu.ingredients.length === 0) return [];
    return menu.ingredients.map((ing, idx) => {
      const whMatch = currentWarehouse.find(
        (w) =>
          (ing.warehouseId && w.id === ing.warehouseId) ||
          (ing.code && w.code === ing.code) ||
          w.name.toLowerCase() === ing.name.toLowerCase(),
      );
      const stock = whMatch ? whMatch.stockQuantity : 0;
      const price = ing.unitPrice || whMatch?.unitPrice || 0;

      let theoretical = 0;
      if (ing.unit === "kg" || ing.unit === "lít" || ing.unit === "g") {
        theoretical = parseFloat(
          ((kidCount * ing.gramsPerKid) / 1000).toFixed(2),
        );
      } else if (ing.unit === "quả" || ing.unit === "hộp") {
        theoretical = Math.ceil(
          kidCount * (ing.gramsPerKid >= 1 ? ing.gramsPerKid : ing.gramsPerKid / 40),
        );
      } else {
        theoretical = parseFloat(
          ((kidCount * ing.gramsPerKid) / 1000).toFixed(2),
        );
      }

      const neededBuy = Math.max(
        0,
        parseFloat((theoretical - stock).toFixed(2)),
      );
      const mealPrefix =
        ing.meal === "BREAKFAST"
          ? "[Sáng] "
          : ing.meal === "LUNCH"
            ? "[Trưa] "
            : "[Xế] ";

      return {
        id: `menu-ing-${ing.id || idx}-${Date.now()}`,
        warehouseId: whMatch?.id,
        code: ing.code || whMatch?.code || "TP-THUCDON",
        name: `${mealPrefix}${ing.name}`,
        category: ing.category || whMatch?.category || "PROTEIN",
        standardPerKidGrams: ing.gramsPerKid,
        theoreticalQty: theoretical,
        actualQty: neededBuy,
        stockQty: stock,
        unit: ing.unit,
        unitPrice: price,
        totalCost: Math.round(neededBuy * price),
        supplier: ing.supplier || whMatch?.supplier || "Chợ đầu mối",
        selected: true,
      };
    });
  };

  // Tải nguyên liệu thực phẩm đi chợ của ngày được chọn từ CSDL hoặc tự động bóc tách từ Thực đơn ngày
  const loadGroceries = async (
    dateStr: string,
    currentWarehouse: WarehouseItem[],
  ) => {
    try {
      const res = await fetch(`/api/ingredients?date=${dateStr}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: GroceryItem[] = data.map((item: any) => {
          const cleanName = item.name.replace(/\[.*?\]/, "").trim();
          const whMatch = currentWarehouse.find(
            (w) =>
              w.name.toLowerCase() === cleanName.toLowerCase() ||
              item.name.includes(w.code),
          );
          return {
            id: item.id,
            warehouseId: whMatch?.id,
            code:
              whMatch?.code || item.name.match(/\[(.*?)\]/)?.[1] || "TP-MUA",
            name: cleanName,
            category: whMatch?.category || "PROTEIN",
            standardPerKidGrams: 50,
            theoreticalQty: item.quantity,
            actualQty: item.quantity,
            stockQty: whMatch ? whMatch.stockQuantity : 0,
            unit: item.unit || "kg",
            unitPrice: item.unitPrice || 0,
            totalCost: item.totalCost || item.quantity * item.unitPrice,
            supplier: item.notes || whMatch?.supplier || "Chợ đầu mối",
            selected: true,
          };
        });
        setGroceryItems(mapped);
      } else {
        // Tự động kiểm tra xem ngày này đã có thực đơn với danh sách nguyên liệu chưa
        const matchingMenu = weeklyMenus.find((m) => m.date === dateStr);
        if (
          matchingMenu &&
          matchingMenu.ingredients &&
          matchingMenu.ingredients.length > 0
        ) {
          const autoItems = generateGroceriesFromMenu(
            matchingMenu,
            currentWarehouse,
            groceryKidCount,
          );
          setGroceryItems(autoItems);
        } else {
          setGroceryItems([]);
        }
      }
    } catch (e) {
      console.error(e);
      setGroceryItems([]);
    }
  };

  // Nút chủ động tải lại/đồng bộ nguyên liệu từ Thực đơn ngày
  const handleSyncGroceriesFromDailyMenu = () => {
    const matchingMenu = weeklyMenus.find(
      (m) => m.date === selectedGroceryDate,
    );
    if (!matchingMenu) {
      alert(
        `Chưa tìm thấy thực đơn cho ngày ${selectedGroceryDate}. Vui lòng tạo thực đơn trước!`,
      );
      return;
    }
    if (
      !matchingMenu.ingredients ||
      matchingMenu.ingredients.length === 0
    ) {
      alert(
        `Thực đơn ngày ${selectedGroceryDate} chưa được cấu hình nguyên liệu bóc tách. Hãy bấm 'Sửa thực đơn' để thêm nguyên liệu cho các bữa!`,
      );
      return;
    }

    const generated = generateGroceriesFromMenu(
      matchingMenu,
      warehouseInventory,
      groceryKidCount,
    );
    setGroceryItems(generated);
    showToast(
      `Đã bóc tách thành công ${generated.length} nguyên liệu từ Thực đơn ngày ${selectedGroceryDate}!`,
    );
  };

  // Mở modal chọn từ kho và chuẩn bị danh sách đã chọn hiện tại
  const handleOpenWarehousePicker = () => {
    const initialSelection: Record<string, { selected: boolean; qty: number }> =
      {};
    warehouseInventory.forEach((wh) => {
      const existing = groceryItems.find(
        (g) =>
          g.name.toLowerCase() === wh.name.toLowerCase() || g.code === wh.code,
      );
      const theoretical = calculateSuggestedQty(wh, groceryKidCount);
      const neededToBuy = Math.max(
        0,
        parseFloat((theoretical - wh.stockQuantity).toFixed(2)),
      );
      if (existing) {
        initialSelection[wh.id] = { selected: true, qty: existing.actualQty };
      } else {
        initialSelection[wh.id] = { selected: false, qty: neededToBuy };
      }
    });
    setSelectedInModal(initialSelection);
    setIsWarehousePickerOpen(true);
  };

  // Xác nhận các món đã tích chọn từ kho vào bảng đi chợ
  const handleConfirmWarehouseSelection = () => {
    const newItems: GroceryItem[] = [];

    warehouseInventory.forEach((wh) => {
      const state = selectedInModal[wh.id];
      if (state && state.selected) {
        let stdGrams = 50;
        if (wh.category === "PROTEIN")
          stdGrams = wh.name.includes("heo") ? 70 : 50;
        if (wh.category === "CARB") stdGrams = 80;
        if (wh.category === "VEG") stdGrams = 50;
        if (wh.category === "FRUIT_DAIRY")
          stdGrams = wh.unit === "lít" ? 180 : 60;
        if (wh.category === "SPICE_OTHER") stdGrams = 10;

        const theoretical = calculateSuggestedQty(wh, groceryKidCount);
        const actualBuyQty =
          state.qty !== undefined
            ? state.qty
            : Math.max(
                0,
                parseFloat((theoretical - wh.stockQuantity).toFixed(2)),
              );

        newItems.push({
          id: `wh-${wh.id}-${Date.now()}`,
          warehouseId: wh.id,
          code: wh.code,
          name: wh.name,
          category: wh.category,
          standardPerKidGrams: stdGrams,
          theoreticalQty: theoretical,
          actualQty: actualBuyQty,
          stockQty: wh.stockQuantity,
          unit: wh.unit,
          unitPrice: wh.unitPrice,
          totalCost: Math.round(actualBuyQty * wh.unitPrice),
          supplier: wh.supplier,
          selected: true,
        });
      }
    });

    const customItems = groceryItems.filter((g) => g.code === "TP-NGOAI");
    setGroceryItems([...newItems, ...customItems]);
    setIsWarehousePickerOpen(false);
    showToast(`Đã chọn thành công ${newItems.length} nguyên liệu từ kho!`);
  };

  useEffect(() => {
    loadWarehouseInventory();
    loadMenus();
  }, [selectedWeekIndex]);

  useEffect(() => {
    loadGroceries(selectedGroceryDate, warehouseInventory);
  }, [selectedGroceryDate, warehouseInventory]);

  // Cập nhật khối lượng lý thuyết khi đổi sĩ số học sinh
  const handleUpdateKidCount = (count: number) => {
    const validCount = Math.max(1, count);
    setGroceryKidCount(validCount);
    setGroceryItems((prev) =>
      prev.map((item) => {
        let theoretical = item.theoreticalQty;
        if (item.standardPerKidGrams) {
          if (item.unit === "kg" || item.unit === "lít") {
            theoretical = parseFloat(
              ((validCount * item.standardPerKidGrams) / 1000).toFixed(2),
            );
          } else if (item.unit === "quả" || item.unit === "hộp") {
            theoretical = Math.ceil(
              (validCount * item.standardPerKidGrams) / 40,
            );
          }
        }
        return {
          ...item,
          theoreticalQty: theoretical,
        };
      }),
    );
  };

  // Cập nhật khối lượng thực tế của 1 món đi chợ
  const handleActualQtyChange = (id: string, newQty: number) => {
    setGroceryItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const qty = Math.max(0, newQty);
          return {
            ...item,
            actualQty: qty,
            totalCost: Math.round(qty * item.unitPrice),
          };
        }
        return item;
      }),
    );
  };

  // Cập nhật đơn giá thực tế của 1 món đi chợ
  const handleUnitPriceChange = (id: string, newPrice: number) => {
    setGroceryItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const price = Math.max(0, newPrice);
          return {
            ...item,
            unitPrice: price,
            totalCost: Math.round(item.actualQty * price),
          };
        }
        return item;
      }),
    );
  };

  // Xóa 1 món khỏi sổ đi chợ
  const handleDeleteGroceryItem = (id: string) => {
    setGroceryItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Thêm món tự nhập ngoài kho
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGroceryForm.name || customGroceryForm.actualQty <= 0) return;

    const newItem: GroceryItem = {
      id: `custom-${Date.now()}`,
      code: "TP-NGOAI",
      name: customGroceryForm.name,
      category: customGroceryForm.category,
      standardPerKidGrams: 0,
      theoreticalQty: customGroceryForm.actualQty,
      actualQty: customGroceryForm.actualQty,
      stockQty: 0,
      unit: customGroceryForm.unit,
      unitPrice: customGroceryForm.unitPrice,
      totalCost: Math.round(
        customGroceryForm.actualQty * customGroceryForm.unitPrice,
      ),
      supplier: customGroceryForm.supplier,
      selected: true,
    };

    setGroceryItems((prev) => [newItem, ...prev]);
    setIsAddCustomModalOpen(false);
    setCustomGroceryForm({
      name: "",
      category: "PROTEIN",
      actualQty: 1,
      unit: "kg",
      unitPrice: 50000,
      supplier: "Chợ đầu mối",
    });
    showToast("Đã thêm món thực phẩm mới ngoài kho!");
  };

  // Tích chọn / Bỏ chọn 1 món trong bảng đi chợ
  const handleToggleGroceryItem = (id: string, selected: boolean) => {
    setGroceryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected } : item)),
    );
  };

  // Tích chọn / Bỏ chọn tất cả món trong bảng đi chợ
  const isAllGroceriesSelected =
    groceryItems.length > 0 && groceryItems.every((i) => i.selected !== false);
  const handleToggleSelectAllGroceries = () => {
    const nextState = !isAllGroceriesSelected;
    setGroceryItems((prev) =>
      prev.map((item) => ({ ...item, selected: nextState })),
    );
  };

  // Danh sách các món đang được tích chọn (bao gồm cả món mua = 0 vì đã có đủ trong kho)
  const selectedGroceryItems = useMemo(() => {
    return groceryItems.filter((i) => i.selected !== false && i.actualQty >= 0);
  }, [groceryItems]);

  // Lưu bảng đi chợ thực tế vào CSDL (Chỉ lưu các món đã được tích chọn)
  const handleSaveGroceriesToDB = async () => {
    if (selectedGroceryItems.length === 0) {
      alert(
        "Vui lòng tích chọn ít nhất 1 nguyên liệu trong danh sách trước khi lưu!",
      );
      return;
    }

    setIsSavingGroceries(true);
    try {
      const res = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedGroceryDate,
          replaceForDate: true,
          items: selectedGroceryItems.map((item) => ({
            name: item.code ? `[${item.code}] ${item.name}` : item.name,
            quantity: item.actualQty,
            unit: item.unit,
            unitPrice: item.unitPrice,
            notes: item.supplier,
            date: selectedGroceryDate,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          `🎉 Đã lưu thành công ${selectedGroceryItems.length} món thực phẩm ngày ${selectedGroceryDate} vào CSDL!`,
        );
        loadWarehouseInventory();
      } else {
        showToast(data.error || "Lỗi khi lưu dữ liệu đi chợ vào CSDL.");
      }
    } catch (e) {
      console.error(e);
      showToast("Lỗi khi lưu dữ liệu đi chợ vào CSDL.");
    } finally {
      setIsSavingGroceries(false);
    }
  };

  // Thao tác Lưu / Sửa Thực Đơn Ngày
  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.breakfast || !menuForm.lunch || !menuForm.snack) {
      alert("Vui lòng nhập đầy đủ món cho Bữa sáng, Bữa trưa và Bữa xế!");
      return;
    }

    try {
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingMenu?.id,
          date: menuForm.date,
          breakfast: menuForm.breakfast,
          lunch: menuForm.lunch,
          snack: menuForm.snack,
          costPerStudent: menuForm.costPerStudent,
          ingredientsJson:
            menuForm.ingredients && menuForm.ingredients.length > 0
              ? JSON.stringify(menuForm.ingredients)
              : null,
        }),
      });

      const result = await res.json();
      if (result.success || result.id) {
        showToast("Đã lưu thực đơn ngày thành công vào CSDL!");
        setIsMenuModalOpen(false);
        setEditingMenu(null);
        loadMenus();
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi lưu thực đơn.");
    }
  };

  // Thao tác Xóa Thực Đơn Ngày
  const handleDeleteMenu = async (menuItem: DailyMenuItem) => {
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa thực đơn ngày ${menuItem.date} (${menuItem.dayOfWeek}) không?`,
      )
    ) {
      return;
    }

    try {
      const url = menuItem.id
        ? `/api/menus?id=${menuItem.id}`
        : `/api/menus?date=${menuItem.date}`;
      const res = await fetch(url, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        showToast("Đã xóa thực đơn ngày thành công!");
        loadMenus();
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi xóa thực đơn.");
    }
  };

  // Mở Modal Sửa Thực đơn
  const handleOpenEditMenu = (menu: DailyMenuItem) => {
    setEditingMenu(menu);
    setMenuForm({
      date: menu.date,
      breakfast: menu.breakfast,
      lunch: menu.lunch,
      snack: menu.snack,
      costPerStudent: menu.costPerStudent,
      ingredients: menu.ingredients || [],
    });
    setActiveMenuMealTab("BREAKFAST");
    setIsMenuModalOpen(true);
  };

  // Mở Modal Thêm Thực đơn Mới
  const handleOpenAddMenu = () => {
    setEditingMenu(null);
    setMenuForm({
      date: new Date().toISOString().split("T")[0],
      breakfast: "",
      lunch: "",
      snack: "",
      costPerStudent: 30000,
      ingredients: [],
    });
    setActiveMenuMealTab("BREAKFAST");
    setIsMenuModalOpen(true);
  };

  // Thêm nguyên liệu từ kho vào bữa ăn trong Modal Thực đơn
  const handleAddWarehouseIngToMenu = () => {
    if (!selectedWarehouseForMenu) return;
    const wh = warehouseInventory.find((w) => w.id === selectedWarehouseForMenu);
    if (!wh) return;

    const newIng: MenuIngredientItem = {
      id: `ing-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      meal: activeMenuMealTab,
      warehouseId: wh.id,
      code: wh.code,
      name: wh.name,
      category: wh.category,
      gramsPerKid: menuIngQtyGrams > 0 ? menuIngQtyGrams : 50,
      unit: wh.unit,
      unitPrice: wh.unitPrice,
      supplier: wh.supplier,
    };

    setMenuForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, newIng],
    }));

    setSelectedWarehouseForMenu("");
    setMenuIngQtyGrams(50);
  };

  // Xóa nguyên liệu khỏi bữa ăn trong Modal Thực đơn
  const handleRemoveIngFromMenu = (ingId: string) => {
    setMenuForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((i) => i.id !== ingId),
    }));
  };

  // Tính tổng chi phí nguyên liệu ước tính / trẻ từ tất cả các bữa ăn đã cấu hình
  const totalMenuIngredientsCostPerKid = useMemo(() => {
    if (!menuForm.ingredients || menuForm.ingredients.length === 0) return 0;
    return menuForm.ingredients.reduce((acc, ing) => {
      let cost = 0;
      if (ing.unit === "kg" || ing.unit === "lít" || ing.unit === "g") {
        cost = (ing.gramsPerKid / 1000) * ing.unitPrice;
      } else if (ing.unit === "quả" || ing.unit === "hộp") {
        cost =
          (ing.gramsPerKid >= 1 ? ing.gramsPerKid : ing.gramsPerKid / 40) *
          ing.unitPrice;
      } else {
        cost = (ing.gramsPerKid / 1000) * ing.unitPrice;
      }
      return acc + cost;
    }, 0);
  }, [menuForm.ingredients]);

  // Thống kê Ngân sách vs Tiền định lượng vs Chi phí đi chợ thực tế
  const totalBudget = groceryKidCount * mealFeePerKid;

  const totalTheoreticalCost = useMemo(() => {
    return groceryItems.reduce((acc, item) => {
      return acc + Math.round(item.theoreticalQty * item.unitPrice);
    }, 0);
  }, [groceryItems]);

  const theoreticalCostPerKid = useMemo(() => {
    return groceryKidCount > 0
      ? Math.round(totalTheoreticalCost / groceryKidCount)
      : 0;
  }, [totalTheoreticalCost, groceryKidCount]);

  const totalActualGroceryCost = useMemo(() => {
    return groceryItems.reduce((acc, item) => acc + item.totalCost, 0);
  }, [groceryItems]);

  const balanceDifference = totalBudget - totalActualGroceryCost;

  // Xuất Excel Thực đơn
  const handleExportMenuExcel = () => {
    const headers = [
      "Ngày",
      "Thứ",
      "Bữa Sáng",
      "Bữa Trưa Chính",
      "Bữa Xế (Phụ)",
      "Đơn Giá (VNĐ/trẻ)",
    ];
    const rows = weeklyMenus.map((m) => [
      m.date,
      m.dayOfWeek,
      m.breakfast,
      m.lunch,
      m.snack,
      m.costPerStudent,
    ]);
    exportToExcel(`Thuc_Don_${weeksList[selectedWeekIndex].id}`, headers, rows);
  };

  // In PDF Thực đơn
  const handleExportMenuPDF = () => {
    const headers = [
      "Thứ / Ngày",
      "Bữa Sáng",
      "Bữa Trưa Chính",
      "Bữa Xế",
      "Định Mức",
    ];
    const rows = weeklyMenus.map((m) => [
      `${m.dayOfWeek}\n(${m.date})`,
      m.breakfast,
      m.lunch,
      m.snack,
      formatCurrency(m.costPerStudent),
    ]);
    exportToPDF(
      `THỰC ĐƠN DINH DƯỠNG TUẦN - ${weeksList[selectedWeekIndex].label.toUpperCase()}`,
      headers,
      rows,
    );
  };

  // Lọc danh sách kho trong modal tìm kiếm
  const filteredWarehouseInModal = useMemo(() => {
    return warehouseInventory.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(warehouseSearch.toLowerCase()) ||
        item.code.toLowerCase().includes(warehouseSearch.toLowerCase()) ||
        item.supplier.toLowerCase().includes(warehouseSearch.toLowerCase());
      const matchCategory =
        warehouseCategoryFilter === "ALL" ||
        item.category === warehouseCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [warehouseInventory, warehouseSearch, warehouseCategoryFilter]);

  // Tích chọn toàn bộ các món đang hiển thị trong modal
  const handleSelectAllInModal = () => {
    setSelectedInModal((prev) => {
      const updated = { ...prev };
      filteredWarehouseInModal.forEach((wh) => {
        const curQty =
          updated[wh.id]?.qty || calculateSuggestedQty(wh, groceryKidCount);
        updated[wh.id] = { selected: true, qty: curQty };
      });
      return updated;
    });
  };

  // Bỏ chọn toàn bộ các món đang hiển thị trong modal
  const handleDeselectAllInModal = () => {
    setSelectedInModal((prev) => {
      const updated = { ...prev };
      filteredWarehouseInModal.forEach((wh) => {
        const curQty =
          updated[wh.id]?.qty || calculateSuggestedQty(wh, groceryKidCount);
        updated[wh.id] = { selected: false, qty: curQty };
      });
      return updated;
    });
  };

  // Kiểm tra trạng thái đã chọn tất cả hoặc tắt tất cả các món đang lọc
  const isAllFilteredSelected = useMemo(() => {
    if (filteredWarehouseInModal.length === 0) return false;
    return filteredWarehouseInModal.every(
      (wh) => selectedInModal[wh.id]?.selected,
    );
  }, [filteredWarehouseInModal, selectedInModal]);

  const isNoneFilteredSelected = useMemo(() => {
    if (filteredWarehouseInModal.length === 0) return true;
    return filteredWarehouseInModal.every(
      (wh) => !selectedInModal[wh.id]?.selected,
    );
  }, [filteredWarehouseInModal, selectedInModal]);

  const selectedCountInModal = Object.values(selectedInModal).filter(
    (v) => v.selected,
  ).length;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ERP MODULE HEADER BANNER */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl text-white shadow-md shadow-amber-500/20">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Quản Lý Thực Đơn Dinh Dưỡng Hàng Ngày
                </h1>
                {/* <span className="text-xs font-extrabold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Chuẩn Bộ GD&ĐT
                </span> */}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Thiết lập thực đơn dinh dưỡng theo tuần, phân chia rõ ràng Bữa
                sáng, Bữa trưa chính và Bữa xế chiều.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto justify-start sm:justify-end">
            <button
              onClick={handleExportMenuExcel}
              className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap flex-1 sm:flex-initial cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Xuất Excel</span>
            </button>

            <button
              onClick={handleExportMenuPDF}
              className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap flex-1 sm:flex-initial cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500 shrink-0" />
              <span>In PDF Thực Đơn</span>
            </button>

            <button
              onClick={handleOpenAddMenu}
              className="h-9 px-4 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-amber-600/20 transition-all whitespace-nowrap w-full sm:w-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Thêm Thực Đơn Ngày Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. WEEK SELECTOR & QUICK NAVIGATION */}
      {/* ========================================================================= */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            disabled={selectedWeekIndex >= weeksList.length - 1}
            onClick={() => setSelectedWeekIndex((prev) => prev + 1)}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
            title="Tuần trước đó"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>

          <div className="flex items-center gap-2 bg-slate-50 h-9 px-3.5 rounded-xl border border-slate-200 flex-1 sm:flex-initial">
            <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
            <select
              value={selectedWeekIndex}
              onChange={(e) => setSelectedWeekIndex(Number(e.target.value))}
              className="bg-transparent font-extrabold text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              {weeksList.map((w, idx) => (
                <option key={w.id} value={idx}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>

          <button
            disabled={selectedWeekIndex <= 0}
            onClick={() => setSelectedWeekIndex((prev) => prev - 1)}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
            title="Tuần tiếp theo"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500 font-semibold">
            Đơn giá suất ăn định mức:{" "}
            <strong className="text-amber-600 font-black">
              30.000 đ / trẻ / ngày
            </strong>
          </span>
          <button
            onClick={loadMenus}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
            title="Tải lại thực đơn"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. WEEKLY DAILY MENU CARDS (THÊM, XÓA, SỬA TỪNG NGÀY) */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <span>📅 Thực Đơn Các Ngày Trong Tuần</span>
            <span className="text-[11px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
              {weeklyMenus.length} ngày đã lên lịch
            </span>
          </h3>
        </div>

        {weeklyMenus.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">
              Tuần này chưa có thực đơn nào được lưu trong CSDL
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Bạn có thể bấm nút dưới đây để tạo thực đơn ngày mới cho các bé.
            </p>
            <button
              onClick={handleOpenAddMenu}
              className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Thực Đơn Ngày Mới</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {weeklyMenus.map((menu) => (
              <div
                key={menu.id || menu.date}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-300 hover:shadow-md transition-all group"
              >
                {/* Day Header */}
                <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
                  <div>
                    <span className="font-black text-xs block">
                      {menu.dayOfWeek}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {menu.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditMenu(menu)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="Chỉnh sửa thực đơn ngày này"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMenu(menu)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="Xóa thực đơn ngày này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Meals Content */}
                <div className="p-4 space-y-3 flex-1 text-xs">
                  <div>
                    <span className="font-black text-indigo-600 block uppercase tracking-wider text-[10px] mb-0.5 flex items-center gap-1">
                      <Soup className="w-3.5 h-3.5" /> Bữa sáng
                    </span>
                    <p className="text-slate-800 font-bold leading-relaxed">
                      {menu.breakfast}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-2.5">
                    <span className="font-black text-emerald-600 block uppercase tracking-wider text-[10px] mb-0.5 flex items-center gap-1">
                      <Drumstick className="w-3.5 h-3.5" /> Bữa trưa chính
                    </span>
                    <p className="text-slate-800 font-bold leading-relaxed">
                      {menu.lunch}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-2.5">
                    <span className="font-black text-amber-600 block uppercase tracking-wider text-[10px] mb-0.5 flex items-center gap-1">
                      <Apple className="w-3.5 h-3.5" /> Bữa xế (phụ)
                    </span>
                    <p className="text-slate-800 font-bold leading-relaxed">
                      {menu.snack}
                    </p>
                  </div>
                </div>

                {/* Footer Cost & Ingredients Count */}
                <div className="bg-slate-50 p-3 border-t border-slate-100 text-xs font-bold text-slate-600 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {menu.ingredients && menu.ingredients.length > 0 ? (
                      <span
                        className="text-[10px] font-extrabold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200"
                        title="Đã cấu hình bóc tách nguyên liệu cho các bữa"
                      >
                        {menu.ingredients.length} nguyên liệu
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        Chưa gắn NL
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-normal">
                      Định mức / trẻ:
                    </span>
                    <span className="text-amber-600 font-black">
                      {formatCurrency(menu.costPerStudent)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. SECTION NHẬP ĐỊNH LƯỢNG THỨC ĂN ĐI CHỢ & LIÊN KẾT TỒN KHO THỰC TẾ */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  Sổ Nhập Định Lượng & Cân Đối Ngân Sách Đi Chợ
                </h3>
                <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
                  <Boxes className="w-3.5 h-3.5" />
                  {warehouseInventory.length} mặt hàng trong kho
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Kiểm soát định lượng gram/trẻ, đối soát chi phí đi chợ thực tế
                với ngân sách tiền ăn.
              </p>
            </div>
          </div>

          {/* Section Action: Save Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleSaveGroceriesToDB}
              disabled={isSavingGroceries || selectedGroceryItems.length === 0}
              className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 w-full sm:w-auto"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSavingGroceries
                  ? "Đang lưu..."
                  : `Lưu Sổ Đi Chợ (${selectedGroceryItems.length} món đã chọn)`}
              </span>
            </button>
          </div>
        </div>

        {/* Filters & Parameter Setup (3 Step Controls) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <label className="text-[11px] font-black text-slate-600 block mb-1 uppercase tracking-wider">
              📅 Ngày Đi Chợ / Nấu Ăn
            </label>
            <input
              type="date"
              value={selectedGroceryDate}
              onChange={(e) => setSelectedGroceryDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-600 block mb-1 uppercase tracking-wider">
              👥 Số Trẻ Đi Học Thực Tế (Sĩ số ăn)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="500"
                value={groceryKidCount}
                onChange={(e) => handleUpdateKidCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-indigo-600 focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
              <span className="text-xs font-bold text-slate-500 shrink-0">
                trẻ
              </span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-600 block mb-1 uppercase tracking-wider">
              💰 Đơn Giá Thu Tiền Ăn / Trẻ
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="1000"
                value={mealFeePerKid}
                onChange={(e) => setMealFeePerKid(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
              <span className="text-xs font-bold text-slate-500 shrink-0">
                đ/ngày
              </span>
            </div>
          </div>
        </div>

        {/* Live Financial Budget vs Grocery Cost Summary Bar (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tổng Ngân Sách Thu */}
          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold text-slate-500 uppercase block">
                Tổng Ngân Sách Tiền Ăn
              </span>
              <span className="text-lg font-black text-indigo-700 mt-0.5 block">
                {formatCurrency(totalBudget)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                ({groceryKidCount} trẻ × {formatCurrency(mealFeePerKid)})
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-xl text-indigo-600 shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Tiền Thức Ăn Theo Định Lượng Chuẩn (Lý thuyết) */}
          <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold text-purple-600 uppercase block">
                Tiền Ăn Theo Định Lượng
              </span>
              <span className="text-lg font-black text-purple-700 mt-0.5 block">
                {formatCurrency(totalTheoreticalCost)}
              </span>
              <span className="text-[10px] text-purple-500 font-medium">
                (~{formatCurrency(theoreticalCostPerKid)} / trẻ theo chuẩn)
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-xl text-purple-600 shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Tổng Tiền Mua Thực Tế */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold text-slate-500 uppercase block">
                Tổng Tiền Mua Thực Tế
              </span>
              <span className="text-lg font-black text-amber-700 mt-0.5 block">
                {formatCurrency(totalActualGroceryCost)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                ({groceryItems.length} món thực phẩm)
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-xl text-amber-600 shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Cân Đối Ngân Sách Đi Chợ */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              balanceDifference >= 0
                ? "bg-emerald-50/60 border-emerald-100 text-emerald-800"
                : "bg-rose-50/60 border-rose-100 text-rose-800"
            }`}
          >
            <div>
              <span className="text-[11px] font-extrabold uppercase block">
                {balanceDifference >= 0
                  ? "Tiết Kiệm / Cân Bằng Quỹ"
                  : "Vượt Định Mức Ngân Sách"}
              </span>
              <span className="text-lg font-black mt-0.5 block">
                {balanceDifference >= 0
                  ? `+${formatCurrency(balanceDifference)}`
                  : formatCurrency(balanceDifference)}
              </span>
              <span className="text-[10px] font-medium">
                {balanceDifference >= 0
                  ? "✓ Chi tiêu an toàn hợp lý"
                  : "⚠️ Cần rà soát lại đơn giá/khối lượng"}
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-xl shadow-xs">
              {balanceDifference >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-rose-600" />
              )}
            </div>
          </div>
        </div>

        {/* BẢNG HIỂN THỊ CÁC NGUYÊN LIỆU ĐÃ ĐƯỢC THÊM & THANH CÔNG CỤ NÚT BẤM */}
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          {/* Table Header Action Toolbar */}
          <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                <span>📋 Danh Sách Nguyên Liệu Đã Thêm</span>
                <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  {groceryItems.length} món
                </span>
              </h4>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
              {/* NÚT LẤY TỪ THỰC ĐƠN NGÀY */}
              <button
                onClick={handleSyncGroceriesFromDailyMenu}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Tự động bóc tách lại nguyên liệu và định lượng từ Thực đơn của ngày này"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                <span>Lấy từ Thực Đơn</span>
              </button>

              {/* NÚT CHỌN NGUYÊN LIỆU TỪ KHO */}
              <button
                onClick={handleOpenWarehousePicker}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-extrabold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Warehouse className="w-4 h-4" />
                <span>Chọn nguyên liệu</span>
              </button>

              {/* NÚT THÊM MÓN NGOÀI KHO */}
              <button
                onClick={() => setIsAddCustomModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>Thêm Món Ngoài Kho</span>
              </button>

              {/* NÚT XÓA HẾT NẾU ĐÃ CÓ MÓN */}
              {groceryItems.length > 0 && (
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Bạn có chắc chắn muốn xóa tất cả các món nguyên liệu đã thêm trong ngày này không?",
                      )
                    ) {
                      setGroceryItems([]);
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="Xóa tất cả các món đã thêm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Xóa hết</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {groceryItems.length === 0 ? (
              /* TRẠNG THÁI TRỐNG: KHI CHƯA CHỌN MÓN TỪ KHO */
              <div className="py-12 px-6 text-center space-y-4 bg-slate-50/40">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs border border-indigo-100">
                  <Warehouse className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="font-extrabold text-slate-800 text-base">
                    Chưa có nguyên liệu nào được chọn cho ngày{" "}
                    {selectedGroceryDate}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Bấm nút <strong>"Chọn nguyên liệu"</strong> để mở danh mục
                    kho và chọn các món cần nấu cho bữa ăn hôm nay.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleOpenWarehousePicker}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
                  >
                    <Warehouse className="w-4 h-4" />
                    <span>Chọn nguyên liệu</span>
                  </button>

                  <button
                    onClick={() => setIsAddCustomModalOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs font-bold shadow-2xs cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4 text-indigo-600" />
                    <span>Thêm Món Ngoài Kho</span>
                  </button>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">
                      <button
                        type="button"
                        onClick={handleToggleSelectAllGroceries}
                        className="p-1 hover:bg-slate-200 rounded cursor-pointer transition-colors"
                        title={
                          isAllGroceriesSelected
                            ? "Bỏ chọn tất cả"
                            : "Chọn tất cả"
                        }
                      >
                        {isAllGroceriesSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600 fill-indigo-100" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-4">Tên Thực Phẩm / Nguyên Liệu</th>
                    <th className="py-3 px-4 text-center">Tồn Kho Hiện Tại</th>
                    <th className="py-3 px-4">Định Lượng</th>
                    <th className="py-3 px-4 w-40">Khối Lượng Mua Thực Tế</th>
                    <th className="py-3 px-4 w-36">Đơn Giá (VNĐ)</th>
                    <th className="py-3 px-4">Thành Tiền Mua</th>
                    <th className="py-3 px-4">Nguồn Gốc / Nhà Cung Cấp</th>
                    <th className="py-3 px-4 text-right">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {groceryItems.map((item) => {
                    const isChecked = item.selected !== false;
                    const isStockSufficient =
                      item.stockQty >= item.theoreticalQty;
                    const isStockAvailable = item.stockQty > 0;

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          isChecked
                            ? "hover:bg-slate-50/80 bg-white"
                            : "opacity-50 bg-slate-50/50 hover:opacity-80"
                        }`}
                      >
                        {/* Checkbox chọn lưu */}
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              handleToggleGroceryItem(item.id, e.target.checked)
                            }
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                            title="Tích chọn để lưu món này vào CSDL"
                          />
                        </td>

                        {/* Name & Code */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {item.code && (
                              <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {item.code}
                              </span>
                            )}
                            <span className="font-extrabold text-slate-900">
                              {item.name}
                            </span>
                          </div>
                          {item.standardPerKidGrams > 0 && (
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                              Chuẩn: {item.standardPerKidGrams}g / trẻ
                            </span>
                          )}
                        </td>

                        {/* Tồn Kho Hiện Tại (HIỂN THỊ SỐ LƯỢNG CÒN LẠI TRONG KHO) */}
                        <td className="py-3 px-4 text-center">
                          {isStockSufficient ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>
                                Đủ kho ({item.stockQty} {item.unit})
                              </span>
                            </span>
                          ) : isStockAvailable ? (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200"
                              title={`Kho còn ${item.stockQty} ${item.unit}, thiếu ${(item.theoreticalQty - item.stockQty).toFixed(1)} ${item.unit} so với định lượng`}
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>
                                Tồn: {item.stockQty} {item.unit} (Thiếu{" "}
                                {(item.theoreticalQty - item.stockQty).toFixed(
                                  1,
                                )}
                                )
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                              <Warehouse className="w-3 h-3 text-slate-400" />
                              <span>Hết kho (0 {item.unit})</span>
                            </span>
                          )}
                        </td>

                        {/* Theoretical Qty */}
                        <td className="py-3 px-4 text-slate-600 font-bold">
                          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                            {item.theoreticalQty} {item.unit}
                          </span>
                        </td>

                        {/* Editable Actual Quantity */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={item.actualQty}
                              onChange={(e) =>
                                handleActualQtyChange(
                                  item.id,
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-24 px-2 py-1.5 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs font-black text-indigo-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-center"
                              placeholder="Số lượng mua"
                            />
                            <span className="text-[11px] font-bold text-slate-500">
                              {item.unit}
                            </span>
                          </div>
                        </td>

                        {/* Editable Unit Price */}
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            step="500"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleUnitPriceChange(
                                item.id,
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-28 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </td>

                        {/* Total Cost */}
                        <td className="py-3 px-4 font-black text-slate-900 text-sm">
                          {formatCurrency(item.totalCost)}
                        </td>

                        {/* Supplier */}
                        <td className="py-3 px-4 text-slate-600 font-medium max-w-xs truncate">
                          {item.supplier}
                        </td>

                        {/* Delete */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteGroceryItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Xóa món này khỏi sổ đi chợ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CHỌN NGUYÊN LIỆU TỪ KHO (TÍCH CHỌN TỪNG MÓN & HIỂN THỊ TỒN KHO) */}
      {/* ========================================================================= */}
      {isWarehousePickerOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn space-y-4 max-h-[92vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Warehouse className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base sm:text-lg">
                      Chọn Nguyên Liệu Từ Kho Bếp Ăn
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Tích chọn các món nguyên liệu cần dùng cho ngày{" "}
                      <strong className="text-indigo-600">
                        {selectedGroceryDate}
                      </strong>{" "}
                      (Sĩ số: {groceryKidCount} trẻ)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsWarehousePickerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search & Category Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={warehouseSearch}
                    onChange={(e) => setWarehouseSearch(e.target.value)}
                    placeholder="Tìm theo tên thực phẩm, mã TP, nhà cung cấp..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {[
                    { id: "ALL", label: "Tất Cả" },
                    { id: "PROTEIN", label: "🥩 Đạm/Thịt Cá" },
                    { id: "CARB", label: "🍚 Tinh Bột" },
                    { id: "VEG", label: "🥦 Rau Củ" },
                    { id: "FRUIT_DAIRY", label: "🥛 Sữa & Quả" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setWarehouseCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        warehouseCategoryFilter === cat.id
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Select All / Deselect All Single Smart Toggle */}
              <div className="flex items-center justify-between gap-2 px-1 text-xs shrink-0 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-slate-600 font-bold text-[11px]">
                  Danh sách: <strong>{filteredWarehouseInModal.length}</strong>{" "}
                  nguyên liệu trong kho
                </span>

                {/* NÚT THÔNG MINH DUY NHẤT: CHỌN / BỎ CHỌN TẤT CẢ */}
                <button
                  type="button"
                  onClick={
                    isAllFilteredSelected
                      ? handleDeselectAllInModal
                      : handleSelectAllInModal
                  }
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border shadow-2xs ${
                    isAllFilteredSelected
                      ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-300"
                      : "bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border-slate-200"
                  }`}
                >
                  {isAllFilteredSelected ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-600 fill-indigo-100" />
                      <span>Bỏ Chọn Tất Cả</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                      <span>Chọn Tất Cả</span>
                    </>
                  )}
                </button>
              </div>

              {/* Warehouse Items Selection Grid / Table */}
              <div className="overflow-y-auto flex-1 border border-slate-200 rounded-2xl divide-y divide-slate-100 text-xs">
                {filteredWarehouseInModal.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    Không tìm thấy nguyên liệu nào trong kho phù hợp với từ khóa
                    tìm kiếm.
                  </div>
                ) : (
                  filteredWarehouseInModal.map((wh) => {
                    const isChecked = selectedInModal[wh.id]?.selected || false;
                    const curQty =
                      selectedInModal[wh.id]?.qty ||
                      calculateSuggestedQty(wh, groceryKidCount);
                    const isStockSufficient = wh.stockQuantity >= curQty;

                    return (
                      <div
                        key={wh.id}
                        onClick={() => {
                          setSelectedInModal((prev) => ({
                            ...prev,
                            [wh.id]: {
                              selected: !isChecked,
                              qty: prev[wh.id]?.qty || curQty,
                            },
                          }));
                        }}
                        className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors cursor-pointer ${
                          isChecked
                            ? "bg-indigo-50/60 border-l-4 border-indigo-600"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        {/* Left Checkbox & Name */}
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="mt-0.5 sm:mt-0 text-indigo-600">
                            {isChecked ? (
                              <CheckSquare className="w-5 h-5 fill-indigo-600 text-white" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-100/70 px-1.5 py-0.5 rounded">
                                {wh.code}
                              </span>
                              <span className="font-extrabold text-slate-900 text-sm">
                                {wh.name}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                              Đơn giá:{" "}
                              <strong>
                                {formatCurrency(wh.unitPrice)} / {wh.unit}
                              </strong>{" "}
                              | NCC: {wh.supplier}
                            </span>
                          </div>
                        </div>

                        {/* Right Stock & Quantity Input */}
                        <div
                          className="flex items-center justify-between sm:justify-end gap-3 pl-8 sm:pl-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Tồn Kho Hiện Tại */}
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-medium">
                              Tồn kho hiện tại:
                            </span>
                            <span
                              className={`text-xs font-black px-2 py-0.5 rounded-full inline-block ${
                                isStockSufficient
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {wh.stockQuantity} {wh.unit}
                            </span>
                          </div>

                          {/* Số lượng cần lấy */}
                          <div className="flex items-center gap-1.5">
                            <label className="text-[11px] font-bold text-slate-500 shrink-0">
                              Lấy:
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={curQty}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setSelectedInModal((prev) => ({
                                  ...prev,
                                  [wh.id]: {
                                    selected: true,
                                    qty: val,
                                  },
                                }));
                              }}
                              className="w-18 px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-indigo-700 focus:outline-none focus:border-indigo-500 text-center"
                            />
                            <span className="text-xs font-bold text-slate-500 w-8">
                              {wh.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
                <span className="text-xs font-bold text-slate-600">
                  Đã chọn:{" "}
                  <strong className="text-indigo-600 font-black text-sm">
                    {selectedCountInModal}
                  </strong>{" "}
                  món nguyên liệu
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWarehousePickerOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer text-xs"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmWarehouseSelection}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5 text-xs transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Đưa {selectedCountInModal} Món Vào Sổ Đi Chợ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: THÊM / SỬA THỰC ĐƠN NGÀY & BÓC TÁCH NGUYÊN LIỆU TỪNG BỮA */}
      {/* ========================================================================= */}
      {isMenuModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn space-y-4 max-h-[92vh] overflow-y-auto flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      {editingMenu
                        ? "Cập Nhật Thực Đơn & Định Lượng Ngày"
                        : "Thêm Thực Đơn & Định Lượng Ngày Mới"}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Cấu hình món ăn và bóc tách nguyên liệu gram/trẻ cho các bữa
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMenu} className="space-y-4 text-xs flex-1">
                {/* 1. Date and Cost Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">
                      📅 Ngày áp dụng <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={menuForm.date}
                      onChange={(e) =>
                        setMenuForm({ ...menuForm, date: e.target.value })
                      }
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-extrabold text-slate-700">
                        💰 Đơn giá suất ăn (VNĐ / trẻ)
                      </label>
                      {totalMenuIngredientsCostPerKid > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setMenuForm({
                              ...menuForm,
                              costPerStudent: Math.round(
                                totalMenuIngredientsCostPerKid,
                              ),
                            })
                          }
                          className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer flex items-center gap-0.5"
                          title="Lấy chi phí tính từ nguyên liệu"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Áp dụng ước tính ({formatCurrency(totalMenuIngredientsCostPerKid)})</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      step="1000"
                      value={menuForm.costPerStudent}
                      onChange={(e) =>
                        setMenuForm({
                          ...menuForm,
                          costPerStudent: parseFloat(e.target.value) || 30000,
                        })
                      }
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 2. Three Meals Menu Text Fields */}
                <div className="space-y-2.5">
                  <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>🍲 Tên Món Ăn Trong Ngày</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-extrabold text-indigo-700 block mb-1 flex items-center gap-1">
                        <Soup className="w-3.5 h-3.5" /> Bữa sáng{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: Cháo thịt bằm, Sữa tươi"
                        value={menuForm.breakfast}
                        onChange={(e) =>
                          setMenuForm({
                            ...menuForm,
                            breakfast: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-emerald-700 block mb-1 flex items-center gap-1">
                        <Drumstick className="w-3.5 h-3.5" /> Bữa trưa chính{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: Cơm trắng, Thịt bò xào, Canh bí"
                        value={menuForm.lunch}
                        onChange={(e) =>
                          setMenuForm({ ...menuForm, lunch: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-amber-700 block mb-1 flex items-center gap-1">
                        <Apple className="w-3.5 h-3.5" /> Bữa xế (phụ){" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: Chuối tiêu, Sữa chua"
                        value={menuForm.snack}
                        onChange={(e) =>
                          setMenuForm({ ...menuForm, snack: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Section Bóc Tách Nguyên Liệu Cho Từng Bữa Ăn */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
                    <div>
                      <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-purple-600" />
                        <span>Bóc Tách Nguyên Liệu & Định Lượng (Gram/Trẻ)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Nguyên liệu sẽ tự động đẩy sang <strong>Sổ Đi Chợ</strong> theo sĩ số học sinh
                      </p>
                    </div>

                    {/* Meal Tab Selector */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                      {[
                        {
                          id: "BREAKFAST" as const,
                          label: "🥣 Bữa Sáng",
                          count: menuForm.ingredients.filter(
                            (i) => i.meal === "BREAKFAST",
                          ).length,
                        },
                        {
                          id: "LUNCH" as const,
                          label: "🍗 Bữa Trưa",
                          count: menuForm.ingredients.filter(
                            (i) => i.meal === "LUNCH",
                          ).length,
                        },
                        {
                          id: "SNACK" as const,
                          label: "🍎 Bữa Xế",
                          count: menuForm.ingredients.filter(
                            (i) => i.meal === "SNACK",
                          ).length,
                        },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveMenuMealTab(tab.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            activeMenuMealTab === tab.id
                              ? "bg-indigo-600 text-white shadow-2xs"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                              activeMenuMealTab === tab.id
                                ? "bg-white/20 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {tab.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Add Ingredient into Active Meal Tab */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="flex-1 w-full">
                      <select
                        value={selectedWarehouseForMenu}
                        onChange={(e) =>
                          setSelectedWarehouseForMenu(e.target.value)
                        }
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="">-- Chọn nguyên liệu từ kho --</option>
                        {warehouseInventory.map((wh) => (
                          <option key={wh.id} value={wh.id}>
                            [{wh.code}] {wh.name} ({formatCurrency(wh.unitPrice)} / {wh.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                      <label className="text-[11px] font-bold text-slate-500 shrink-0">
                        Định lượng:
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={menuIngQtyGrams}
                        onChange={(e) =>
                          setMenuIngQtyGrams(parseFloat(e.target.value) || 0)
                        }
                        className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-indigo-700 text-center focus:bg-white focus:outline-none focus:border-indigo-500"
                        placeholder="g / trẻ"
                      />
                      <span className="text-xs font-bold text-slate-500 shrink-0">
                        g/trẻ
                      </span>

                      <button
                        type="button"
                        onClick={handleAddWarehouseIngToMenu}
                        disabled={!selectedWarehouseForMenu}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shrink-0 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm</span>
                      </button>
                    </div>
                  </div>

                  {/* List of Ingredients in Active Meal Tab */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-44 overflow-y-auto">
                    {menuForm.ingredients.filter(
                      (i) => i.meal === activeMenuMealTab,
                    ).length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        Chưa có nguyên liệu nào được thêm cho{" "}
                        <strong>
                          {activeMenuMealTab === "BREAKFAST"
                            ? "Bữa Sáng"
                            : activeMenuMealTab === "LUNCH"
                              ? "Bữa Trưa"
                              : "Bữa Xế"}
                        </strong>
                        . Hãy chọn món từ kho phía trên.
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-600 uppercase">
                          <tr>
                            <th className="py-2 px-3">Tên Nguyên Liệu</th>
                            <th className="py-2 px-3 text-center">
                              Định Lượng / Trẻ
                            </th>
                            <th className="py-2 px-3">Đơn Giá Kho</th>
                            <th className="py-2 px-3">Ước Tính / Trẻ</th>
                            <th className="py-2 px-3 text-right">Xóa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {menuForm.ingredients
                            .filter((i) => i.meal === activeMenuMealTab)
                            .map((ing) => {
                              const costPerKid =
                                ing.unit === "kg" ||
                                ing.unit === "lít" ||
                                ing.unit === "g"
                                  ? Math.round(
                                      (ing.gramsPerKid / 1000) * ing.unitPrice,
                                    )
                                  : Math.round(
                                      (ing.gramsPerKid >= 1
                                        ? ing.gramsPerKid
                                        : ing.gramsPerKid / 40) * ing.unitPrice,
                                    );

                              return (
                                <tr
                                  key={ing.id}
                                  className="hover:bg-slate-50 transition-colors"
                                >
                                  <td className="py-2 px-3 font-extrabold text-slate-800">
                                    <div className="flex items-center gap-1.5">
                                      {ing.code && (
                                        <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">
                                          {ing.code}
                                        </span>
                                      )}
                                      <span>{ing.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-2 px-3 text-center font-bold text-indigo-700">
                                    <span className="bg-indigo-50 px-2 py-0.5 rounded-full">
                                      {ing.gramsPerKid}{" "}
                                      {ing.unit === "quả" || ing.unit === "hộp"
                                        ? ing.unit
                                        : "g"}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-slate-600 font-medium">
                                    {formatCurrency(ing.unitPrice)} / {ing.unit}
                                  </td>
                                  <td className="py-2 px-3 font-extrabold text-emerald-700">
                                    ~{formatCurrency(costPerKid)}
                                  </td>
                                  <td className="py-2 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveIngFromMenu(ing.id)
                                      }
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                      title="Xóa nguyên liệu này"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Summary Bar inside Modal */}
                  <div className="flex items-center justify-between text-xs pt-1 px-1 text-slate-600">
                    <span>
                      Tổng cộng cả ngày:{" "}
                      <strong className="text-slate-900 font-black">
                        {menuForm.ingredients.length} nguyên liệu
                      </strong>
                    </span>
                    <span>
                      Chi phí nguyên liệu chuẩn ước tính:{" "}
                      <strong className="text-purple-700 font-black text-sm">
                        ~{formatCurrency(totalMenuIngredientsCostPerKid)} / trẻ
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsMenuModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer text-xs"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-extrabold shadow-md shadow-amber-600/20 cursor-pointer text-xs transition-all"
                  >
                    {editingMenu ? "Cập Nhật Thực Đơn" : "Lưu Thực Đơn Mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: THÊM MÓN NGOÀI KHO */}
      {/* ========================================================================= */}
      {isAddCustomModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      Thêm Món Thực Phẩm Ngoài Kho
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Bổ sung nguyên liệu tươi mua phát sinh ngoài chợ
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddCustomModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleAddCustomItem}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Tên thực phẩm / nguyên liệu{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Cá hồi phi lê, Su hào, Nước mắm..."
                    value={customGroceryForm.name}
                    onChange={(e) =>
                      setCustomGroceryForm({
                        ...customGroceryForm,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">
                      Số lượng thực tế <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      min="0.1"
                      value={customGroceryForm.actualQty}
                      onChange={(e) =>
                        setCustomGroceryForm({
                          ...customGroceryForm,
                          actualQty: parseFloat(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-700 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">
                      Đơn vị tính
                    </label>
                    <select
                      value={customGroceryForm.unit}
                      onChange={(e) =>
                        setCustomGroceryForm({
                          ...customGroceryForm,
                          unit: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    >
                      <option value="kg">kg (Kilogram)</option>
                      <option value="lít">lít (Lít)</option>
                      <option value="quả">quả / trái</option>
                      <option value="hộp">hộp / vỉ</option>
                      <option value="bó">bó / gói</option>
                      <option value="thùng">thùng / két</option>
                      <option value="chai">chai / hũ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">
                      Đơn giá mua (VNĐ) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="1000"
                      required
                      value={customGroceryForm.unitPrice}
                      onChange={(e) =>
                        setCustomGroceryForm({
                          ...customGroceryForm,
                          unitPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">
                      Nhóm thực phẩm
                    </label>
                    <select
                      value={customGroceryForm.category}
                      onChange={(e) =>
                        setCustomGroceryForm({
                          ...customGroceryForm,
                          category: e.target.value as any,
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    >
                      <option value="PROTEIN">
                        Chất đạm (Thịt, cá, trứng)
                      </option>
                      <option value="CARB">Tinh bột (Gạo, bún, mì)</option>
                      <option value="VEG">Rau củ quả sạch</option>
                      <option value="FRUIT_DAIRY">Sữa & Trái cây</option>
                      <option value="SPICE_OTHER">Gia vị & Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Nhà cung cấp / Nguồn mua
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Siêu thị WinMart, Chợ đầu mối phía Nam"
                    value={customGroceryForm.supplier}
                    onChange={(e) =>
                      setCustomGroceryForm({
                        ...customGroceryForm,
                        supplier: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddCustomModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    Thêm Vào Bảng
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
