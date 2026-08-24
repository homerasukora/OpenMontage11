import {createContext, useContext} from 'react';

export type Lang = 'en' | 'ru';

export const LangContext = createContext<Lang>('en');

/**
 * On-screen copy, split on a deliberate line:
 *
 *   Localised — anything in the display face that is the narrator speaking.
 *   Kept in English — anything quoting the artefact itself: agency names,
 *   document titles, stamps, dates, source attributions. A Russian-language
 *   stamp on an American file would read as a fake, not a translation.
 */
export const COPY = {
  en: {
    hookTag: '11 MAR 2020 — PANDEMIC DECLARED',
    hookUnit: 'days',
    hookAfter: 'later',
    hookSuspect: 'SUSPECT:',

    targetLead: 'One lab.',
    targetResearcher: 'RESEARCHER:',

    factsTag: 'WHAT THE ASSESSMENT LISTED',
    facts: [
      'Bat coronavirus bank',
      'Infectious clone capability',
      'Chimeric spike genes',
    ],

    verdict: 'Manipulated',
    verdictSub: 'CONCLUSION OF THREE STAFF SCIENTISTS',

    seatTag: 'AUG 2021 · THE BRIEFING',
    seatLine: ['One conclusion', 'never arrives.'],
    seatSource: 'REPORTED · THE WALL STREET JOURNAL',

    honestTag: 'CONFIDENCE RATING ON EVERY LAB ASSESSMENT',
    honestHead: ['Low', 'confidence'],
    honestSub: ['Most scientists', 'still say: nature.'],

    drawerHead: '6 years',
    drawerTag: 'IN A DRAWER',
    drawerSource: 'FOIA LITIGATION · COURT-ORDERED PRODUCTION',

    questionA: ['The question was never', 'what happened.'],
    questionB: ["It's who", 'already '],
    questionKey: 'knew.',

    brandLine: 'Not just a date.',
    brandCta: 'FOLLOW THE SIGNAL',
  },

  ru: {
    hookTag: '11 МАР 2020 — ОБЪЯВЛЕНА ПАНДЕМИЯ',
    hookUnit: 'дней',
    hookAfter: 'спустя',
    hookSuspect: 'ПОДОЗРЕВАЕМЫЙ:',

    targetLead: 'Одна лаборатория.',
    targetResearcher: 'ИССЛЕДОВАТЕЛЬ:',

    factsTag: 'ЧТО БЫЛО В ОЦЕНКЕ',
    facts: [
      'Банк коронавирусов',
      'Инфекционные клоны',
      'Химерные гены спайка',
    ],

    verdict: 'Изменён',
    verdictSub: 'ВЫВОД ТРЁХ ШТАТНЫХ УЧЁНЫХ',

    seatTag: 'АВГ 2021 · ДОКЛАД',
    seatLine: ['Один вывод', 'не доходит.'],
    seatSource: 'ПО ДАННЫМ · THE WALL STREET JOURNAL',

    honestTag: 'ПОМЕТКА НА КАЖДОЙ ЛАБОРАТОРНОЙ ОЦЕНКЕ',
    honestHead: ['Низкая', 'уверенность'],
    honestSub: ['Большинство учёных', 'говорит: природа.'],

    drawerHead: '6 лет',
    drawerTag: 'В ЯЩИКЕ СТОЛА',
    drawerSource: 'СУД ПО FOIA · ВЫДАЧА ПО РЕШЕНИЮ СУДА',

    questionA: ['Вопрос был не в том,', 'что случилось.'],
    questionB: ['Вопрос —', 'кто уже '],
    questionKey: 'знал.',

    brandLine: 'Не просто дата.',
    brandCta: 'СЛЕДУЙ ЗА СИГНАЛОМ',
  },
} as const;

export const useCopy = () => COPY[useContext(LangContext)];
export const useLang = () => useContext(LangContext);

/** Cyrillic sets wider at the same point size; trim display type a little. */
export const useDisplayScale = () => (useContext(LangContext) === 'ru' ? 0.88 : 1);

/**
 * Oswald carries more space below the baseline than Barlow Condensed, so the
 * hook's unit line needs to drop instead of tucking under the numeral.
 */
export const useHookGap = () => (useContext(LangContext) === 'ru' ? 20 : -6);
