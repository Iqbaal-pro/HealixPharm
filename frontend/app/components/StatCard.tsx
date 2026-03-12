interface StatCardProps {
  title: string;
  value: string;
  color: string;
}

export default function StatCard({
  title,
  value,
  color,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className={`w-12 h-12 rounded-lg ${color} mb-4`} />
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-2xl font-bold text-[#0c2242] mt-2">
        {value}
      </p>
    </div>
  );
}