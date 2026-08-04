export interface VietQRParams {
  bankId?: string;       // Ví dụ: MB, VCB, ICB, ACB, TCB
  accountNo?: string;    // Số tài khoản ngân hàng nhà trường
  accountName?: string;  // Tên chủ tài khoản (Trường Mầm non NVSOFT)
  amount: number;        // Số tiền học phí
  memo: string;          // Nội dung chuyển khoản (VD: HOC PHI T8 KHANG)
}

export function generateVietQRUrl({
  bankId = "MB",
  accountNo = "090123456789",
  accountName = "TRUONG MAM NON NVSOFT",
  amount,
  memo
}: VietQRParams): string {
  const cleanMemo = encodeURIComponent(memo.replace(/[^a-zA-Z0-9 ]/g, ""));
  const cleanAccountName = encodeURIComponent(accountName);
  
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${cleanMemo}&accountName=${cleanAccountName}`;
}
