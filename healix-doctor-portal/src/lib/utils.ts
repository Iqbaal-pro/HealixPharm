export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

export function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString()}`;
}

export function generateAppointmentId(): string {
  return `SP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}