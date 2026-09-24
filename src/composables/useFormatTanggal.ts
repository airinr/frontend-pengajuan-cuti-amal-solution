import { useCalendarNames } from "./useCalendarNames";

export function useFormatTanggal() {
  const { monthNamesShort } = useCalendarNames();

  const formatTanggal = (tanggal: string[] | undefined | null): string => {
    if (!tanggal || tanggal.length === 0) return "-";

    const sorted = [...tanggal].sort();

    if (sorted.length === 1) {
      const d = new Date(sorted[0]);
      return `${d.getDate()} ${monthNamesShort.value[d.getMonth()]} ${d.getFullYear()}`;
    }

    const grouped: Record<string, number[]> = {};
    sorted.forEach((dateStr) => {
      const d = new Date(dateStr);
      const key = `${d.getMonth()}-${d.getFullYear()}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(d.getDate());
    });

    const parts = Object.entries(grouped).map(([key, days]) => {
      const [month] = key.split("-").map(Number);
      return `${days.join(", ")} ${monthNamesShort.value[month]}`;
    });

    const lastYear = new Date(sorted[sorted.length - 1]).getFullYear();
    return `${parts.join(", ")} ${lastYear}`;
  };

  return { formatTanggal };
}
