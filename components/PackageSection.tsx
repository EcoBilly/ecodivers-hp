const stats = [
  { num: "3,000+", label: "함께한 손님" },
  { num: "4.9", label: "평균 별점" },
  { num: "10년+", label: "제주 운영" },
  { num: "PADI·AIDA", label: "공인 센터" },
];

export default function PackageSection() {
  return (
    <div className="bg-[#0b1b2b]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10 border-x border-white/10">
        {stats.map((s, i) => (
          <div key={i} className="px-4 py-8 md:py-10 text-center">
            <div
              className="text-2xl md:text-4xl font-black text-white"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {s.num}
            </div>
            <div className="text-gray-400 text-xs md:text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
