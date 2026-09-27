import { Plant, PlantCategory, SunlightType, WaterLevel } from '../types/plant';

export interface MonthInfo {
  index: number; // 1 - 12
  name: string;
  shortName: string;
  indianSeason: string;
  seasonSummary: string;
  generalTips: string[];
}

export const MONTHS: MonthInfo[] = [
  {
    index: 1,
    name: 'January',
    shortName: 'Jan',
    indianSeason: 'Shishir (Deep Winter)',
    seasonSummary: 'Coolest month across North/Central India. Peak flowering for winter annuals; tropicals enter rest.',
    generalTips: [
      'Reduce watering frequency significantly; water only mid-morning when sun is out.',
      'Protect delicate tropical plants (Adenium, Mogra) from cold foggy nights and frost.',
      'Enjoy peak blooms of Marigolds, Petunias, Dahlias, and winter Desi Roses.',
    ],
  },
  {
    index: 2,
    name: 'February',
    shortName: 'Feb',
    indianSeason: 'Vasant (Spring Begins)',
    seasonSummary: 'The golden month for Indian gardeners! Temperatures warm up; plants awaken with vigorous growth.',
    generalTips: [
      'Annual hard pruning time for Mogra, Hibiscus, Adenium, and Lemongrass.',
      'Repotting window opens for root-bound terrace containers.',
      'Sow seeds for summer crops: Chilies, Brinjal, Okra (Bhindi), Bitter Gourd, and Mint cuttings.',
      'Apply generous top-dress of vermicompost and cow manure to all awakened plants.',
    ],
  },
  {
    index: 3,
    name: 'March',
    shortName: 'Mar',
    indianSeason: 'Vasant (Peak Spring)',
    seasonSummary: 'Warm sunny days and rapid foliage emergence. Transition from winter to summer garden.',
    generalTips: [
      'Increase watering as daytime temperatures cross 30°C.',
      'Harvest mature winter vegetables (Palak, Coriander, Radish, Tomatoes).',
      'Set up trellises for vigorous summer gourds (Karela, Lauki, Turai).',
      'Watch for aphids and mealybugs as tender fresh spring shoots emerge.',
    ],
  },
  {
    index: 4,
    name: 'April',
    shortName: 'Apr',
    indianSeason: 'Grishma (Early Summer)',
    seasonSummary: 'High terrace radiation and dry hot winds. Shade and root moisture become critical.',
    generalTips: [
      'Mulch all pot topsoils with dry leaves, cocopeat, or sugarcane bagasse to retain moisture.',
      'Group pots together in clusters on the terrace to create a humid microclimate.',
      'Water thoroughly in the early morning before 8 AM or after sunset.',
    ],
  },
  {
    index: 5,
    name: 'May',
    shortName: 'May',
    indianSeason: 'Grishma (Peak Summer)',
    seasonSummary: 'Hottest month; terrace slabs reach 50°C. Protect roots from boiling.',
    generalTips: [
      'Install 50% green agro-shade net over delicate herbs, Foliage, and seedlings.',
      'Elevate pots on stands or bricks to avoid direct slab heat conduction.',
      'Avoid any chemical fertilizers or heavy pruning during extreme heat waves.',
      'Mogra and Adenium reward you with magnificent fragrant blooms in this peak heat!',
    ],
  },
  {
    index: 6,
    name: 'June',
    shortName: 'Jun',
    indianSeason: 'Varsha (Monsoon Arrival)',
    seasonSummary: 'Pre-monsoon showers and arrival of South-West monsoon. Perfect time for sowing.',
    generalTips: [
      'Clean all drainage holes in pots to prevent water accumulation when torrential rains start.',
      'Begin sowing seeds for the grand monsoon vegetable and flower garden.',
      'Take stem cuttings of Hibiscus, Bougainvillea, Curry Leaf, and Money Plant.',
    ],
  },
  {
    index: 7,
    name: 'July',
    shortName: 'Jul',
    indianSeason: 'Varsha (Peak Monsoon)',
    seasonSummary: 'High humidity, heavy rain, and explosion of lush green growth.',
    generalTips: [
      'Move succulents, Cacti, and Adeniums under shelter to prevent root rot from non-stop rain.',
      'Prime time for air layering, grafting, and repotting overgrown terrace plants.',
      'Dust wood ash or spray sour buttermilk to suppress fungal damping off in humid air.',
    ],
  },
  {
    index: 8,
    name: 'August',
    shortName: 'Aug',
    indianSeason: 'Varsha (Late Monsoon)',
    seasonSummary: 'Abundant soil moisture and warm humid air. Start planning for winter vegetables.',
    generalTips: [
      'Sow early seeds of Winter Marigold, Tomato, and Indian Spinach (Palak).',
      'Prune dead/damaged monsoon stems and weed vigorously.',
      'Check under broad leaves for hidden caterpillars and snail/slug damage.',
    ],
  },
  {
    index: 9,
    name: 'September',
    shortName: 'Sep',
    indianSeason: 'Sharad (Autumn / Post-Monsoon)',
    seasonSummary: 'Clear skies, humid warmth, and post-monsoon revitalization. Major planting season for winter!',
    generalTips: [
      'Prepare nursery beds and seed trays for winter vegetables (Tomato, Palak, Coriander, Peas).',
      'Prepare Desi Roses for upcoming October pruning by slightly restricting water late in the month.',
      'Feed heavy bloomers (Hibiscus, Aparajita, Marigolds) with fermented mustard cake tea.',
      'Loosen topsoil (Godi) after rain compaction to aerate suffocated root zones.',
    ],
  },
  {
    index: 10,
    name: 'October',
    shortName: 'Oct',
    indianSeason: 'Sharad (Mid Autumn)',
    seasonSummary: 'Mornings turn crisp. The most crucial month for Rose growers and winter gardens.',
    generalTips: [
      'Perform the famous Indian Rose pruning (hard prune back, seal cuts with turmeric).',
      'Transplant winter flower and vegetable seedlings into their final fruiting pots.',
      'Foliage plants slow down; reduce watering slightly as days shorten.',
    ],
  },
  {
    index: 11,
    name: 'November',
    shortName: 'Nov',
    indianSeason: 'Hemant (Pre-Winter)',
    seasonSummary: 'Pleasant daytime sun and cool nights. Winter crops enter rapid vegetative growth.',
    generalTips: [
      'Provide maximum direct sun to all winter vegetables and flowering annuals.',
      'Sow successive batches of Coriander, Mint, Methi (Fenugreek), and Palak.',
      'Apply bone meal and potash to Roses and Marigolds as flower buds start swelling.',
    ],
  },
  {
    index: 12,
    name: 'December',
    shortName: 'Dec',
    indianSeason: 'Hemant (Early Winter)',
    seasonSummary: 'Chilly nights and mild days. Terrace garden bursts with vibrant festive colors.',
    generalTips: [
      'Water plants only when top 1-2 inches of soil are dry, preferably around 10 AM.',
      'Keep Adenium completely dry to respect its natural winter resting dormancy.',
      'Deadhead spent Marigold and Chrysanthemum flowers to prolong the blooming season.',
    ],
  },
];

