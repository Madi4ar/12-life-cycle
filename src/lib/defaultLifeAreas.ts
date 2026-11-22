import type { LifeArea } from "./types";
import { uid } from "./id";

export const DEFAULT_LIFE_AREA_TITLES: { key: string; title: string }[] = [
  { key: "work", title: "Работа / бизнес" },
  { key: "finance", title: "Финансы" },
  { key: "health", title: "Здоровье" },
  { key: "family", title: "Семья" },
  { key: "education", title: "Образование" },
  { key: "projects", title: "Личные проекты" },
  { key: "social", title: "Социальная жизнь" },
  { key: "rest", title: "Отдых" },
  { key: "home", title: "Дом" },
];

export function buildDefaultLifeAreas(): LifeArea[] {
  return DEFAULT_LIFE_AREA_TITLES.map((item, index) => ({
    id: uid(),
    key: item.key,
    title: item.title,
    hidden: false,
    order: index,
    vision: "",
  }));
}
