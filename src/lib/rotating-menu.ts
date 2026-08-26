import { MenuIngredientItem } from "@/components/menu-tab";

export interface RotatingWeekDay {
  dayOfWeek: string;
  dayIndex: number;
  breakfast: string;
  lunch: string;
  snack: string;
  ingredients?: MenuIngredientItem[];
}

export interface RotatingWeek {
  weekNumber: number;
  title: string;
  days: RotatingWeekDay[];
}

// Bảng thực đơn chuẩn 4 tuần luân phiên hàng tháng cho trường mầm non (nguyên liệu mặc định để trống cho người dùng tự chọn)
export const DEFAULT_ROTATING_WEEKS: RotatingWeek[] = [
  {
    "weekNumber": 1,
    "days": [
      {
        "dayOfWeek": "Thứ Hai",
        "dayIndex": 0,
        "breakfast": "Cháo thịt nấm rơm",
        "lunch": "Thịt kho trứng cút, Canh cải thịt xay",
        "snack": "Chuối, Bánh canh tôm thịt giá hẹ",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Ba",
        "dayIndex": 1,
        "breakfast": "Bún bò bí đỏ",
        "lunch": "Cá lóc đồng kho nghệ, Canh bò bí đỏ",
        "snack": "Táo, Cháo cá lóc cải xanh",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Tư",
        "dayIndex": 2,
        "breakfast": "Bánh cuốn thịt luộc, giá",
        "lunch": "Gà kho gừng, Canh bầu nấu thịt",
        "snack": "Dưa hấu, Súp gà rau củ",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Năm",
        "dayIndex": 3,
        "breakfast": "Nui thịt cà rốt",
        "lunch": "Tôm thịt rim, Canh gà mồng tơi",
        "snack": "Thanh long, Miến rau củ",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Sáu",
        "dayIndex": 4,
        "breakfast": "Phở gà súp lơ",
        "lunch": "Thịt bằm sốt cà chua, Canh chua cá lóc rau muống",
        "snack": "Ổi, Cháo thịt khoai mỡ",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Bảy",
        "dayIndex": 5,
        "breakfast": "Bún gạo thịt xay giá hẹ",
        "lunch": "Trứng chiên, Canh tôm mướp",
        "snack": "Bánh quế, Cháo thịt xay cà rốt",
        "ingredients": []
      }
    ],
    "title": "Tuần 1: Thực đơn Bổ dưỡng Chuẩn"
  },
  {
    "weekNumber": 2,
    "days": [
      {
        "dayOfWeek": "Thứ Hai",
        "dayIndex": 0,
        "breakfast": "Bánh canh mực súp lơ",
        "lunch": "Cá diêu hồng kho cà chua, Canh cải thịt bằm",
        "snack": "Lê, Cháo gà cải xanh",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Ba",
        "dayIndex": 1,
        "breakfast": "Xôi gấc, muối đường",
        "lunch": "Thịt đùi ếch rim chua ngọt, Canh bò bí đỏ",
        "snack": "Táo, Phở gà giá hẹ",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Tư",
        "dayIndex": 2,
        "breakfast": "Cháo tim heo hạt sen",
        "lunch": "Cá ba sa kho thơm, Canh bầu nấu thịt",
        "snack": "Dưa hấu, Súp gà rau củ",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Năm",
        "dayIndex": 3,
        "breakfast": "Bún cà ri gà",
        "lunch": "Thịt bò sốt cà rốt, Canh gà mồng tơi",
        "snack": "Thanh long, Miến gà rau củ",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Sáu",
        "dayIndex": 4,
        "breakfast": "Mì thịt xay xà lách",
        "lunch": "Thịt gà kho xì dầu, Canh chua cá lóc",
        "snack": "Ổi, Cháo cá lóc khoai lang",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Bảy",
        "dayIndex": 5,
        "breakfast": "Bún gạo thịt bằm cà rốt",
        "lunch": "Trứng chiên, Canh tôm mướp",
        "snack": "Nho, Nui gà cải thìa",
        "ingredients": []
      }
    ],
    "title": "Tuần 2: Thực đơn Đổi vị Thanh nhiệt"
  },
  {
    "weekNumber": 3,
    "days": [
      {
        "dayOfWeek": "Thứ Hai",
        "dayIndex": 0,
        "breakfast": "Hủ tiếu cá lóc giá hẹ",
        "lunch": "Thịt heo bằm sốt cà chua, Canh thịt bò su su cà rốt",
        "snack": "Dưa hấu, Cháo trứng hạt sen bí đỏ",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Ba",
        "dayIndex": 1,
        "breakfast": "Cháo hải sản cà rốt nấm rơm",
        "lunch": "Cá nục kho nghệ, Canh rau mồng tơi cua đồng",
        "snack": "Ổi, Súp tôm nấm tuyết",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Tư",
        "dayIndex": 2,
        "breakfast": "Phở bò húng quế",
        "lunch": "Tôm ba chỉ kho thơm, Canh bắp cải thịt bằm",
        "snack": "Quýt đường, Mì sườn củ quả",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Năm",
        "dayIndex": 3,
        "breakfast": "Bún riêu mọc ngò gai",
        "lunch": "Thịt gà kho củ quả, Canh súp lơ tôm tươi",
        "snack": "Đu đủ chín, Bún gạo hải sản giá hẹ",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Sáu",
        "dayIndex": 4,
        "breakfast": "Nui nấu mực ống cải thìa",
        "lunch": "Ba chỉ ram mặn, Canh khoai mỡ nấu thịt bằm",
        "snack": "Táo, Bún gạo thịt bằm cà rốt",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Bảy",
        "dayIndex": 5,
        "breakfast": "Cháo gà khoai tây",
        "lunch": "Cá thu sốt cà chua, Canh bí đỏ thịt xay",
        "snack": "Dưa lưới, Cháo gà nấm rơm",
        "ingredients": []
      }
    ],
    "title": "Tuần 3: Thực đơn Tăng cường Vi chất"
  },
  {
    "weekNumber": 4,
    "days": [
      {
        "dayOfWeek": "Thứ Hai",
        "dayIndex": 0,
        "breakfast": "Xôi gấc muối đậu",
        "lunch": "Thịt ba chỉ đậu hủ kho củ cải, Canh cải ngọt cá thác lác",
        "snack": "Dưa hấu, Cháo gà bí đỏ",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Ba",
        "dayIndex": 1,
        "breakfast": "Bánh ướt bì (bì ba chỉ xắt sợi)",
        "lunch": "Cá ba sa chiên giòn sốt nước mắm chua ngọt, Canh súp sườn non",
        "snack": "Ổi, Bún gạo nấu thịt xay",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Tư",
        "dayIndex": 2,
        "breakfast": "Bún thịt nướng",
        "lunch": "Tôm ba chỉ kho bông cải, Canh tôm mồng tơi",
        "snack": "Quýt đường, Mì thịt xay củ quả",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Năm",
        "dayIndex": 3,
        "breakfast": "Hủ tiếu thịt bằm xà lách",
        "lunch": "Trứng sốt cà chua, Canh chua thịt gà húng quế",
        "snack": "Đu đủ chín, Nui hải sản giá hẹ",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Sáu",
        "dayIndex": 4,
        "breakfast": "Phở bò húng quế",
        "lunch": "Cá điêu hồng kho thơm, Canh khoai mỡ nấu thịt xay",
        "snack": "Táo, Bún gạo thịt bằm cà rốt",
        "ingredients": []
      },
      {
        "dayOfWeek": "Thứ Bảy",
        "dayIndex": 5,
        "breakfast": "Cháo thịt bằm cà rốt",
        "lunch": "Gà kho xì dầu, Canh chua cá lóc đậu bắp",
        "snack": "Dưa lưới, Miến gà giá hẹ",
        "ingredients": []
      }
    ],
    "title": "Tuần 4: Thực đơn Đa dạng Hương vị"
  }
];

// Tính toán tuần luân phiên trong tháng (Tuần 1, 2, 3, 4)
export function getWeekIndexInMonth(mondayDate: Date): number {
  const day = mondayDate.getDate();
  return Math.min(3, Math.floor((day - 1) / 7));
}

// Lấy thực đơn mẫu theo ngày cụ thể
export function getTemplateMenuForDate(dateObj: Date): {
  weekNumber: number;
  day: RotatingWeekDay;
} {
  const dayOfWeek = dateObj.getDay(); // 0: CN, 1: T2, 2: T3, ..., 6: T7
  const dayIndex = dayOfWeek === 0 ? 0 : dayOfWeek - 1; // map to 0..5 (T2..T7)
  const safeDayIndex = Math.min(5, Math.max(0, dayIndex));

  // Find Monday of this date's week
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const monday = new Date(dateObj);
  monday.setDate(dateObj.getDate() + diffToMonday);

  const weekIdx = getWeekIndexInMonth(monday);
  const week = DEFAULT_ROTATING_WEEKS[weekIdx];
  return {
    weekNumber: weekIdx + 1,
    day: week.days[safeDayIndex] || week.days[0],
  };
}
