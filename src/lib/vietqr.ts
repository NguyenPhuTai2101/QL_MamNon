export interface VietQRParams {
  bankId?: string;       // Ví dụ: TCB, MB, VCB, ICB, ACB
  accountNo?: string;    // Số tài khoản ngân hàng nhà trường (VD: 6785271578)
  accountName?: string;  // Tên chủ tài khoản (HO KINH DOANH LOP MAM NON DOC LAP ANH BINH MINH)
  amount: number;        // Số tiền học phí
  memo: string;          // Nội dung chuyển khoản
}

export function generateVietQRUrl({
  bankId = "TCB",
  accountNo = "6785271578",
  accountName = "HO KINH DOANH LOP MAM NON DOC LAP ANH BINH MINH",
  amount,
  memo
}: VietQRParams): string {
  const cleanMemo = encodeURIComponent(memo.replace(/[^a-zA-Z0-9 ]/g, ""));
  const cleanAccountName = encodeURIComponent(accountName);
  
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${cleanMemo}&accountName=${cleanAccountName}`;
}

