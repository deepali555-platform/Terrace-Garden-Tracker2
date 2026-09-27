import { Plant, SymptomDefinition } from '../types/plant';
import { VERIFIED_PLANT_IMAGES } from './plantImages';

export const COMMON_SYMPTOMS: SymptomDefinition[] = [
  {
    type: 'pests_visible',
    label: 'Visible Insects / Cottony Clusters',
    description: 'White fluffy clusters, tiny green/black bugs on tender stems, or fine spider webs under leaves.',
  },
  {
    type: 'yellowing',
    label: 'Yellowing Leaves (Chlorosis)',
    description: 'Leaves turning pale green to bright yellow, either between veins or dropping from the bottom.',
  },
  {
    type: 'curling',
    label: 'Curled or Puckered Leaves',
    description: 'Leaf margins curling inward or upward, brittle growth, twisted tender shoots.',
  },
  {
    type: 'powdery_coating',
    label: 'White Powdery / Ash-like Coating',
    description: 'White talcum-like powder on upper leaf surfaces or stems, causing leaves to dry out.',
  },
  {
    type: 'spots',
    label: 'Black / Brown Spots or Blight',
    description: 'Concentric dark rings, brown water-soaked lesions, or circular spots with yellow halos.',
  },
  {
    type: 'holes',
    label: 'Holes or Winding Silver Trails',
    description: 'Irregular chewed holes, skeletonized leaves, or serpentine white/silver tracks.',
  },
  {
    type: 'wilting',
    label: 'Wilting / Drooping Stems',
    description: 'Plant droops even when soil feels moist, or stems turn mushy and black near the soil line.',
  },
  {
    type: 'bud_drop',
    label: 'Flower Buds Dropping or Drying',
    description: 'Buds turn yellow, blacken, or fall off before opening fully.',
  },
];

