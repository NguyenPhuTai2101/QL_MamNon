import { NextResponse } from 'next/server';

let assets = [
  { id: 'TS001', name: 'Máy chiếu Panasonic', category: 'ELECTRONIC', location: 'Phòng học Mầm 1', quantity: 1, unitPrice: 15000000, status: 'GOOD' },
  { id: 'TS002', name: 'Điều hòa Daikin 12000BTU', category: 'ELECTRONIC', location: 'Phòng học Chồi 2', quantity: 3, unitPrice: 12000000, status: 'MAINTENANCE' },
  { id: 'TS003', name: 'Bộ bàn ghế mầm non', category: 'FURNITURE', location: 'Kho tổng', quantity: 30, unitPrice: 800000, status: 'GOOD' },
  { id: 'TS004', name: 'Bộ đồ chơi lắp ráp cỡ lớn', category: 'TOY', location: 'Sân chơi trong nhà', quantity: 5, unitPrice: 2500000, status: 'BROKEN' },
  { id: 'TS005', name: 'Tủ đông Sanaky 400L', category: 'KITCHEN', location: 'Nhà bếp', quantity: 1, unitPrice: 8500000, status: 'GOOD' },
  { id: 'TS006', name: 'Loa kéo trợ giảng', category: 'ELECTRONIC', location: 'Phòng Âm nhạc', quantity: 4, unitPrice: 3000000, status: 'GOOD' },
];

export async function GET() {
  return NextResponse.json(assets);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newAsset = {
      id: `TS00${assets.length + 1}`,
      ...data,
    };
    assets.push(newAsset);
    return NextResponse.json(newAsset, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