export const CATEGORIES: { id: PlantCategory; label: string; countHint?: string }[] = [
  { id: 'Flowering', label: 'Flowering' },
  { id: 'Vegetable', label: 'Vegetables' },
  { id: 'Herb', label: 'Herbs & Kitchen' },
  { id: 'Foliage', label: 'Foliage & Climbers' },
  { id: 'Fruit', label: 'Fruits' },
  { id: 'Succulent', label: 'Succulents & Hardy' },
];

export const SUNLIGHT_OPTIONS: { id: SunlightType; label: string; desc: string }[] = [
  { id: 'Full Sun', label: 'Full Sun', desc: '6+ hours direct terrace sunlight' },
  { id: 'Partial Shade', label: 'Partial Shade', desc: '3–5 hours morning light or filtered canopy' },
  { id: 'Full Shade', label: 'Full Shade', desc: 'Bright indirect light without harsh direct sun' },
];

export const WATER_OPTIONS: { id: WaterLevel; label: string; desc: string }[] = [
  { id: 'Low', label: 'Low', desc: 'Drought-tolerant, water only when soil is bone dry' },
  { id: 'Moderate', label: 'Moderate', desc: 'Water when top 1 inch dries out' },
  { id: 'High', label: 'High', desc: 'Daily moisture needed, never let root zone dry' },
];

export function isPlantSowingMonth(plant: Plant, monthIndex: number): boolean {
  return plant.sowingTime.months.includes(monthIndex);
}

export function isPlantPruningMonth(plant: Plant, monthIndex: number): boolean {
  return plant.pruningTime.months.includes(monthIndex);
}

export function isPlantRepottingMonth(plant: Plant, monthIndex: number): boolean {
  return plant.repottingTime.months.includes(monthIndex);
}

export function isPlantBloomingMonth(plant: Plant, monthIndex: number): boolean {
  return plant.floweringSeason.isFlowering && plant.floweringSeason.months.includes(monthIndex);
}

export function getPlantCategoryAccent(category: PlantCategory): {
  color: string;
  bgLight: string;
  borderLight: string;
  pillBadge: string;
} {
  switch (category) {
    case 'Flowering':
      return {
        color: 'text-rose-800',
        bgLight: 'bg-rose-50/80',
        borderLight: 'border-rose-200/60',
        pillBadge: 'bg-rose-100 text-rose-800 border-rose-200',
      };
    case 'Vegetable':
      return {
        color: 'text-amber-800',
        bgLight: 'bg-amber-50/80',
        borderLight: 'border-amber-200/60',
        pillBadge: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    case 'Herb':
      return {
        color: 'text-emerald-800',
        bgLight: 'bg-emerald-50/80',
        borderLight: 'border-emerald-200/60',
        pillBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      };
    case 'Foliage':
      return {
        color: 'text-teal-800',
        bgLight: 'bg-teal-50/80',
        borderLight: 'border-teal-200/60',
        pillBadge: 'bg-teal-100 text-teal-800 border-teal-200',
      };
    case 'Succulent':
      return {
        color: 'text-stone-800',
        bgLight: 'bg-stone-100',
        borderLight: 'border-stone-200',
        pillBadge: 'bg-stone-100 text-stone-800 border-stone-300',
      };
    case 'Fruit':
      return {
        color: 'text-orange-800',
        bgLight: 'bg-orange-50/80',
        borderLight: 'border-orange-200/60',
        pillBadge: 'bg-orange-100 text-orange-800 border-orange-200',
      };
    default:
      return {
        color: 'text-emerald-800',
        bgLight: 'bg-emerald-50',
        borderLight: 'border-emerald-200',
        pillBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      };
  }
}