const RAW_INITIAL_PLANTS: Plant[] = [
  {
    id: 'tulsi',
    name: 'Tulsi (Holy Basil)',
    botanicalName: 'Ocimum tenuiflorum',
    hindiName: 'कृष्ण तुलसी / रामा तुलसी',
    category: 'Herb',
    waterRequirement: {
      level: 'Moderate',
      frequency: 'Once daily in summer; alternate days in winter',
      seasonalNote: 'Water only at base when top 1 inch is dry. Do not waterlog; sensitive to root rot during monsoon.',
    },
    sunlightRequirement: {
      type: 'Full Sun',
      hoursNeeded: '4 to 6 hours direct sunlight daily',
      summerTerraceNote: 'Shield from extreme 43°C+ afternoon heat under green shade net or behind taller pots.',
    },
    fertilizerRequirement: {
      type: 'Well-rotted Cow Dung (Gobar Khad) or Vermicompost',
      npkOrOrganic: 'Organic nitrogen-rich feed; 1 tbsp steamed bone meal or mustard cake tea twice a year',
      frequency: 'Every 3 to 4 weeks (handful gently hoed into topsoil)',
    },
    sowingTime: {
      months: [2, 3, 6, 7], // Feb, Mar, Jun, Jul
      seasonText: 'Spring (Feb–March) or onset of Monsoon (June–July)',
      method: 'Seeds (Manjari) or softwood stem cuttings in moist sand',
    },
    pruningTime: {
      months: [2, 3, 8, 9],
      seasonText: 'Regular pinchings; light pruning in Spring (Feb) and Post-Monsoon (Sept)',
      frequency: 'Pinch flower spikes (Manjari) weekly to prevent woody senescence',
      tips: 'Always nip off flower spikes as soon as they form to keep the plant lush, bushy, and vegetative.',
    },
    repottingTime: {
      months: [2, 3, 7],
      seasonText: 'Spring (Feb–March) or Monsoon (July)',
      frequency: 'Once every 1.5 to 2 years',
      signs: [
        'Roots circling tightly at pot bottom or drainage hole',
        'Plant sheds lower leaves rapidly despite watering',
        'Stems turn excessively woody and thin',
      ],
    },
    potSizeRequired: {
      sizeInches: '10 to 12 inches',
      volumeLiters: '10–12 Liters',
      materialAdvice: 'Earthen terracotta pot with 2–3 drainage holes to prevent soggy root asphyxiation.',
    },
    floweringSeason: {
      isFlowering: true,
      months: [8, 9, 10, 11, 12],
      seasonText: 'Late Monsoon to Winter (Aug–Dec); produces tiny purple/white aromatic florets',
    },
    diseasesAndPests: [
      {
        id: 'tulsi-aphids',
        name: 'Black Aphids & Spider Mites',
        symptomType: 'pests_visible',
        symptoms: 'Clusters of tiny black insects along tender tips and flower buds; fine web filaments.',
        homeRemedy: {
          name: 'Neem Oil & Mild Soap Emulsion',
          ingredients: '5 ml pure cold-pressed neem oil + 3 drops gentle liquid dish soap in 1L lukewarm water',
          preparationAndUse: 'Vigorously shake until a milky emulsion forms. Spray on both upper and underside of leaves early morning or after sunset every 3 days.',
          frequency: 'Every 3 days for 2 weeks',
        },
        conventionalTreatment: 'Commercial Neem EC 1500 ppm spray or sticky yellow sticky trap sheets.',
      },
      {
        id: 'tulsi-fungal',
        name: 'Leaf Spot & Root Rot (Damping Off)',
        symptomType: 'spots',
        symptoms: 'Brown-black circular lesions with yellow halos on lower leaves; mushy dark stem base.',
        homeRemedy: {
          name: 'Sour Buttermilk (Khatta Chhaas) & Turmeric Solution',
          ingredients: '100 ml 3-day old sour curd/buttermilk + 1 tsp kitchen turmeric powder in 1L water',
          preparationAndUse: 'Strain through cloth and mist foliage; dust dry wood ash or cinnamon powder around the topsoil collar.',
          frequency: 'Once a week after clipping infected leaves',
        },
        conventionalTreatment: 'Saaf fungicide (Carbendazim 12% + Mancozeb 63% WP) at 1.5g per litre.',
      },
      {
        id: 'tulsi-yellow',
        name: 'Overwatering & Nutrient Leaching',
        symptomType: 'yellowing',
        symptoms: 'Uniform yellowing and droop of leaves without brown spots; soil stays soggy for days.',
        homeRemedy: {
          name: 'Godi (Hoeing) & Dry Wood Ash Aeration',
          ingredients: 'Loose aeration with khurpi (gardening trowel) + 1 tbsp dry wood ash',
          preparationAndUse: 'Stop watering for 3 days. Gently loosen the top 2 inches of soil without damaging taproot. Dust wood ash to absorb fungal moisture.',
          frequency: 'Immediate corrective action',
        },
        conventionalTreatment: 'Repot into fresh 50:30:20 garden soil, vermicompost, and coarse river sand.',
      },
    ],
    notes: 'In Indian terrace conditions, keeping Tulsi elevated on a stand protects it from hot concrete slab radiation.',
  },
  {
    id: 'hibiscus',
    name: 'Hibiscus (Gudhal)',
    botanicalName: 'Hibiscus rosa-sinensis',
    hindiName: 'गुड़हल / जवाकुसुम',
    category: 'Flowering',
    waterRequirement: {
      level: 'High',
      frequency: 'Daily in summer; alternate days in mild weather',
      seasonalNote: 'Hibiscus is a thirsty plant during flowering flushes. Never let soil go bone dry, but ensure excess drains instantly.',
    },
    sunlightRequirement: {
      type: 'Full Sun',
      hoursNeeded: '6 to 8 hours direct sunlight',
      summerTerraceNote: 'Needs full terrace sunlight to trigger heavy bloom bud formation.',
    },
    fertilizerRequirement: {
      type: 'Potash-rich organic feed (Banana peel liquid) & Mustard Cake',
      npkOrOrganic: 'High Potassium (K), moderate Nitrogen. 1 tsp Epsom salt (Magnesium sulfate) once a month.',
      frequency: 'Every 15 to 20 days during active blooming',
    },
    sowingTime: {
      months: [6, 7, 8],
      seasonText: 'Monsoon season (June–August) via semi-hardwood stem cuttings',
      method: 'Cuttings (6-8 inches) dipped in aloe vera gel / honey as rooting agent',
    },
    pruningTime: {
      months: [2, 3, 10],
      seasonText: 'Hard pruning in Spring (Feb–Mar); light tip shaping in October',
      frequency: 'Hard prune once a year; pinch spent blooms regularly',
      tips: 'Cut back woody branches by one-third at a 45-degree angle just above an outward-facing node to trigger bushy new flowering branches.',
    },
    repottingTime: {
      months: [2, 3, 7],
      seasonText: 'Late Spring (Feb–March) or Monsoon (July)',
      frequency: 'Once every 2 years',
      signs: [
        'Water pools on surface and runs down the inner pot rim instantly',
        'Flower buds drop before opening',
        'Root ball forms dense matted carpet',
      ],
    },
    potSizeRequired: {
      sizeInches: '12 to 16 inches',
      volumeLiters: '18–25 Liters',
      materialAdvice: 'Large terracotta, clay or fabric grow bag to keep root zone cool in 40°C terrace heat.',
    },
    floweringSeason: {
      isFlowering: true,
      months: [3, 4, 5, 6, 7, 8, 9, 10, 11],
      seasonText: 'March through November; heaviest flushes during Monsoon & Autumn',
    },
    diseasesAndPests: [
      {
        id: 'hibiscus-mealybug',
        name: 'Mealybugs (Safed Keeda)',
        symptomType: 'pests_visible',
        symptoms: 'Thick white cottony wax-covered insects clustered at leaf axils, flower buds, and tips.',
        homeRemedy: {
          name: 'Rubbing Alcohol Swab & Neem-Soap Spray',
          ingredients: 'Dipping cotton ear-bud in surgical spirit/rubbing alcohol + 5ml neem oil + 2ml liquid soap in 1L water',
          preparationAndUse: 'Dab alcohol directly onto cottony clusters to dissolve waxy shield, then spray thoroughly under high water pressure.',
          frequency: 'Inspect and treat every 4 days until completely eliminated',
        },
        conventionalTreatment: 'Imidacloprid 17.8 SL (0.5ml per liter water) or Profenofos spray for severe infestations.',
      },
      {
        id: 'hibiscus-buddropping',
        name: 'Bud Drop (Cal-Mag Deficiency or Thrips)',
        symptomType: 'bud_drop',
        symptoms: 'Flower buds turn pale yellow or brown at the pedicel joint and drop off before blooming.',
        homeRemedy: {
          name: 'Epsom Salt & Soaked Boiled Eggshell Powder',
          ingredients: '1 tsp Epsom salt (Magnesium sulfate) + 1 tbsp powdered eggshells/slaked lime (Chuna pinch) in 1L water',
          preparationAndUse: 'Water the base directly; avoid wet-to-bone-dry moisture swings.',
          frequency: 'Once every 15 days',
        },
        conventionalTreatment: 'Micronutrient foliar spray (Multiplex or Utkarsh Microbe) containing Boron, Zinc, and Magnesium.',
      },
      {
        id: 'hibiscus-yellow',
        name: 'Leaf Yellowing & Iron Chlorosis',
        symptomType: 'yellowing',
        symptoms: 'Upper new leaves turn yellow with dark green veins standing out sharply.',
        homeRemedy: {
          name: 'Iron Water (Loha Pani) & Sour Buttermilk',
          ingredients: 'Water soaked with rusted iron nails for 3 days + 50ml sour buttermilk',
          preparationAndUse: 'Drench soil root zone to lower alkalinity and release locked terrace soil iron.',
          frequency: 'Once a month',
        },
        conventionalTreatment: 'Chelated Iron (Fe-EDTA 12%) at 1g per liter water.',
      },
    ],
    notes: 'Hibiscus loves acidic to neutral soil (pH 6.0–6.8). Adding fermented banana peel tea boosts bud count.',
  },
  {
    id: 'curry-leaf',
    name: 'Curry Leaf (Kadi Patta)',
    botanicalName: 'Murraya koenigii',
    hindiName: 'कढ़ी पत्ता / मीठा नीम',
    category: 'Herb',
    waterRequirement: {
      level: 'Moderate',
      frequency: 'Every 2 to 3 days',
      seasonalNote: 'Sensitive to overwatering. Allow the top 1.5 inches of soil to dry before the next watering.',
    },
    sunlightRequirement: {
      type: 'Full Sun',
      hoursNeeded: '5 to 7 hours direct sunlight',
      summerTerraceNote: 'Loves heat and humidity; slow growth during chilly North Indian winters (dormancy).',
    },
    fertilizerRequirement: {
      type: 'Sour Buttermilk (Khatta Chhaas) & Decomposed Cow Manure',
      npkOrOrganic: 'High Nitrogen organic feed; 1 tsp Epsom salt every month for deep green aromatic leaves',
      frequency: 'Every 20 to 30 days during active spring-monsoon growth',
    },
    sowingTime: {
      months: [6, 7, 8],
      seasonText: 'Monsoon season (July–August) from fresh black seeds or root suckers',
      method: 'Fresh ripe dark-purple berries or root suckers division',
    },
    pruningTime: {
      months: [2, 3, 9],
      seasonText: 'Spring rejuvenation (Late Feb–March) and light shaping in September',
      frequency: 'Prune top shoots to force branching into multiple lush stalks',
      tips: 'Cut the main stem at 1.5 feet height if it is a single lanky stick. Multiple bushy branches will sprout within 2 weeks.',
    },
    repottingTime: {
      months: [3, 7],
      seasonText: 'March or July (avoid cold winter months Nov–Jan)',
      frequency: 'Once every 2 years',
      signs: [
        'Leaves turn pale, small, and lose strong aroma',
        'Soil dries up within half a day in summer',
        'Stems stop producing fresh leaflets',
      ],
    },
    potSizeRequired: {
      sizeInches: '12 to 14 inches',
      volumeLiters: '15–20 Liters',
      materialAdvice: 'Clay or deep ceramic pot with high drainage so tap roots do not rot.',
    },
    floweringSeason: {
      isFlowering: true,
      months: [4, 5],
      seasonText: 'Spring (April–May); white fragrant flowers followed by black berries. Nip flowers to redirect energy to leaves.',
    },
    diseasesAndPests: [
      {
        id: 'curry-psyllid',
        name: 'Asian Citrus Psyllid & Aphids',
        symptomType: 'curling',
        symptoms: 'Tender top shoots curl tightly, twist, turn black with sticky honey-dew sap.',
        homeRemedy: {
          name: 'Garlic-Chili & Neem Extract',
          ingredients: '5 crushed garlic cloves + 2 green chilies soaked in warm water overnight + 1 tsp neem oil',
          preparationAndUse: 'Strain through fine muslin cloth and spray vigorously on tender tip joints.',
          frequency: 'Every 4 days for 3 cycles',
        },
        conventionalTreatment: 'Acetamiprid 20% SP (0.5g/L) or systemic neem repellent.',
      },
      {
        id: 'curry-yellow',
        name: 'Nitrogen & Magnesium Deficiency',
        symptomType: 'yellowing',
        symptoms: 'Entire foliage looks pale yellowish-green; growth appears frozen.',
        homeRemedy: {
          name: 'Diluted Sour Buttermilk Soil Drench',
          ingredients: '1 glass sour curd churned with 10 glasses water + 1 tsp Epsom salt',
          preparationAndUse: 'Pour directly around root zone on an empty morning stomach for the plant.',
          frequency: 'Every 15 days',
        },
        conventionalTreatment: 'Foliar spray of 19-19-19 balanced water-soluble fertilizer at 2g/L.',
      },
    ],
    notes: 'Always harvest by pinching whole leaf stalks (petioles) rather than plucking individual leaflets.',
  },
  {
    id: 'money-plant',
    name: 'Money Plant (Golden Pothos)',
    botanicalName: 'Epipremnum aureum',
    hindiName: 'मनी प्लांट',
    category: 'Foliage',
    waterRequirement: {
      level: 'Low',
      frequency: 'Every 4 to 6 days; check soil dryness',
      seasonalNote: 'Thrives on slight neglect. Yellow translucent leaves indicate root rot from overwatering.',
    },
    sunlightRequirement: {
      type: 'Partial Shade',
      hoursNeeded: 'Bright indirect terrace light or filtered morning sun (1–2 hrs max)',
      summerTerraceNote: 'Direct midday terrace sun will scorch and bleach leaves with papery brown burns.',
    },
    fertilizerRequirement: {
      type: 'Liquid Seaweed Extract or Vermicompost Tea',
      npkOrOrganic: 'Mild foliage feed; used tea leaf compost (washed and sun-dried)',
      frequency: 'Once every 4 to 6 weeks in summer and monsoon; stop in winter',
    },
    sowingTime: {
      months: [3, 4, 6, 7, 8],
      seasonText: 'Spring to late Monsoon (March to August)',
      method: 'Single node stem cuttings in water or potting soil',
    },
    pruningTime: {
      months: [3, 4, 7, 8],
      seasonText: 'Anytime during active growth when vines get leggy',
      frequency: 'Trim tips to encourage bushy nodes',
      tips: 'Train climbing vines onto a coco-peat or moss pole to make leaves double in size.',
    },
    repottingTime: {
      months: [3, 7],
      seasonText: 'Spring or Monsoon',
      frequency: 'Every 2 years or when moss pole needs renewal',
      signs: [
        'Vines stop producing large leaves',
        'Roots poke out from top of soil and bottom holes',
        'Soil dries into a hard rock clump',
      ],
    },
    potSizeRequired: {
      sizeInches: '8 to 12 inches',
      volumeLiters: '5–10 Liters',
      materialAdvice: 'Hanging plastic baskets, ceramic planters, or self-watering pots.',
    },
    floweringSeason: {
      isFlowering: false,
      months: [],
      seasonText: 'Does not flower in home container conditions; prized entirely for lush heart-shaped foliage.',
    },
    diseasesAndPests: [
      {
        id: 'money-rootrot',
        name: 'Root Rot & Stem Blight',
        symptomType: 'yellowing',
        symptoms: 'Soft yellow leaves, brown mushy stem bases near soil line, unpleasant musty smell.',
        homeRemedy: {
          name: 'Cinnamon Powder & Fresh Soil Repotting',
          ingredients: 'Pure ground cinnamon powder (Dalchini) + dry fresh potting mix',
          preparationAndUse: 'Unpot, trim rotten black roots, dust healthy cut ends with cinnamon powder (natural antifungal), and repot in dry aerated mix.',
          frequency: 'Single emergency intervention',
        },
        conventionalTreatment: 'Drench root zone with 2g Trichoderma viride or Bavistin (Carbendazim 50%).',
      },
      {
        id: 'money-scales',
        name: 'Scale Insects & Mealybugs',
        symptomType: 'pests_visible',
        symptoms: 'Brown waxy bumps along leaf veins or white cottony bits at stem junctions.',
        homeRemedy: {
          name: 'Soap Water & Toothbrush Scrub',
          ingredients: 'Mild dish soap or liquid handwash solution (1 tsp in 500ml water)',
          preparationAndUse: 'Gently scrub affected nodes with a soft discarded toothbrush, then wipe with a wet cloth.',
          frequency: 'Repeat after 5 days if needed',
        },
        conventionalTreatment: 'Systemic insecticide spray like Confidor or Neem oil 3000 ppm.',
      },
    ],
    notes: 'Adding a moss stick keeps aerial roots hydrated, resulting in jumbo split leaves on terrace walls.',
  },
  {
    id: 'marigold',
    name: 'Marigold (Genda)',
    botanicalName: 'Tagetes erecta',
    hindiName: 'गेंदा',
    category: 'Flowering',
    waterRequirement: {
      level: 'Moderate',
      frequency: 'Every 1 to 2 days',
      seasonalNote: 'Water at the base; avoid wetting the flowers and dense foliage to prevent fungal blight.',
    },
    sunlightRequirement: {
      type: 'Full Sun',
      hoursNeeded: '6+ hours direct sunlight',
      summerTerraceNote: 'Loves sun; essential for abundant festive flower buds.',
    },
    fertilizerRequirement: {
      type: 'Vermicompost, Mustard Cake (Sarson Khali) Liquid, Bone meal',
      npkOrOrganic: 'NPK 5-10-10 or organic potash and phosphorus',
      frequency: 'Every 15 days during flowering season',
    },
    sowingTime: {
      months: [6, 7, 8, 9, 10], // Jun to Oct
      seasonText: 'Monsoon (June–July) for festive autumn blooms; Sept–Oct for grand winter blooms',
      method: 'Seeds (dried petals of puja flowers) or tip cuttings',
    },
    pruningTime: {
      months: [8, 9, 10, 11, 12, 1],
      seasonText: 'Active flowering season',
      frequency: 'Pinch apical growing tip once at 4 inches height to get 10+ flowering branches',
      tips: 'Deadhead (pinch off) spent faded blooms immediately to promote non-stop fresh buds.',
    },
    repottingTime: {
      months: [7, 8, 9, 10],
      seasonText: 'At seedling stage (transplant when 4–5 true leaves appear)',
      frequency: 'Annual plant — replanted each season',
      signs: [
        'Seedlings crowd nursery tray',
        'Roots poke through seedling cup bottom',
      ],
    },
    potSizeRequired: {
      sizeInches: '8 to 10 inches',
      volumeLiters: '6–8 Liters',
      materialAdvice: 'Standard plastic or clay pots; 1 plant per 8-inch pot or 3 in a 16-inch trough.',
    },
    floweringSeason: {
      isFlowering: true,
      months: [9, 10, 11, 12, 1, 2, 3],
      seasonText: 'Late September through March (peak during Diwali to Holi)',
    },
    diseasesAndPests: [
      {
        id: 'marigold-redmite',
        name: 'Red Spider Mites & Thrips',
        symptomType: 'curling',
        symptoms: 'Bronze dusty stippling on leaf surface; leaves curl upward and dry to a crisp.',
        homeRemedy: {
          name: 'Cold Water Jet & Sour Buttermilk Spray',
          ingredients: 'High-pressure cold water hose wash + 1:10 diluted sour buttermilk mist',
          preparationAndUse: 'Wash under-leaf webbing thoroughly in the morning, then coat with sour buttermilk to dehydrate mite colonies.',
          frequency: 'Twice a week',
        },
        conventionalTreatment: 'Dicofol or Spiromesifen (Oberon) at 1ml per liter.',
      },
      {
        id: 'marigold-powdery',
        name: 'Powdery Mildew & Damping Off',
        symptomType: 'powdery_coating',
        symptoms: 'White powdery patches spreading across lower leaves; leaves turn yellow and drop.',
        homeRemedy: {
          name: 'Baking Soda & Dish Soap Solution',
          ingredients: '1 tsp baking soda (meetha soda) + 3 drops liquid soap in 1L water',
          preparationAndUse: 'Spray completely across leaf surfaces in early morning. Increases leaf pH and arrests fungal mycelium.',
          frequency: 'Every 5 to 7 days',
        },
        conventionalTreatment: 'Saaf (Mancozeb + Carbendazim) or Wettable Sulfur (2g/L).',
      },
    ],
    notes: 'Marigolds release alpha-terthienyl from their roots, naturally repelling nematodes and harmful garden pests.',
  },
  {
    id: 'chili',
    name: 'Green Chili (Hari Mirch)',
    botanicalName: 'Capsicum annuum',
    hindiName: 'हरी मिर्च',
    category: 'Vegetable',
    waterRequirement: {
      level: 'Moderate',
      frequency: 'Every 2 days',
      seasonalNote: 'Water when top 1 inch is dry. During flowering, avoid excess water or all blossoms will drop without setting chilies!',
    },
    sunlightRequirement: {
      type: 'Full Sun',
      hoursNeeded: '6 to 8 hours direct sun',
      summerTerraceNote: 'Full terrace sun intensifies pungency (capsaicin) and boosts fruit count.',
    },
    fertilizerRequirement: {
      type: 'Vermicompost, Wood Ash (Rakhi), and Fermented Mustard Cake Tea',
      npkOrOrganic: 'High Potassium and Phosphorus; 1 pinch wood ash gives silica and potash for thick-skinned spicy chilies',
      frequency: 'Every 15 days once flowering begins',
    },
    sowingTime: {
      months: [1, 2, 6, 7], // Jan-Feb, Jun-Jul
      seasonText: 'Summer crop: Jan–Feb; Monsoon/Winter crop: June–July',
      method: 'Seeds from dried red kitchen chili pods sown in nursery tray',
    },
    pruningTime: {
      months: [3, 4, 8, 9],
      seasonText: 'When plant reaches 6–8 inches tall',
      frequency: 'Pinch top node (3G pruning technique)',
      tips: 'Perform 3G pruning: Pinch main stem tip at 8 inches to get secondary branches. Pinch secondaries to trigger 20+ tertiary fruiting branches!',
    },
    repottingTime: {
      months: [2, 3, 7, 8],
      seasonText: 'Transplant 30 days after seed germination',
      frequency: 'Once into final fruiting pot',
      signs: [
        'Seedling has 4–6 true leaves and thick pencil-stem',
      ],
    },
    potSizeRequired: {
      sizeInches: '10 to 12 inches',
      volumeLiters: '10–15 Liters',
      materialAdvice: 'Breathable terracotta or high-density UV grow bag.',
    },
    floweringSeason: {
      isFlowering: true,
      months: [3, 4, 5, 8, 9, 10, 11],
      seasonText: 'Produces white star blossoms 45-60 days from transplant, bearing hot chilies continuously',
    },
    diseasesAndPests: [
      {
        id: 'chili-leafcurl',
        name: 'Leaf Curl Virus (transmitted by Whiteflies & Thrips)',
        symptomType: 'curling',
        symptoms: 'Leaves curl upward (boat-like) or downward, thicken, become brittle and stunted with no fruit set.',
        homeRemedy: {
          name: 'Sour Buttermilk (Khatta Chhaas) & Asafoetida (Hing) Spray',
          ingredients: '150 ml aged sour buttermilk + 1 pinch Hing (asafoetida) + 1 tsp neem oil in 1L water',
          preparationAndUse: 'Ferment buttermilk for 4 days in a warm corner. Spray weekly to repel whitefly vectors and restore leaf turgor.',
          frequency: 'Every 5 days; isolate severely deformed plants',
        },
        conventionalTreatment: 'Yellow and blue sticky traps + spray Imidacloprid (0.3ml/L) or Dimethoate (Rogor) at first sign of thrips.',
      },
      {
        id: 'chili-flowerdrop',
        name: 'Blossom Drop (Heat Stress or Overwatering)',
        symptomType: 'bud_drop',
        symptoms: 'Tiny white flowers turn yellow at the joint and fall onto the terrace floor without chili formation.',
        homeRemedy: {
          name: 'Milk & Honey Foliar Spray',
          ingredients: '50ml raw cow milk + 1 tsp honey in 1L water',
          preparationAndUse: 'Mist blossoms lightly at 8 AM. Attracts terrace pollinators and supplies calcium to pedicel joints.',
          frequency: 'Once a week during heavy flowering',
        },
        conventionalTreatment: 'Planofix (Alpha Naphthyl Acetic Acid) at 1 drop per 4.5 liters of water.',
      },
    ],
    notes: 'Allowing the plant to dry slightly between waterings makes green chilies significantly spicier!',
  },
  {
    id: 'tomato',
    name: 'Tomato (Tamatar)',
    botanicalName: 'Solanum lycopersicum',
    hindiName: 'टमाटर',
    category: 'Vegetable',
    waterRequirement: {
      level: 'High',
      frequency: 'Daily in summer; every 2 days in winter',
      seasonalNote: 'Consistent moisture is critical. Uneven watering causes fruit splitting and blossom end rot.',
    },
    sunlightRequirement: {
      type: 'Full Sun',
      hoursNeeded: '6 to 8 hours direct sunlight',
      summerTerraceNote: 'Requires full sunlight for sugar synthesis and deep red pigmentation.',
    },
    fertilizerRequirement: {
      type: 'Vermicompost, Steamed Bonemeal, Wood Ash, and Fermented Seaweed',
      npkOrOrganic: 'High Calcium and Potassium. 1 tsp crushed eggshell or slaked lime (chuna water) prevents blossom end rot.',
      frequency: 'Every 15 days throughout flowering and fruiting',
    },
    sowingTime: {
      months: [6, 7, 8, 9, 10, 11], // Aug-Nov peak in plains
      seasonText: 'Autumn/Winter crop (August–November); also late winter (Feb) for early summer',
      method: 'Seeds from ripe kitchen tomatoes sown 0.5 cm deep in seed starter tray',
    },
    pruningTime: {
      months: [9, 10, 11, 12, 1, 2],
      seasonText: 'Throughout vegetative growth',
      frequency: 'Weekly removal of "suckers" (side shoots growing in the 45° branch axils)',
      tips: 'Stake firmly with bamboo sticks. Prune all bottom leaves touching the soil to eliminate soil-borne blight fungus.',
    },
    repottingTime: {
      months: [8, 9, 10, 11],
      seasonText: 'Transplant when seedlings reach 4–6 inches',
      frequency: 'Once into final container',
      signs: [
        'Deep green foliage with thick root system in nursery cup',
      ],
    },
    potSizeRequired: {
      sizeInches: '12 to 16 inches',
      volumeLiters: '18–25 Liters',
      materialAdvice: 'Large plastic bucket or grow bag with staking provision.',
    },
    floweringSeason: {
      isFlowering: true,
      months: [10, 11, 12, 1, 2, 3],
      seasonText: 'Yellow star blossoms produce juicy green to red fruit clusters within 60–80 days',
    },
    diseasesAndPests: [
      {
        id: 'tomato-leafminer',
        name: 'Leaf Miner (Serpentine trails)',
        symptomType: 'holes',
        symptoms: 'Winding white scribbled lines across leaf surfaces; larvae tunneling between epidermal layers.',
        homeRemedy: {
          name: 'Neem-Camphor (Kafur) Spray',
          ingredients: '5ml neem oil + 1 crushed camphor tablet + 1 tsp liquid soap in 1L warm water',
          preparationAndUse: 'Pinch off and destroy heavily mined lower leaves. Spray the remaining plant thoroughly on both surfaces.',
          frequency: 'Every 4 to 5 days',
        },
        conventionalTreatment: 'Abamectin or Spinosad spray (1ml/L).',
      },
      {
        id: 'tomato-blight',
        name: 'Early / Late Blight & Leaf Spot',
        symptomType: 'spots',
        symptoms: 'Dark brown concentric ring spots on lower leaves spreading upward; leaves wither and dry out.',
        homeRemedy: {
          name: 'Baking Soda & Copper Coin Ferment',
          ingredients: '1 tsp baking soda + 2 drops neem oil in 1L water; water left with copper vessel for 48 hours',
          preparationAndUse: 'Spray foliage in morning sun; mulch topsoil with dry straw so raindrops don’t splash soil spores onto leaves.',
          frequency: 'Every 7 days',
        },
        conventionalTreatment: 'Copper Oxychloride (Blitox 50 WP) at 2.5g/L or Mancozeb.',
      },
      {
        id: 'tomato-blossomendrot',
        name: 'Blossom End Rot (Calcium Deficiency)',
        symptomType: 'spots',
        symptoms: 'Bottom of green tomatoes turns sunken, black, leathery, and flat.',
        homeRemedy: {
          name: 'Slaked Lime (Paan Chuna) Water',
          ingredients: 'Gram-sized pinch of edible edible chuna (calcium hydroxide) dissolved in 2L water',
          preparationAndUse: 'Drench root soil once. Supplies immediately bioavailable calcium to developing fruit.',
          frequency: 'Once a fortnight during fruit set',
        },
        conventionalTreatment: 'Calcium Nitrate foliar spray (2g/L).',
      },
    ],
    notes: 'Gently tapping the tomato flower clusters around midday causes vibration that ensures 100% self-pollination!',
  },
  {
    id: 'mint',
    name: 'Mint (Pudina)',
    botanicalName: 'Mentha spicata',
    hindiName: 'पुदीना',
    category: 'Herb',
    waterRequirement: {
      level: 'High',
      frequency: 'Daily; keep soil consistently moist',
      seasonalNote: 'Loves moisture. Leaves will wilt rapidly within hours of drying out in harsh terrace breeze.',
    },
    sunlightRequirement: {
      type: 'Partial Shade',
      hoursNeeded: '3 to 5 hours morning sun or filtered light',
      summerTerraceNote: 'Keep under partial shade in peak Indian summer (May–June) to retain volatile menthol aroma.',
    },
    fertilizerRequirement: {
      type: 'Vermicompost and Liquid Seaweed Extract',
      npkOrOrganic: 'Gentle organic Nitrogen feed; compost tea',
      frequency: 'Every 20 days',
    },
    sowingTime: {
      months: [2, 3, 4, 7, 8],
      seasonText: 'Spring (Feb–April) and Monsoon (July–August)',
      method: 'Grocery store supermarket mint stem cuttings rooted in water for 4 days',
    },
    pruningTime: {
      months: [3, 4, 5, 6, 7, 8, 9, 10],
      seasonText: 'Harvesting is pruning! All summer long',
      frequency: 'Snip top 2 inches constantly for cooking and chutneys',
      tips: 'Never pull leaves off individually; snip the top whole branch. This forces 2 to 4 fresh new side shoots from every cut node.',
    },
    repottingTime: {
      months: [2, 3],
      seasonText: 'Spring rejuvenation (Feb–March)',
      frequency: 'Every year (mint runners become aggressively root-bound)',
      signs: [
        'Runners wrap in a dense tight mat choking out fresh green sprouts',
        'Stems become thin, woody, and bare at the bottom',
      ],
    },
    potSizeRequired: {
      sizeInches: 'Wide shallow tray (12–16 inches wide, 6 inches deep)',
      volumeLiters: '8–12 Liters',
      materialAdvice: 'Shallow rectangular planter trough allows horizontal stolons/runners to root continuously.',
    },
    floweringSeason: {
      isFlowering: true,
      months: [8, 9],
      seasonText: 'Late summer; tiny lilac flowers. Clip flower spikes immediately as they make leaves bitter.',
    },
    diseasesAndPests: [
      {
        id: 'mint-rust',
        name: 'Mint Rust & Leaf Spot',
        symptomType: 'spots',
        symptoms: 'Orange-brown dusty pustules on leaf undersides; leaves twist and shed.',
        homeRemedy: {
          name: 'Ground Cinnamon & Wood Ash Dusting',
          ingredients: '1 part cinnamon powder + 3 parts sifted clean dry wood ash',
          preparationAndUse: 'Cut back infected stems to 1 inch above soil, dust the remaining crowns with the powder mix.',
          frequency: 'Once after hard cutback',
        },
        conventionalTreatment: 'Sulfur dust or copper fungicide.',
      },
      {
        id: 'mint-caterpillar',
        name: 'Leaf-Rolling Caterpillars',
        symptomType: 'holes',
        symptoms: 'Leaves webbed together into a roll with small holes and black frass (droppings).',
        homeRemedy: {
          name: 'Handpicking & Turmeric Water Spray',
          ingredients: 'Unroll webbed leaves to handpick green worms + 1 tsp turmeric + 1 tsp salt in 1L water',
          preparationAndUse: 'Spray thoroughly in early morning.',
          frequency: 'As needed',
        },
        conventionalTreatment: 'Bacillus thuringiensis (Bt spray) biological control.',
      },
    ],
    notes: 'Always grow mint in its own dedicated pot, otherwise its aggressive runners will invade and choke neighboring plants.',
  },
  {
    id: 'desi-rose',
    name: 'Indian Rose (Desi Gulab)',
    botanicalName: 'Rosa damascena / Rosa indica',
    hindiName: 'देसी गुलाब',
    category: 'Flowering',
    waterRequirement: {
      level: 'Moderate',
      frequency: 'Every 1 to 2 days',
      seasonalNote: 'Water early morning directly at root base. Never splash leaves in evening to prevent black spot fungal attack.',
    },
    sunlightRequirement: {
      type: 'Full Sun',
      hoursNeeded: '6+ hours direct sunlight',
      summerTerraceNote: 'Requires maximum sunlight to produce intense fragrance and continuous blooms.',
    },
    fertilizerRequirement: {
      type: 'Mustard Cake (Sarson Khali) Liquid, Steamed Bonemeal, and Vermicompost',
      npkOrOrganic: 'Rose food mix: 1 tbsp bonemeal + 1 tbsp neem khali + 1 pinch Epsom salt once a month',
      frequency: 'Every 15 to 20 days during winter flush (Oct to March)',
    },
    sowingTime: {
      months: [7, 8, 9, 10],
      seasonText: 'Monsoon to early Autumn via semi-hardwood cuttings or bud grafting',
      method: 'Stem cuttings treated with cinnamon or rooting hormone',
    },
    pruningTime: {
      months: [9, 10], // Late Sept to mid Oct
      seasonText: 'Post-Monsoon Pruning (Crucial for Indian Rose growers!)',
      frequency: 'Hard prune in October; regular deadheading throughout winter',
      tips: 'Prune branches back to 12–15 inches above soil at a 45° angle. Coat cut ends with turmeric paste or copper paste to prevent dieback disease!',
    },
    repottingTime: {
      months: [9, 10],
      seasonText: 'October (right after the monsoon)',
      frequency: 'Every 2 years',
      signs: [
        'Soil depleted, roots sticking to container sides',
        'Stems producing blind shoots (shoots with no flower bud)',
      ],
    },
    potSizeRequired: {
      sizeInches: '14 to 18 inches',
      volumeLiters: '20–30 Liters',
      materialAdvice: 'Heavy terracotta or ceramic pot that insulates roots against fierce terrace sun.',
    },
    floweringSeason: {
      isFlowering: true,
      months: [10, 11, 12, 1, 2, 3, 4],
      seasonText: 'Peaks dramatically from October through March; mild flushes in monsoon',
    },
    diseasesAndPests: [
      {
        id: 'rose-dieback',
        name: 'Rose Dieback (Stem blackens from tip downwards)',
        symptomType: 'wilting',
        symptoms: 'Pruned cut tip turns black and necrosis travels downwards along the stem killing the branch.',
        homeRemedy: {
          name: 'Thick Turmeric & Mustard Oil Sealant Paste',
          ingredients: '2 tsp turmeric powder (Haldi) mixed with pure mustard oil to make a thick paste',
          preparationAndUse: 'Cut the blackened stem 2 inches below the infected portion until green pith shows. Immediately smear the fresh cut tip with turmeric paste.',
          frequency: 'Apply immediately after any pruning cut',
        },
        conventionalTreatment: 'Fungicide paste of Copper Oxychloride (Blitox) or Saaf mixed with water.',
      },
      {
        id: 'rose-blackspot',
        name: 'Black Spot & Powdery Mildew',
        symptomType: 'spots',
        symptoms: 'Circular black fringed spots on upper leaf surfaces; surrounding leaf tissue turns yellow and falls.',
        homeRemedy: {
          name: 'Baking Soda, Cow Milk & Neem Spray',
          ingredients: '100ml milk + 1 tsp baking soda + 1 tsp neem oil in 1L water',
          preparationAndUse: 'Spray foliage in early morning sunshine so it dries quickly. Removes fungal spores.',
          frequency: 'Every 7 days in humid weather',
        },
        conventionalTreatment: 'Hexaconazole (Contaf 5 EC) at 1ml/L or Propiconazole.',
      },
      {
        id: 'rose-thrips',
        name: 'Rose Thrips & Aphids',
        symptomType: 'curling',
        symptoms: 'Petals have brown crispy edges; leaves curl upwards into canoe shapes.',
        homeRemedy: {
          name: 'Tobacco Ash or Neem-Garlic Concentrate',
          ingredients: 'Boiled neem leaves + 4 crushed garlic cloves steeped in 1L water',
          preparationAndUse: 'Spray under leaf nodes and flower bud necks at dusk.',
          frequency: 'Every 4 days',
        },
        conventionalTreatment: 'Fipronil 5% SC (1.5ml/L) or Confidor.',
      },
    ],
    notes: 'Desi Gulab petals are traditionally distilled into Rose Water (Gulab Jal) or layered with sugar for Gulkand.',
  },
  {
    id: 'aloe-vera',
    name: 'Aloe Vera (Ghritkumari)',
    botanicalName: 'Aloe barbadensis miller',
    hindiName: 'घृतकुमारी / एलोवेरा',
    category: 'Succulent',
    waterRequirement: {
      level: 'Low',
      frequency: 'Every 7 to 10 days; once every 2 weeks in winter',
      seasonalNote: 'Rule of thumb: "When in doubt, don\'t water." Overwatering is the #1 killer of Aloe Vera in terrace pots.',
    },
    sunlightRequirement: {
      type: 'Partial Shade',
      hoursNeeded: '3 to 5 hours morning sun or bright indirect light',
      summerTerraceNote: 'Intense 45°C direct sun turns thick fleshy leaves a dull reddish-brown (sun stress).',
    },
    fertilizerRequirement: {
      type: 'Vermicompost or Cactus/Succulent organic liquid',
      npkOrOrganic: 'Low nitrogen; handful of dry vermicompost or leaf mold twice a year',
      frequency: 'Twice a year (Spring and Monsoon)',
    },
    sowingTime: {
      months: [3, 4, 7, 8],
      seasonText: 'Spring or Monsoon via baby offsets ("pups")',
      method: 'Separate root-bearing pups emerging around the mother plant base',
    },
    pruningTime: {
      months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      seasonText: 'Anytime for harvesting mature outer gel leaves',
      frequency: 'As needed; trim dried brown leaf tips',
      tips: 'Always slice the thickest lowest outer leaf at the stem base using a clean sharp knife. Allow yellowish aloin latex to drain for 10 mins before using gel.',
    },
    repottingTime: {
      months: [3, 4, 7],
      seasonText: 'Spring or Monsoon',
      frequency: 'Every 2 to 3 years when mother plant fills pot with pups',
      signs: [
        'Pups crowd the pot rim making watering impossible',
        'Top-heavy plant tips over in terrace breeze',
      ],
    },
    potSizeRequired: {
      sizeInches: '10 to 12 inches (wide and shallow)',
      volumeLiters: '8–12 Liters',
      materialAdvice: 'Porous unglazed terracotta pot with gritty potting soil (50% coarse sand/perlite, 30% soil, 20% compost).',
    },
    floweringSeason: {
      isFlowering: true,
      months: [1, 2, 3],
      seasonText: 'Mature plants send up a tall spike of tubular yellow/orange flowers in late winter',
    },
    diseasesAndPests: [
      {
        id: 'aloe-rootrot',
        name: 'Basal Stem & Root Rot (Overwatering)',
        symptomType: 'wilting',
        symptoms: 'Leaves turn translucent, soft, jelly-like, and collapse into a brownish puddle at the base.',
        homeRemedy: {
          name: 'Sun Drying & Clean Sand Rescue',
          ingredients: 'Clean gravel/sand + sulfur or turmeric powder',
          preparationAndUse: 'Remove from pot immediately. Cut off all mushy brown tissue. Dust cuts with turmeric powder and let dry in the shade for 3 days before replanting into dry sand.',
          frequency: 'Emergency rescue measure',
        },
        conventionalTreatment: 'Bavistin root dip (2g/L) before replanting into pure sterilized perlite-sand mix.',
      },
      {
        id: 'aloe-mite',
        name: 'Aloe Gall Mite',
        symptomType: 'stunted',
        symptoms: 'Warty, cauliflower-like cancerous growths on leaves and flower stalks.',
        homeRemedy: {
          name: 'Surgical excision',
          ingredients: 'Sharp blade sterilized with flame/alcohol',
          preparationAndUse: 'Carefully excise entire gall tissue and dispose of in garbage (do not compost). Dust wound with wood ash.',
          frequency: 'Upon spotting',
        },
        conventionalTreatment: 'Carbaryl or Sulfur spray.',
      },
    ],
    notes: 'Terrace gardeners use fresh Aloe Vera gel as a 100% natural, pathogen-free plant rooting hormone for cuttings!',
  },
  {
    id: 'bougainvillea',
    name: 'Bougainvillea (Paper Flower)',
    botanicalName: 'Bougainvillea spectabilis',
    hindiName: 'कागज़ के फूल / बोगनवेलिया',
    category: 'Flowering',
    waterRequirement: {
      level: 'Low',
      frequency: 'Every 3 to 4 days; allow soil to dry completely between watering',
      seasonalNote: 'Water stress is the secret to heavy flowering! If you overwater Bougainvillea, you will get only green leaves and zero flowers.',
    },
    sunlightRequirement: {
      type: 'Full Sun',
      hoursNeeded: '6 to 8+ hours direct intense sunlight',
      summerTerraceNote: 'Extreme terrace heat champion. Can withstand 45°C+ summer sun without flinching.',
    },
    fertilizerRequirement: {
      type: 'Mustard Cake Liquid, Bone Meal, and Banana Peel Tea',
      npkOrOrganic: 'High Potassium and Phosphorus; avoid excess nitrogen which induces leaf growth over bracts',
      frequency: 'Once a month during growth; pause during full bloom',
    },
    sowingTime: {
      months: [6, 7, 8],
      seasonText: 'Monsoon season via hardwood stem cuttings',
      method: 'Pencil-thick mature stems (8-10 inches) rooted in sandy soil',
    },
    pruningTime: {
      months: [2, 3, 9, 10],
      seasonText: 'Prune hard after each flowering flush (Spring & Post-Monsoon)',
      frequency: 'Trim tips to keep compact or train along balcony railing',
      tips: 'Flowers only appear on new shoot growth. Cutting back long thorny shoots stimulates clusters of colourful papery bracts.',
    },
    repottingTime: {
      months: [2, 3],
      seasonText: 'Spring (Feb–March)',
      frequency: 'Every 2 to 3 years (Bougainvillea loves being slightly root-bound to bloom heavily)',
      signs: [
        'Roots firmly fill the container; do not disturb fragile root ball when repotting',
      ],
    },
    potSizeRequired: {
      sizeInches: '12 to 16 inches',
      volumeLiters: '15–25 Liters',
      materialAdvice: 'Sturdy clay pot with strong base so it does not tip in terrace storms.',
    },
    floweringSeason: {
      isFlowering: true,
      months: [10, 11, 12, 1, 2, 3, 4, 5],
      seasonText: 'Prolific bloom flushes through Autumn, Winter, and Spring (nearly year-round in hot climates)',
    },
    diseasesAndPests: [
      {
        id: 'bougainvillea-caterpillar',
        name: 'Bougainvillea Looper Caterpillar',
        symptomType: 'holes',
        symptoms: 'Ragged chewed leaf edges; leaves eaten down to the veins overnight.',
        homeRemedy: {
          name: 'Garlic, Chili & Soap Spray',
          ingredients: '3 spicy chilies + 1 whole garlic head blended with 1L water + 1 tsp liquid soap',
          preparationAndUse: 'Spray at dusk when nocturnal loopers emerge to feed.',
          frequency: 'Every 5 days for 2 cycles',
        },
        conventionalTreatment: 'Bt (Bacillus thuringiensis) spray or Chlorantraniliprole.',
      },
      {
        id: 'bougainvillea-chlorosis',
        name: 'Iron & Magnesium Deficiency',
        symptomType: 'yellowing',
        symptoms: 'Yellow leaves with green veins; stunted paper bracts.',
        homeRemedy: {
          name: 'Epsom Salt & Soaked Tea Leaves',
          ingredients: '1 tsp Epsom salt + handful used washed tea leaves worked into topsoil',
          preparationAndUse: 'Apply around drip line and water in lightly.',
          frequency: 'Once a month',
        },
        conventionalTreatment: 'Chelated Micronutrient mixture (Multiplex 2g/L).',
      },
    ],
    notes: 'Restricting water for 4–5 days until leaves slightly droop, followed by deep watering, triggers a massive explosion of flowers.',
  },
  {
    id: 'mogra',
    name: 'Mogra / Arabian Jasmine',
    botanicalName: 'Jasminum sambac',
    hindiName: 'मोगरा / बेला',
    category: 'Flowering',
    waterRequirement: {
      level: 'Moderate',
      frequency: 'Daily in summer; alternate days in cooler months',
      seasonalNote: 'Keep soil moist but well-drained during summer flowering season; reduce water in winter dormancy.',
    },
    sunlightRequirement: {
      type: 'Full Sun',
      hoursNeeded: '5 to 6 hours direct sunlight',
      summerTerraceNote: 'Needs warm sunlight to open its heavenly scented white double blossoms at dusk.',
    },
    fertilizerRequirement: {
      type: 'Vermicompost, Mustard Cake (Sarson Khali), and Epsom Salt',
      npkOrOrganic: 'High organic matter + 1 tsp bonemeal for phosphorus; 1 tsp Epsom salt every month',
      frequency: 'Every 15 to 20 days during flowering season (Feb to Sept)',
    },
    sowingTime: {
      months: [6, 7, 8],
      seasonText: 'Monsoon season via semi-hardwood stem cuttings or layering',
      method: 'Cuttings in sand-cocopeat medium kept in high humidity',
    },
    pruningTime: {
      months: [1, 2], // Jan-Feb
      seasonText: 'Crucial Spring Pruning (Late January to Mid-February)',
      frequency: 'Annual hard pruning is mandatory for Mogra!',
      tips: 'Cut back all main stems to 6 inches above soil in February. Strip off all remaining old leaves and withhold water for 3 days. This "shock" creates hundreds of fragrant new flowering buds!',
    },
    repottingTime: {
      months: [2, 3],
      seasonText: 'Spring (Feb–March) immediately after annual pruning',
      frequency: 'Once every 2 years',
      signs: [
        'Roots circling pot bottom',
        'Fewer flower buds produced despite full sun',
      ],
    },
    potSizeRequired: {
      sizeInches: '12 to 14 inches',
      volumeLiters: '15–20 Liters',
      materialAdvice: 'Clay terracotta pot keeps root ball cool and moist during hot summer terrace afternoons.',
    },
    floweringSeason: {
      isFlowering: true,
      months: [3, 4, 5, 6, 7, 8, 9],
      seasonText: 'March through September; peak intoxicating fragrance in May–June and Monsoon flushes',
    },
    diseasesAndPests: [
      {
        id: 'mogra-budborer',
        name: 'Jasmine Bud Borer (Keeda in buds)',
        symptomType: 'bud_drop',
        symptoms: 'Flower buds turn pinkish-violet, have tiny boreholes, and drop without opening; webbed clusters.',
        homeRemedy: {
          name: 'Neem Seed Kernel Extract (NSKE) Spray',
          ingredients: '50g crushed neem seeds soaked overnight in 1L water + 2ml liquid soap',
          preparationAndUse: 'Filter and mist thoroughly onto all tiny emerging green bud tips early morning.',
          frequency: 'Every 7 days during bud formation',
        },
        conventionalTreatment: 'Spinosad (0.5ml/L) or Emamectin Benzoate 5% SG (0.5g/L).',
      },
      {
        id: 'mogra-caterpillar',
        name: 'Leaf Webworm',
        symptomType: 'holes',
        symptoms: 'Leaves stuck together with silken threads; inside caterpillar skeletonizes green leaf tissue.',
        homeRemedy: {
          name: 'Handpicking & Turmeric-Garlic Water',
          ingredients: 'Pinch open and destroy webbed leaves; spray 1 tsp turmeric + 3 crushed garlic in 1L water',
          preparationAndUse: 'Deter future moth egg-laying.',
          frequency: 'Twice a week',
        },
        conventionalTreatment: 'Neem oil 10000 ppm or Cypermethrin spray.',
      },
    ],
    notes: 'Pluck half-open Mogra buds right at sunset to fragrance terrace rooms or weave into traditional festive Gajras.',
  },
  {
    id: 'coriander',
    name: 'Coriander (Dhaniya)',
    botanicalName: 'Coriandrum sativum',
    hindiName: 'धनिया',
    category: 'Herb',
    waterRequirement: {
      level: 'Moderate',
      frequency: 'Every 1 to 2 days with fine mist rose-can',
      seasonalNote: 'Water gently; powerful hose streams will topple delicate tender coriander stems.',
    },
    sunlightRequirement: {
      type: 'Partial Shade',
      hoursNeeded: '3 to 5 hours morning sun',
      summerTerraceNote: 'Bolts (prematurely flowers and goes to seed) rapidly in hot sun. Best grown in cool seasons or dappled shade.',
    },
    fertilizerRequirement: {
      type: 'Well-decomposed vermicompost mixed into initial potting soil',
      npkOrOrganic: 'Gentle organic compost; 1 application of diluted seaweed extract at 20 days',
      frequency: 'Once a month',
    },
    sowingTime: {
      months: [9, 10, 11, 12, 1, 2], // Autumn/Winter in plains
      seasonText: 'September through February; year-round in cool terrace spots',
      method: 'Kitchen whole coriander seeds crushed gently with rolling pin into two halves',
    },
    pruningTime: {
      months: [10, 11, 12, 1, 2, 3],
      seasonText: 'Continuous harvest (cut-and-come-again)',
      frequency: 'Harvest outer stems 1 inch above soil level',
      tips: 'Never pull roots out. Use scissors to snip leaves 1 inch above the crown; fresh shoots regrow up to 3 times!',
    },
    repottingTime: {
      months: [],
      seasonText: 'Direct-seeded only; coriander has delicate taproots and resents transplanting',
      frequency: 'Not applicable (sow successive batches every 3 weeks)',
      signs: ['Sow directly in final tray'],
    },
    potSizeRequired: {
      sizeInches: 'Wide shallow tray (6–8 inches deep, 14–20 inches wide)',
      volumeLiters: '10–15 Liters',
      materialAdvice: 'Shallow plastic seedling tray or vegetable crate lined with shade cloth.',
    },
    floweringSeason: {
      isFlowering: true,
      months: [2, 3],
      seasonText: 'Produces white umbel flowers when temperatures rise; collect fresh green seeds for cooking',
    },
    diseasesAndPests: [
      {
        id: 'coriander-powdery',
        name: 'Powdery Mildew & Stem Rot',
        symptomType: 'powdery_coating',
        symptoms: 'White powdery dust on delicate feathery leaves; stems collapse in dense patches.',
        homeRemedy: {
          name: 'Diluted Sour Chhaas Mist',
          ingredients: '50ml sour buttermilk in 1L water',
          preparationAndUse: 'Spray in morning sunshine and thin out seedlings to allow airflow between stems.',
          frequency: 'Every 5 days',
        },
        conventionalTreatment: 'Wettable sulfur (2g/L) or copper soap.',
      },
      {
        id: 'coriander-aphids',
        name: 'Green Aphids on Stems',
        symptomType: 'pests_visible',
        symptoms: 'Tiny green bugs coating tender stems causing yellowing.',
        homeRemedy: {
          name: 'Mild Soap & Ash Dusting',
          ingredients: '2 drops mild baby shampoo in 1L water + light sprinkle of dry wood ash',
          preparationAndUse: 'Wash stems gently and dust ash on damp soil.',
          frequency: 'Once a week',
        },
        conventionalTreatment: 'Organic Pyrethrum spray or cold neem water.',
      },
    ],
    notes: 'Soaking split coriander seeds in water for 12 hours before sowing cuts germination time from 14 days down to 6 days.',
  },
  {
    id: 'bitter-gourd',
    name: 'Bitter Gourd (Karela)',
    botanicalName: 'Momordica charantia',
    hindiName: 'करेला',
    category: 'Vegetable',
    waterRequirement: {
      level: 'High',
      frequency: 'Daily during hot terrace days',
      seasonalNote: 'Vigorous climber with large foliage; soil must remain damp but never stagnant waterlogged.',
    },
    sunlightRequirement: {
      type: 'Full Sun',
      hoursNeeded: '6 to 8 hours direct sun',
      summerTerraceNote: 'Needs full terrace sunlight to set abundant yellow flowers and bitter green gourds.',
    },
    fertilizerRequirement: {
      type: 'Cow Dung Manure, Mustard Cake Liquid, and Vermicompost',
      npkOrOrganic: 'High organic content + monthly bonemeal/potash for fruit development',
      frequency: 'Every 15 days',
    },
    sowingTime: {
      months: [2, 3, 6, 7], // Summer & Monsoon
      seasonText: 'Summer crop: Feb–March; Monsoon crop: June–July',
      method: 'Hard-coated seeds soaked overnight and nicked slightly at the seed edge',
    },
    pruningTime: {
      months: [3, 4, 7, 8],
      seasonText: 'Active vine growth',
      frequency: 'Pinch main leader vine at 6 feet height',
      tips: 'Train on balcony trellis or nylon netting. Pinching the main vine forces lateral side vines which produce predominantly female (fruit-bearing) flowers.',
    },
    repottingTime: {
      months: [3, 7],
      seasonText: 'Transplant when 3–4 true leaves appear (or direct sow)',
      frequency: 'Once into large final pot',
      signs: ['Seedlings form first climbing tendril'],
    },
    potSizeRequired: {
      sizeInches: '16 to 20 inches',
      volumeLiters: '25–35 Liters',
      materialAdvice: 'Large grow bag or plastic drum with vertical trellis netting attached.',
    },
    floweringSeason: {
      isFlowering: true,
      months: [4, 5, 6, 7, 8, 9, 10],
      seasonText: 'Bright yellow flowers; female flowers have a miniature baby karela behind the petals',
    },
    diseasesAndPests: [
      {
        id: 'karela-fruitfly',
        name: 'Fruit Fly (Keeda inside fruit)',
        symptomType: 'spots',
        symptoms: 'Yellow punctures on young gourds with resin drop; fruit rots prematurely with maggots inside.',
        homeRemedy: {
          name: 'Paper/Mesh Bagging & Jaggery-Vinegar Traps',
          ingredients: 'Small breathable mesh bags or newspaper sleeves wrapped around 2-day-old pollinated baby fruits',
          preparationAndUse: 'Wrap young fruits right after flower petals wilt. Hang a plastic bottle trap with water, vinegar, and jaggery to trap adult flies.',
          frequency: 'Wrap every new fruit',
        },
        conventionalTreatment: 'Pheromone traps (Cue-lure) hung near the terrace trellis.',
      },
      {
        id: 'karela-downy',
        name: 'Downy Mildew & Angular Leaf Spots',
        symptomType: 'spots',
        symptoms: 'Yellow angular patches on upper leaf surface bounded by veins; grayish mold underneath.',
        homeRemedy: {
          name: 'Baking Soda & Wood Ash Slurry',
          ingredients: '1 tsp baking soda + 1 tbsp fine wood ash dissolved in 1L water',
          preparationAndUse: 'Spray early morning on the underside of climber leaves.',
          frequency: 'Every 5 to 7 days',
        },
        conventionalTreatment: 'Ridomil Gold (Metalaxyl + Mancozeb) at 2g/L.',
      },
    ],
    notes: 'Hand-pollinating female flowers in early morning by touching a picked male flower ensures 100% fruit set on terrace gardens.',
  },
  {
    id: 'snake-plant',
    name: 'Snake Plant (Sansevieria)',
    botanicalName: 'Dracaena trifasciata',
    hindiName: 'स्नेक प्लांट / सास की जीभ',
    category: 'Foliage',
    waterRequirement: {
      level: 'Low',
      frequency: 'Every 10 to 14 days in summer; once a month in winter',
      seasonalNote: 'Virtually indestructible except by overwatering. Soil must be bone dry before you even think of watering.',
    },
    sunlightRequirement: {
      type: 'Partial Shade',
      hoursNeeded: 'Tolerates any light: from full shade to bright indirect sun',
      summerTerraceNote: 'Can grow in sheltered terrace corners; avoid harsh all-day 45°C summer sun to preserve vivid variegation.',
    },
    fertilizerRequirement: {
      type: 'Diluted Vermicompost tea or balanced 19-19-19',
      npkOrOrganic: 'Minimal feeding; 1/4 strength liquid fertilizer',
      frequency: 'Every 2 to 3 months (Spring and Monsoon only)',
    },
    sowingTime: {
      months: [3, 4, 5, 6, 7, 8],
      seasonText: 'Spring to Monsoon via rhizome division or leaf cuttings',
      method: 'Slice rhizome underground or insert 3-inch leaf cross-sections into sandy soil',
    },
    pruningTime: {
      months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      seasonText: 'Rarely needed',
      frequency: 'Trim any yellow or bent outer leaves at the soil level with a sterile cutter',
      tips: 'Wipe architectural leaves with a damp cotton cloth once a month to remove terrace dust and optimize air purification.',
    },
    repottingTime: {
      months: [3, 4, 7],
      seasonText: 'Spring or Monsoon',
      frequency: 'Every 3 to 4 years (Snake plants love tight roots; will often crack plastic pots before complaining!)',
      signs: [
        'Rhizomes bulge and distort container sides',
        'Pups fill entire pot surface leaving no soil visible',
      ],
    },
    potSizeRequired: {
      sizeInches: '8 to 12 inches (heavy ceramic or terracotta)',
      volumeLiters: '6–10 Liters',
      materialAdvice: 'Heavy clay/ceramic pot with drainage hole to prevent tall architectural leaves from toppling in high winds.',
    },
    floweringSeason: {
      isFlowering: true,
      months: [3, 4],
      seasonText: 'Occasional surprise in spring: sends up a tall spike of highly fragrant, nectar-dripping greenish-white blossoms',
    },
    diseasesAndPests: [
      {
        id: 'snake-softrot',
        name: 'Rhizome Soft Rot (Overwatering)',
        symptomType: 'wilting',
        symptoms: 'Leaf base turns brown, soggy, and detached from rhizome with foul odor.',
        homeRemedy: {
          name: 'Drying & Turmeric Antifungal Dusting',
          ingredients: 'Clean garden sand + pure kitchen turmeric powder',
          preparationAndUse: 'Remove affected leaf, slice away soft rhizome, rub generous turmeric powder on wound, and withhold water for 2 weeks.',
          frequency: 'Single intervention',
        },
        conventionalTreatment: 'Dip rhizome in Bavistin (2g/L) for 15 minutes before repotting in gritty perlite mix.',
      },
    ],
    notes: 'One of the few plants that releases oxygen at night (Crassulacean Acid Metabolism), making it ideal near bedroom balconies.',
  },
  {
    id: 'brinjal',
    name: 'Brinjal / Eggplant (Baingan)',
    botanicalName: 'Solanum melongena',
    hindiName: 'बैंगन',
    category: 'Vegetable',
    waterRequirement: {
      level: 'High',
      frequency: 'Daily in summer; every 2 days in winter',
      seasonalNote: 'Large leaves transpire water rapidly. Dry soil causes tough, bitter brinjals with premature seediness.',
    },
    sunlightRequirement: {
      type: 'Full Sun',
      hoursNeeded: '6 to 8 hours direct sunlight',
      summerTerraceNote: 'Loves heat; thrives in full terrace sun throughout Indian summers and monsoons.',
    },
    fertilizerRequirement: {
      type: 'Mustard Cake (Sarson Khali) Tea, Vermicompost, and Bonemeal',
      npkOrOrganic: 'Heavy feeder; high potassium and nitrogen for continuous fruiting',
      frequency: 'Every 15 days',
    },
    sowingTime: {
      months: [2, 3, 6, 7, 10, 11], // Almost year-round in 3 seasons
      seasonText: 'Spring (Feb–March), Monsoon (June–July), Autumn (Oct–Nov)',
      method: 'Seeds sown in seed starter trays and transplanted at 30 days',
    },
    pruningTime: {
      months: [4, 5, 8, 9, 12, 1],
      seasonText: 'Active growth phase',
      frequency: 'Pinch top tip at 1 foot height; prune lower leaves yellowing near soil',
      tips: 'Stake main stem with bamboo cane. Prune small side branches beneath the first flower cluster to direct energy to big glossy brinjals.',
    },
    repottingTime: {
      months: [3, 4, 7, 8, 11],
      seasonText: '30 days after sowing',
      frequency: 'Once into large final pot',
      signs: ['Seedlings have 4–5 sturdy leaves and thick roots'],
    },
    potSizeRequired: {
      sizeInches: '12 to 14 inches',
      volumeLiters: '15–20 Liters',
      materialAdvice: 'Standard plastic or clay pot; 1 vigorous plant per container.',
    },
    floweringSeason: {
      isFlowering: true,
      months: [3, 4, 5, 7, 8, 9, 10, 11, 12],
      seasonText: 'Attractive purple star flowers yield glossy purple or green brinjals continuously for 8–10 months',
    },
    diseasesAndPests: [
      {
        id: 'brinjal-shootborer',
        name: 'Shoot & Fruit Borer (Tana aur Fal Chhedak)',
        symptomType: 'wilting',
        symptoms: 'Tender growing shoots wilt and droop suddenly; boreholes with dark frass in developing brinjals.',
        homeRemedy: {
          name: 'Immediate Shoot Clipping & Neem Concentrate',
          ingredients: 'Snipping wilted shoot 1 inch below borehole to kill caterpillar inside + 10ml neem oil + soap in 1L water',
          preparationAndUse: 'Inspect every morning. Cut and submerge bored shoots into soapy water. Spray neem to deter egg-laying moths.',
          frequency: 'Weekly inspection and spray',
        },
        conventionalTreatment: 'Pheromone traps (Leucinodes lure) + Chlorantraniliprole (Coragen 0.3ml/L).',
      },
      {
        id: 'brinjal-mealybug',
        name: 'Cottony Mealybugs & Aphids',
        symptomType: 'pests_visible',
        symptoms: 'White waxy clusters beneath broad leaves and on calyx caps of fruit.',
        homeRemedy: {
          name: 'Soap-Kerosene or Rubbing Alcohol Spray',
          ingredients: '5ml liquid soap + 1 tsp neem oil in 1L warm water; swab heavy clusters with alcohol',
          preparationAndUse: 'Spray with direct nozzle jet under leaf surfaces.',
          frequency: 'Every 4 days until cleared',
        },
        conventionalTreatment: 'Acetamiprid 20% SP or Imidacloprid.',
      },
    ],
    notes: 'Terrace garden round green or striped Baingan varieties (like Chu-Chu or Pusa Purple Round) produce up to 25 fruits per pot.',
  },
  {
    id: 'lemongrass',
    name: 'Lemongrass (Nimbu Ghas)',
    botanicalName: 'Cymbopogon citratus',
    hindiName: 'नींबू घास / लेमनग्रास',
    category: 'Herb',
    waterRequirement: {
      level: 'Moderate',
      frequency: 'Every 2 days',
      seasonalNote: 'Tolerant of short dry spells once established. Water when top inch is dry.',
    },
    sunlightRequirement: {
      type: 'Full Sun',
      hoursNeeded: '5 to 7 hours direct sunlight',
      summerTerraceNote: 'Direct sunlight is essential for synthesizing the aromatic citral essential oil in leaves.',
    },
    fertilizerRequirement: {
      type: 'Vermicompost and Cow Dung Manure',
      npkOrOrganic: 'High Nitrogen organic feed; top-dress with compost every 40 days',
      frequency: 'Every 4 to 6 weeks',
    },
    sowingTime: {
      months: [2, 3, 6, 7, 8],
      seasonText: 'Spring or Monsoon via clump root division or fresh grocery stalk rooting',
      method: 'Root division of clumps or rooting fresh stalk bases in water for 1 week',
    },
    pruningTime: {
      months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      seasonText: 'Continuous harvesting all year',
      frequency: 'Snip outer mature stalks at the soil line for daily morning Chai',
      tips: 'Give a hard "buzz cut" haircut (down to 4 inches) at the end of winter (February) to stimulate dozens of tender, intensely fragrant new shoots.',
    },
    repottingTime: {
      months: [2, 3, 7],
      seasonText: 'Spring or Monsoon',
      frequency: 'Every 2 years (divide large overgrown clump into 3–4 new pots)',
      signs: [
        'Root clump becomes so tight that water fails to penetrate center of pot',
        'Stalks become thin and woody',
      ],
    },
    potSizeRequired: {
      sizeInches: '12 to 16 inches',
      volumeLiters: '15–25 Liters',
      materialAdvice: 'Wide sturdy container to accommodate rapid horizontal clump expansion.',
    },
    floweringSeason: {
      isFlowering: false,
      months: [],
      seasonText: 'Rarely flowers in domestic container culture; grown for its aromatic stalks and leaves',
    },
    diseasesAndPests: [
      {
        id: 'lemongrass-rust',
        name: 'Leaf Blight & Rust',
        symptomType: 'spots',
        symptoms: 'Reddish-brown streaks and dry brown leaf tips.',
        homeRemedy: {
          name: 'Hard Cutback & Wood Ash Topdress',
          ingredients: 'Cut brown leaves back to healthy green section + dust dry wood ash around base',
          preparationAndUse: 'Dispose of dried leaf debris and keep center of clump aerated.',
          frequency: 'As needed',
        },
        conventionalTreatment: 'Saaf (Mancozeb + Carbendazim) spray.',
      },
    ],
    notes: 'The strong citral aroma of lemongrass acts as a natural terrace mosquito repellent.',
  },
  {
    id: 'aparajita',
    name: 'Aparajita / Butterfly Pea',
    botanicalName: 'Clitoria ternatea',
    hindiName: 'अपराजिता / शंखपुष्पी',
    category: 'Flowering',
    waterRequirement: {
      level: 'Moderate',
      frequency: 'Every 1 to 2 days',
      seasonalNote: 'Water when topsoil feels dry. Prefers well-drained soil; hates stagnant wet feet.',
    },
    sunlightRequirement: {
      type: 'Full Sun',
      hoursNeeded: '5 to 6 hours direct sunlight',
      summerTerraceNote: 'Loves Indian terrace warmth; produces divine sacred blue blossoms from summer through post-monsoon.',
    },
    fertilizerRequirement: {
      type: 'Vermicompost, Steamed Bonemeal, and Banana Peel Ferment',
      npkOrOrganic: 'As a legume, it fixes its own atmospheric nitrogen; requires Potassium and Phosphorus for blooms',
      frequency: 'Every 25 to 30 days',
    },
    sowingTime: {
      months: [2, 3, 6, 7], // Spring & Monsoon
      seasonText: 'Spring (Feb–March) and Monsoon (June–July)',
      method: 'Hard dark seeds soaked in warm water for 6 hours before sowing',
    },
    pruningTime: {
      months: [2, 3, 10],
      seasonText: 'Spring rejuvenation (Feb–March) and after flowering in late autumn',
      frequency: 'Pinch young vine tips to create a dense flowering screen along the balcony grill',
      tips: 'Remove green seed pods regularly. If allowed to produce seeds, the plant stops producing fresh flowers.',
    },
    repottingTime: {
      months: [2, 3, 7],
      seasonText: 'Spring or early Monsoon',
      frequency: 'Every 1.5 to 2 years',
      signs: ['Roots emerge through drainage holes; foliage becomes sparse at base'],
    },
    potSizeRequired: {
      sizeInches: '10 to 14 inches',
      volumeLiters: '12–18 Liters',
      materialAdvice: 'Terracotta or plastic pot with vertical strings or wire mesh support on the terrace wall.',
    },
    floweringSeason: {
      isFlowering: true,
      months: [5, 6, 7, 8, 9, 10, 11],
      seasonText: 'May through November; prolific peacock-blue sacred flowers used for Blue Tea and Shiva Puja',
    },
    diseasesAndPests: [
      {
        id: 'aparajita-caterpillar',
        name: 'Skipper Butterfly Caterpillars & Grasshoppers',
        symptomType: 'holes',
        symptoms: 'Leaf folds webbed together with circular holes chewed out.',
        homeRemedy: {
          name: 'Handpicking & Neem-Garlic Spray',
          ingredients: 'Handpick caterpillars at dusk + spray 5ml neem oil with garlic extract',
          preparationAndUse: 'Spray foliage every 4 days.',
          frequency: 'As needed',
        },
        conventionalTreatment: 'Spinosad (0.5ml/L) or Neem EC 10000 ppm.',
      },
      {
        id: 'aparajita-yellow',
        name: 'Iron Chlorosis & Waterlogging',
        symptomType: 'yellowing',
        symptoms: 'Pale yellow leaves during heavy monsoon rains.',
        homeRemedy: {
          name: 'Soil Aeration & Iron Water',
          ingredients: 'Tilt pot to drain trapped water + drench with rusted iron nail water + sour buttermilk',
          preparationAndUse: 'Allow topsoil to dry before watering again.',
          frequency: 'Once a month',
        },
        conventionalTreatment: 'Chelated Micronutrients (Microbe spray 1g/L).',
      },
    ],
    notes: 'Flowers can be steeped in hot water with a squeeze of lemon to watch the royal blue tea magically turn vibrant purple!',
  },
  {
    id: 'palak',
    name: 'Palak / Indian Spinach',
    botanicalName: 'Spinacia oleracea',
    hindiName: 'पालक',
    category: 'Vegetable',
    waterRequirement: {
      level: 'Moderate',
      frequency: 'Every 1 to 2 days',
      seasonalNote: 'Keep shallow root zone consistently moist. Moisture stress triggers bitter flavor and early bolting.',
    },
    sunlightRequirement: {
      type: 'Partial Shade',
      hoursNeeded: '3 to 5 hours sunlight',
      summerTerraceNote: 'Excellent winter terrace crop; benefits from afternoon shade in warm months.',
    },
    fertilizerRequirement: {
      type: 'Vermicompost or Decomposed Cow Dung Manure (Gobar Khad)',
      npkOrOrganic: 'High Nitrogen organic feed; compost tea after every harvest',
      frequency: 'Every 15 days',
    },
    sowingTime: {
      months: [8, 9, 10, 11, 12, 1], // Autumn & Winter
      seasonText: 'August to December in plains; year-round in cool terrace setups',
      method: 'Direct broadcast of round seeds 1 cm deep in wide shallow vegetable crates',
    },
    pruningTime: {
      months: [9, 10, 11, 12, 1, 2, 3],
      seasonText: 'Harvesting is pruning!',
      frequency: 'Harvest outer large leaves every 10–14 days',
      tips: 'Cut leaves 1.5 inches above soil level keeping the central crown intact. A single sowing yields 4 to 5 lush harvests!',
    },
    repottingTime: {
      months: [],
      seasonText: 'Direct-seeded crop; not repotted',
      frequency: 'Successive sowings every 3 weeks for unbroken kitchen supply',
      signs: ['Sow directly in final tray'],
    },
    potSizeRequired: {
      sizeInches: 'Wide shallow crate or rectangular grow bag (6–8 inches deep, 18–24 inches long)',
      volumeLiters: '15–20 Liters',
      materialAdvice: 'Wide shallow vegetable crate or grow tray allows dense leafy carpet growth.',
    },
    floweringSeason: {
      isFlowering: true,
      months: [2, 3],
      seasonText: 'Sends up flower stalk when spring heat arrives; harvest all leaves before flowering makes them bitter',
    },
    diseasesAndPests: [
      {
        id: 'palak-aphids',
        name: 'Green Aphids on Underside',
        symptomType: 'pests_visible',
        symptoms: 'Colonies of tiny green insects under tender leaves causing crinkling.',
        homeRemedy: {
          name: 'Water Jet & Wood Ash Dusting',
          ingredients: 'Spray under leaves with water hose + light dusting of dry wood ash on damp leaves',
          preparationAndUse: 'Deter aphids naturally without chemicals on edible greens.',
          frequency: 'Every 4 days',
        },
        conventionalTreatment: 'Organic soap spray or commercial Azadirachtin (Neem).',
      },
      {
        id: 'palak-leafspot',
        name: 'Cercospora Leaf Spot',
        symptomType: 'spots',
        symptoms: 'Small circular spots with reddish-purple borders and gray centers on leaves.',
        homeRemedy: {
          name: 'Sour Chhaas & Turmeric Mist',
          ingredients: '50ml sour buttermilk + 1/2 tsp turmeric powder in 1L water',
          preparationAndUse: 'Pinch off and discard infected leaves; spray healthy foliage early morning.',
          frequency: 'Every 5 days',
        },
        conventionalTreatment: 'Copper soap or Saaf fungicide.',
      },
    ],
    notes: 'Ready to harvest in just 28–35 days from seed, making it the most rewarding terrace vegetable for beginners.',
  },
  {
    id: 'adenium',
    name: 'Adenium / Desert Rose',
    botanicalName: 'Adenium obesum',
    hindiName: 'अडेनियम / मरुस्थल गुलाब',
    category: 'Succulent',
    waterRequirement: {
      level: 'Low',
      frequency: 'Every 5 to 7 days in summer; once every 3 weeks in winter',
      seasonalNote: 'Water only when the fat succulent caudex feels slightly soft to the touch. Overwatering causes caudex rot.',
    },
    sunlightRequirement: {
      type: 'Full Sun',
      hoursNeeded: '6 to 8+ hours direct blazing sunlight',
      summerTerraceNote: 'The undisputed champion of Indian terrace summers! Loves 45°C heat; rewards you with exotic blooms.',
    },
    fertilizerRequirement: {
      type: 'Bonemeal, Wood Ash, and Potash-rich organic feed',
      npkOrOrganic: 'Low Nitrogen, high Phosphorus and Potassium (NPK 0-52-34 or bonemeal)',
      frequency: 'Once a month during flowering season (Feb to Oct); zero fertilizer in winter dormancy',
    },
    sowingTime: {
      months: [3, 4, 7, 8],
      seasonText: 'Spring (March–April) or early Monsoon from fresh seeds or stem grafting',
      method: 'Fresh flat winged seeds sown on shallow moist river sand',
    },
    pruningTime: {
      months: [2, 3], // Feb-March
      seasonText: 'Annual Spring Pruning (February to early March)',
      frequency: 'Hard prune long leggy branches to shape the bonsai canopy',
      tips: 'Prune branches back to 2 inches from the main caudex. Seal every single cut with turmeric paste or Fevicol/antifungal paste to prevent stem rot!',
    },
    repottingTime: {
      months: [2, 3],
      seasonText: 'Spring (February–March)',
      frequency: 'Every 1 to 2 years',
      signs: [
        'Swollen caudex touches the inner pot rim',
        'Time to lift the caudex 1 inch higher above soil level for stunning bonsai root exposure',
      ],
    },
    potSizeRequired: {
      sizeInches: '10 to 14 inches (shallow bonsai bowl)',
      volumeLiters: '8–12 Liters',
      materialAdvice: 'Shallow terracotta bonsai saucer with multiple drainage holes. Gritty mix (40% cinder/brick pieces, 30% sand, 20% compost, 10% perlite).',
    },
    floweringSeason: {
      isFlowering: true,
      months: [3, 4, 5, 6, 8, 9, 10],
      seasonText: 'Spectacular floral flushes in Spring (Mar–May) and Autumn (Aug–Oct); dormant in cold winter',
    },
    diseasesAndPests: [
      {
        id: 'adenium-caudexrot',
        name: 'Caudex & Root Rot',
        symptomType: 'wilting',
        symptoms: 'Swollen caudex base turns squishy, brown, and caves in when pressed.',
        homeRemedy: {
          name: 'Surgical Caudex Amputation & Turmeric Seal',
          ingredients: 'Sterile surgical blade + kitchen turmeric powder + dry cinder mix',
          preparationAndUse: 'Unpot immediately. Cut away all squishy brown rotting tissue until pure white/green healthy flesh is exposed. Coat wound heavily with dry turmeric powder. Hang plant in shade for 7 days to callous before replanting in pure dry cinder.',
          frequency: 'Emergency rescue',
        },
        conventionalTreatment: 'Rub raw Bavistin powder onto cut wound and let callous for 5 days.',
      },
      {
        id: 'adenium-caterpillar',
        name: 'Oleander Moth Caterpillar (Polka-dot caterpillar)',
        symptomType: 'holes',
        symptoms: 'Orange-black tufted caterpillars stripping entire clusters of leaves and tender flower buds.',
        homeRemedy: {
          name: 'Handpicking & Neem Soap Spray',
          ingredients: 'Handpick caterpillars with gloves and drop into soapy water + spray neem',
          preparationAndUse: 'Spray at dusk.',
          frequency: 'Twice a week',
        },
        conventionalTreatment: 'Spinosad or Chlorpyrifos spray.',
      },
    ],
    notes: 'Every time you repot an Adenium in spring, lifting the swollen bulbous caudex 1 inch higher creates an authentic sculpture-like bonsai.',
  },
  {
    id: 'spider-plant',
    name: 'Spider Plant (Chlorophytum comosum)',
    botanicalName: 'Chlorophytum comosum',
    hindiName: 'स्पाइडर प्लांट / रिबन प्लांट',
    category: 'Foliage',
    waterRequirement: {
      level: 'Moderate',
      frequency: 'Every 2 to 3 days in summer; once every 5 to 7 days in winter',
      seasonalNote: 'Fleshy tuberous roots store water efficiently. Allow the top 1 to 2 inches of soil to dry out before watering again. Sensitive to fluoride and chlorine salts in municipal tap water which cause brown tips—use rested, RO, or rainwater.',
    },
    sunlightRequirement: {
      type: 'Partial Shade',
      hoursNeeded: '3 to 5 hours of bright indirect sunlight or filtered morning light',
      summerTerraceNote: 'Shield from harsh direct afternoon sun (especially 40°C+ summer heat), which scorches and bleaches variegated leaves. Thrives under green agro shade net or on covered east/north balconies.',
    },
    fertilizerRequirement: {
      type: 'Diluted Seaweed Extract or Vermicompost Liquid Tea',
      npkOrOrganic: 'Gentle balanced organic fertilizer (half strength); 1 tbsp vermicompost top-dressed monthly in growing season. Avoid heavy chemical fertilizers which cause salt build-up and leaf tip burn.',
      frequency: 'Once every 3 to 4 weeks during spring and monsoon (March to October); pause during cold winter dormancy',
    },
    sowingTime: {
      months: [2, 3, 4, 7, 8, 9],
      seasonText: 'Spring (Feb–April) and Monsoon (July–September) via plantlets / offsets ("spiderettes") or root ball division',
      method: 'Offsets / Spiderettes rooted in water or directly in moist potting mix, or root ball division during repotting',
    },
    pruningTime: {
      months: [2, 3, 9, 10],
      seasonText: 'Spring (Feb–March) and Post-Monsoon (Sept–October); routine cosmetic trimming anytime',
      frequency: 'Trim dead or brown leaf tips and remove dried runners as needed',
      tips: 'Use sterile scissors to snip off brown dried tips at a 45-degree angle following the natural leaf taper. Snip overgrown plantlet stolons if you want the mother plant to focus energy on dense foliage growth.',
    },
    repottingTime: {
      months: [2, 3, 7],
      seasonText: 'Spring (Feb–March) or early Monsoon (July)',
      frequency: 'Once every 1 to 2 years (rapidly expanding tuberous storage roots)',
      signs: [
        'Fleshy tuberous white roots visibly pushing up through soil surface or out of bottom drainage holes',
        'Plastic pot begins bulging, warping, or cracking from root pressure',
        'Water drains through too quickly because root mass has displaced the soil',
        'Plant foliage looks overcrowded and growth slows down despite feeding',
      ],
    },
    potSizeRequired: {
      sizeInches: '8 to 10 inches (or 8–10 inch hanging basket)',
      volumeLiters: '5–8 Liters',
      materialAdvice: 'Terracotta pot or sturdy hanging basket with excellent drainage holes. Well-draining soil mix: 40% garden soil, 30% cocopeat/sand, 30% vermicompost with a handful of perlite.',
    },
    floweringSeason: {
      isFlowering: true,
      months: [4, 5, 6, 7, 8],
      seasonText: 'Spring to late Summer (April–August); produces long arching wiry stems (stolons) with tiny, delicate white 6-petaled star-shaped florets (inconspicuous), followed by baby plantlets ("spiderettes")',
    },
    diseasesAndPests: [
      {
        id: 'spider-plant-rootrot',
        name: 'Root & Crown Rot (Waterlogged Roots)',
        symptomType: 'wilting',
        symptoms: 'Soft, translucent mushy leaves at the base, foliage collapsing outward, blackened mushy tuberous roots.',
        homeRemedy: {
          name: 'Root Trimming & Turmeric-Cinnamon Antiseptic Repotting',
          ingredients: 'Sterile scissors + 1 tsp kitchen turmeric powder (Haldi) + 1/2 tsp cinnamon powder',
          preparationAndUse: 'Unpot immediately and inspect root system. Cut off all black, mushy, rotting tuberous roots. Dust remaining healthy white roots with pure turmeric powder and repot into fresh, dry, gritty porous potting mix. Keep in bright shade and withhold water for 3 to 4 days.',
          frequency: 'Emergency rescue treatment',
        },
        conventionalTreatment: 'Drench root zone with Bavistin or Saaf fungicide (Carbendazim 12% + Mancozeb 63% WP) at 2g per liter water.',
      },
      {
        id: 'spider-plant-browntips',
        name: 'Brown Leaf Tips (Fluoride / Salt Toxicity or Dry Air)',
        symptomType: 'spots',
        symptoms: 'Crispy dark brown or black tips extending along the long variegated blade margins while remainder of leaf is green.',
        homeRemedy: {
          name: 'Overnight Rested Rain/Filtered Water Flush & Pebble Humidity Tray',
          ingredients: 'Rested dechlorinated water / RO water + shallow tray filled with pebbles and water beneath the pot',
          preparationAndUse: 'Flush the pot thoroughly with plenty of rested or filtered water to leach out accumulated tap water salts and fluoride. Keep pot on a pebble tray filled with water (pot base above water line) to elevate humidity.',
          frequency: 'Flush once every month; mist foliage during dry terrace summer heat',
        },
        conventionalTreatment: 'Switch strictly away from chlorinated/fluoridated municipal tap water; leach soil with distilled or reverse-osmosis (RO) water.',
      },
      {
        id: 'spider-plant-spidermites',
        name: 'Spider Mites & Scale Insects',
        symptomType: 'pests_visible',
        symptoms: 'Fine silky webbing under leaves, stippled yellow speckles across blades, or tiny brown oval scales along leaf midribs.',
        homeRemedy: {
          name: 'Sour Buttermilk (Khatta Chhaas) & Mild Soap Foliage Wash',
          ingredients: '100ml sour buttermilk + 3 drops gentle kitchen liquid soap + 1L water',
          preparationAndUse: 'Wipe both sides of the long leaves thoroughly with a soft sponge dipped in the mixture, or spray with a pressurized nozzle to dislodge mites and dissolve scale wax. Rinse with clean water 2 hours later.',
          frequency: 'Apply once every 5 days for 3 cycles',
        },
        conventionalTreatment: 'Spray Neem oil EC 1500 ppm (3ml/L) or Abamectin/Propargite miticide for persistent infestations.',
      },
      {
        id: 'spider-plant-leaf-yellowing',
        name: 'Leaf Yellowing & Bleached Foliage (Sun Scorch or Low Nitrogen)',
        symptomType: 'yellowing',
        symptoms: 'Foliage turns pale faded green or translucent washed-out yellow with crispy scorched streaks.',
        homeRemedy: {
          name: 'Used Rinsed Tea Leaves & Vermicompost Top-Dressing with Shade Relocation',
          ingredients: '2 tbsp boiled, well-rinsed and dried chai patti (tea leaves) + 1 handful vermicompost',
          preparationAndUse: 'Move the pot out of direct sunlight into bright dappled shade immediately. Gently hoe the tea leaves and vermicompost into the top inch of soil and water lightly to provide gentle nitrogen and organic acidity.',
          frequency: 'Once a month during active growth',
        },
        conventionalTreatment: 'Foliar spray of 19-19-19 water-soluble NPK at one-fourth strength (0.5g per liter).',
      },
    ],
    notes: 'NASA Clean Air study top-performer! Highly effective at filtering indoor formaldehyde, xylene, and carbon monoxide. Baby plantlets ("spiderettes") hanging from arching stolons can be easily rooted in small glasses of water or directly in miniature pots.',
  },
  {
    id: 'sadabahar',
    name: 'Sadabahar (Madagascar Periwinkle)',
    botanicalName: 'Catharanthus roseus',
    hindiName: 'सदाबहार / नयनतारा',
    category: 'Flowering',
    waterRequirement: {
      level: 'Low',
      frequency: 'Once every 2 to 3 days in summer; twice weekly in winter',
      seasonalNote:
        'Extremely drought-hardy. Water only when top 1.5 to 2 inches of potting mix is completely dry. Highly vulnerable to root rot if overwatered during monsoon.',
    },
    sunlightRequirement: {
      type: 'Full Sun',
      hoursNeeded: '5 to 6+ hours of direct sunlight',
      summerTerraceNote:
        'Loves hot, direct terrace sunlight. The more sun it receives, the more abundantly it flowers. Can thrive in 40°C+ summer heat.',
    },
    fertilizerRequirement: {
      type: 'Steamed Bone Meal or Mustard Cake Liquid (Sarson Khali)',
      npkOrOrganic:
        'Organic blooming booster (low nitrogen, rich in phosphorus & potassium). Avoid high-nitrogen fertilizers which cause excessive leafy growth and reduce flower count.',
      frequency: 'Every 30 to 45 days during active growth',
    },
    sowingTime: {
      months: [2, 3, 6, 7],
      seasonText: 'Spring (Feb–March) and Monsoon (June–July)',
      method: 'Seeds sown 0.5cm deep or 4-inch semi-hardwood stem cuttings rooted in moist sand',
    },
    pruningTime: {
      months: [2, 3, 9],
      seasonText: 'Early Spring (Feb–March) and Post-Monsoon (September)',
      frequency: 'Pinch growing tips every 4 to 6 weeks',
      tips: 'Pinch terminal soft shoots regularly to prevent the plant from becoming leggy and stimulate bushier growth with dozens of flowering buds.',
    },
    repottingTime: {
      months: [2, 3, 7],
      seasonText: 'Early Spring (Feb–March) or early Monsoon (July)',
      frequency: 'Once every 1 to 2 years',
      signs: [
        'Roots circling tightly at the base of the container',
        'Water drains through too quickly without wetting the root ball',
        'Bottom stems turn thick, bare, and woody',
      ],
    },
    potSizeRequired: {
      sizeInches: '8 to 10 inches',
      volumeLiters: '5–8 Liters',
      materialAdvice: 'Terracotta or porous clay pot with generous drainage holes to prevent soggy soil.',
    },
    floweringSeason: {
      isFlowering: true,
      months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      seasonText:
        'Year-round continuous blooms (Peaks in Summer & Monsoon); flowers non-stop on sunny Indian balconies.',
    },
    diseasesAndPests: [
      {
        id: 'sadabahar-rootrot',
        name: 'Root Rot & Stem Blight (Phytophthora / Pythium)',
        symptomType: 'wilting',
        symptoms:
          'Stems turn dark brown or mushy at the soil line, sudden wilting of branches while soil is still wet, lower leaves turning yellow and dropping.',
        homeRemedy: {
          name: 'Turmeric (Haldi) & Wood Ash Stem Drench with Aeration',
          ingredients: '1 tsp pure turmeric powder + 1 tbsp fine wood ash + 500ml water',
          preparationAndUse:
            'Immediately stop watering and move the pot under rain shelter. Carefully loosen the topsoil with a khurpi to aerate. Drench the base with turmeric solution which possesses strong natural antifungal properties.',
          frequency: 'Apply once, then withhold water until soil is dry',
        },
        conventionalTreatment:
          'Drench root zone with Trichoderma viride bio-fungicide (5g/L) or Carbendazim (Bavistin) at 2g per liter.',
      },
      {
        id: 'sadabahar-aphids',
        name: 'Aphids & Mealybugs on Tender Tips',
        symptomType: 'pests_visible',
        symptoms:
          'Clusters of tiny green/black aphids or cottony white mealybugs clustered around flower buds and tender branch tips.',
        homeRemedy: {
          name: 'Cold-Pressed Neem Oil & Mild Soap Spray',
          ingredients: '5ml pure organic neem oil + 3 drops mild liquid soap + 1L lukewarm water',
          preparationAndUse:
            'Shake vigorously to emulsify the neem oil. Spray generously on the underside of leaves and around flower buds during evening hours when bees are inactive.',
          frequency: 'Spray once every 4 to 5 days for 2-3 applications',
        },
        conventionalTreatment:
          'Spray Acetamiprid 20% SP (0.5g/L) or Imidacloprid (0.5ml/L) for severe infestations.',
      },
      {
        id: 'sadabahar-yellowing',
        name: 'Leaf Yellowing / Iron Chlorosis',
        symptomType: 'yellowing',
        symptoms:
          'Young leaves turning pale yellow or whitish while veins remain faintly green, often triggered by compact soil or overwatering.',
        homeRemedy: {
          name: 'Fermented Mustard Cake Liquid & Epsom Salt Drench',
          ingredients: '1 tsp Epsom salt (Sendha Namak / Magnesium sulfate) + 1 tbsp vermicompost tea + 1L water',
          preparationAndUse:
            'Ensure drainage holes are unclogged. Water the plant with the magnesium-rich solution early in the morning to restore chlorophyll synthesis.',
          frequency: 'Apply once every 3 weeks until green color restores',
        },
        conventionalTreatment:
          'Foliar spray with Chelated Micronutrient fertilizer (Fe-EDTA 1g/L).',
      },
    ],
    notes:
      'True to its name "Sada-Bahar" (Perpetual Spring), this resilient plant flowers 365 days a year on Indian terraces! Revered in Ayurvedic medicine for blood glucose regulation (Catharanthus roseus is the natural source of vincristine and vinblastine). Requires virtually zero maintenance once established.',
  },
];

export const INITIAL_PLANTS: Plant[] = RAW_INITIAL_PLANTS.map((plant) => ({
  ...plant,
  imageUrl: VERIFIED_PLANT_IMAGES[plant.id]?.imageUrl,
}));

