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

  return {
    dayNamesShort: computed(() => msgs.value.days.short),
    dayNamesMini: computed(() => msgs.value.days.mini),
    dayNamesFull: computed(() => msgs.value.days.full),
    monthNamesLong: computed(() => msgs.value.months.long),
    monthNamesShort: computed(() => msgs.value.months.short),
  };
}
