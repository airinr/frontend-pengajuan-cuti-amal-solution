import { computed } from "vue";
import { useI18n } from "vue-i18n";
import idMessages from "../i18n/id.json";
import enMessages from "../i18n/en.json";

const localeMessages: Record<string, typeof idMessages> = {
  id: idMessages,
  en: enMessages,
};
const fallback = localeMessages.id;

export function useCalendarNames() {
  const { locale } = useI18n();
  const msgs = computed(() => localeMessages[locale.value] || fallback);

  const dayNamesShort = computed(() => msgs.value.days.short);
  const dayNamesMini = computed(() => msgs.value.days.mini);
  const dayNamesFull = computed(() => msgs.value.days.full);
  const monthNamesLong = computed(() => msgs.value.months.long);
  const monthNamesShort = computed(() => msgs.value.months.short);

  const getDayIndex = (date: Date) => (date.getDay() + 6) % 7;

  const getDayShort = (date: Date) => dayNamesShort.value[getDayIndex(date)];
  const getDayMini = (date: Date) => dayNamesMini.value[getDayIndex(date)];
  const getDayFull = (date: Date) => dayNamesFull.value[getDayIndex(date)];

  return {
    dayNamesShort,
    dayNamesMini,
    dayNamesFull,
    monthNamesLong,
    monthNamesShort,
    getDayShort,
    getDayMini,
    getDayFull,
  };
}
