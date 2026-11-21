"use client";

import Link from "next/link";

interface DashboardCardProps {
  href: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  iconHoverBgColor: string;
  title: string;
  description: string;
  hoverBorderColor?: string;
}

export default function DashboardCard({
  href,
  icon,
  iconBgColor,
  iconColor,
  iconHoverBgColor,
  title,
  description,
  hoverBorderColor = "orange-300",
}: DashboardCardProps) {
  return (
    <Link
      href={href}
      className={`group p-6 bg-white rounded-xl border border-zinc-200 hover:border-${hoverBorderColor} hover:shadow-lg transition-all ${
        hoverBorderColor === "orange-300" ? "" : "hover:border-purple-300"
      }`}
    >
      <div className={`w-12 h-12 rounded-lg ${iconBgColor} group-hover:${iconHoverBgColor} transition-colors flex items-center justify-center mb-4`}>
        <span className={`w-6 h-6 ${iconColor} group-hover:text-white transition-colors`}>
          {icon}
        </span>
      </div>
      <h3 className="text-xl font-semibold text-zinc-900 mb-2">{title}</h3>
      <p className="text-zinc-600">{description}</p>
    </Link>
  );
}