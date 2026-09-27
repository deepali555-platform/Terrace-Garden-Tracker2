import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Increase payload limit for image data URLs
app.use(express.json({ limit: '25mb' }));

// Serve static assets from public folder
app.use(express.static(path.resolve(__dirname, 'public')));

// Initialize Google GenAI with recommended server-side settings
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Endpoint: POST /api/scan-plant
 * Multimodal image analysis for plant health, nutrient deficiencies,
 * pest/disease matching, and Indian home kitchen remedies.
 */
app.post('/api/scan-plant', async (req, res) => {
  try {
    const { imageBase64, plantName, botanicalName, category, knownDiseases } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required for plant health scan.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check your AI Studio Secrets panel.',
      });
    }

    // Extract clean base64 data and mime type
    const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    let mimeType = 'image/jpeg';
    let cleanBase64 = imageBase64;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      cleanBase64 = matches[2];
    }

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType,
      },
    };

    const promptText = `You are a master botanist and plant pathologist specializing in Indian terrace and balcony gardening (warm/tropical climates, pot/container culture, intense summer sun, monsoon humidity, potting mixes with vermicompost, cow dung, neem khali).

Analyze this photo of a plant identified by the gardener as:
- Plant Name: ${plantName || 'Terrace Garden Plant'}
- Botanical Name: ${botanicalName || 'Not specified'}
- Category: ${category || 'Balcony Plant'}

Common diseases and pests previously known for this species:
${JSON.stringify(knownDiseases || [], null, 2)}

Provide a strict, professional visual evaluation:
1. "healthStatus": Must be EXACTLY one of: "Healthy", "Needs Attention", or "Sick".
2. "summary": 1 to 2 clear sentences describing the leaf color, texture, stem turgor, and overall vigor observed in the photo.
3. "nutrientDeficiencies":
   - "detected": boolean (true if visible signs like lower leaf chlorosis, interveinal yellowing, purple leaf undersides, crispy brown leaf margins, pale new growth).
   - "deficiency": string describing suspected deficient nutrient (e.g., "Nitrogen deficiency (lower leaf yellowing)", "Iron chlorosis", "Magnesium deficiency", "Potassium deficiency (leaf tip scorch)"). If none, state "No obvious nutrient deficiency detected".
   - "suggestedFeed": string naming the organic or Indian kitchen amendment best suited (e.g., "Vermicompost top dressing + Mustard cake (Sarson khali) liquid tea", "Epsom salt (Magnesium sulfate) foliage mist", "Steamed bone meal or wood ash", "Diluted seaweed extract").
   - "details": 1 sentence explaining why this feed restores health in terrace containers.
4. "pestOrDisease":
   - "detected": boolean (true if visible spots, powder, insects, webbing, wilting, curling, holes, sooty mold).
   - "matchedDiseaseName": name of the pest or disease, matching one of the known diseases above if it fits, or name the specific issue.
   - "symptomsObserved": brief summary of visual signs on the leaves or stems.
   - "details": 1 sentence explaining the issue.
5. "recommendedRemedies":
   - "homeRemedyName": name of the traditional Indian home/kitchen remedy (e.g., "Cold-pressed Neem Oil & Gentle Soap Spray", "3-Day Sour Buttermilk (Khatta Chhaas) & Turmeric Mist", "Garlic & Green Chili Decoction", "Wood Ash (Lakdi ki Raakh) Soil Collar", "Baking Soda Solution", "Cinnamon Powder dusting").
   - "homeRemedyIngredients": specific ingredients and Indian kitchen proportions (e.g., "5ml pure neem oil + 3 drops dish soap in 1L lukewarm water").
   - "homeRemedyInstructions": preparation and application instructions (how to spray, time of day like sunset to prevent sun scorch, frequency).
   - "conventionalOption": a conventional nursery alternative (e.g., "Saaf fungicide (Carbendazim + Mancozeb)", "Neem EC 1500ppm", "Imidacloprid 17.8 SL").
6. "confidenceOrCaveat": 1 brief sentence noting that visual assessment from photos has limits (lighting, shadows, camera focus) and to feel the soil and check leaf undersides.`;

    const scanParams = {
      contents: {
        parts: [imagePart, { text: promptText }],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthStatus: {
              type: Type.STRING,
              description: "Must be 'Healthy', 'Needs Attention', or 'Sick'",
            },
            summary: {
              type: Type.STRING,
              description: "Concise summary of the visual diagnosis",
            },
            nutrientDeficiencies: {
              type: Type.OBJECT,
              properties: {
                detected: { type: Type.BOOLEAN },
                deficiency: { type: Type.STRING },
                suggestedFeed: { type: Type.STRING },
                details: { type: Type.STRING },
              },
              required: ['detected', 'suggestedFeed', 'details'],
            },
            pestOrDisease: {
              type: Type.OBJECT,
              properties: {
                detected: { type: Type.BOOLEAN },
                matchedDiseaseName: { type: Type.STRING },
                symptomsObserved: { type: Type.STRING },
                details: { type: Type.STRING },
              },
              required: ['detected', 'symptomsObserved', 'details'],
            },
            recommendedRemedies: {
              type: Type.OBJECT,
              properties: {
                homeRemedyName: { type: Type.STRING },
                homeRemedyIngredients: { type: Type.STRING },
                homeRemedyInstructions: { type: Type.STRING },
                conventionalOption: { type: Type.STRING },
              },
              required: ['homeRemedyName', 'homeRemedyIngredients', 'homeRemedyInstructions'],
            },
            confidenceOrCaveat: {
              type: Type.STRING,
              description: 'AI visual caveat disclaimer',
            },
          },
          required: [
            'healthStatus',
            'summary',
            'nutrientDeficiencies',
            'pestOrDisease',
            'recommendedRemedies',
          ],
        },
      },
    };

    const isQuotaCooling = Date.now() < flashQuotaExhaustedUntil;
    const modelsToTry = isQuotaCooling
      ? ['gemini-3.1-flash-lite', 'gemini-3.8-flash']
      : ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

    let response;
    let lastError: any;
    for (const modelName of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          ...scanParams,
          model: modelName,
        });
        break;
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || err);
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
          console.warn(`Plant scan model ${modelName} quota reached, falling back...`);
          if (modelName === 'gemini-3.8-flash') {
            flashQuotaExhaustedUntil = Date.now() + 10 * 60 * 1000;
          }
          continue;
        }
        throw err;
      }
    }

    if (!response) {
      throw lastError || new Error('Failed to generate plant analysis');
    }

    const responseText = response.text?.trim();
    if (!responseText) {
      throw new Error('Gemini model returned empty response');
    }

    const diagnosisResult = JSON.parse(responseText);
    return res.json(diagnosisResult);
  } catch (error: unknown) {
    console.error('Error during plant health scan:', error);
    const message = error instanceof Error ? error.message : 'Unknown scan error';
    return res.status(500).json({
      error: 'Failed to analyze plant photo. ' + message,
    });
  }
});

interface VerifiedCommonsImage {
  imageUrl: string;
  imageTitle: string;
  source: string;
}

// Track quota limits to route smoothly without latency
let flashQuotaExhaustedUntil = 0;

/**
 * Helper: Search Wikimedia Commons for an authentic, verified botanical photo thumbnail
 * Strictly verifies the candidate against botanical genus and species to prevent mismatches.
 */
function searchWikimediaThumbnail(
  botanicalSpecies: string,
  commonName?: string
): Promise<VerifiedCommonsImage | undefined> {
  const fetchPromise = new Promise<VerifiedCommonsImage | undefined>((resolve) => {
    if (!botanicalSpecies || !botanicalSpecies.trim()) {
      return resolve(undefined);
    }

    // Clean binomial (Genus species)
    const cleanParts = botanicalSpecies
      .trim()
      .replace(/[^a-zA-Z\s-]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    if (cleanParts.length === 0) {
      return resolve(undefined);
    }

    const genus = cleanParts[0].toLowerCase();
    const species = cleanParts.length > 1 ? cleanParts[1].toLowerCase() : '';
    const cleanSearch = cleanParts.slice(0, 2).join(' ');

    const url =
      'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
      encodeURIComponent(cleanSearch) +
      '&gsrnamespace=6&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=960&format=json';

    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'TerraceGardenApp/1.0 (verified-botany@terracegarden.app)',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            const pages = json.query && json.query.pages ? Object.values(json.query.pages) : [];

            // Disallow non-living, anatomical, or diagrammatic images
            const disallowedKeywords = [
              'map',
              'diagram',
              'distribution',
              'herbarium',
              'specimen',
              'sheet',
              'drawing',
              'illustration',
              'icon',
              'logo',
              'stamp',
              'flag',
              'range',
              'leaf_anatomy',
              'fossil',
              'microscopy',
              'chart',
              'petal',
              'pollen',
              'stamen',
              'ovary',
              'micrograph',
              'trichome',
              'chromosome',
            ];

            const candidates: Array<{
              thumbUrl: string;
              title: string;
              score: number;
            }> = [];

            for (const p of pages as any[]) {
              const title = (p.title || '').toLowerCase();
              const ext = title.split('.').pop();
              if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) continue;

              // Skip disallowed non-plant-photo types
              if (disallowedKeywords.some((kw) => title.includes(kw))) continue;

              const info = p.imageinfo && p.imageinfo[0];
              if (!info || !info.thumburl) continue;

              const desc = (info.extmetadata?.ImageDescription?.value || '').toLowerCase();
              const objName = (info.extmetadata?.ObjectName?.value || '').toLowerCase();
              const fullContext = `${title} ${desc} ${objName}`;

              // Verification requirement: Genus must match, and if species exists, species must match
              const genusMatch = fullContext.includes(genus);
              const speciesMatch = species ? fullContext.includes(species) : true;

              if (genusMatch && speciesMatch) {
                let score = 0;
                // Higher score if file title explicitly contains the botanical genus & species
                if (title.includes(genus)) score += 10;
                if (species && title.includes(species)) score += 20;
                if (
                  title.includes('flower') ||
                  title.includes('blossom') ||
                  title.includes('plant') ||
                  title.includes('tree') ||
                  title.includes('fruit') ||
                  title.includes('shrub')
                ) {
                  score += 5;
                }

                // If common name provided, bonus score if mentioned
                if (commonName) {
                  const commonClean = commonName.toLowerCase().replace(/[^a-z0-9]/g, '');
                  if (commonClean.length > 3 && fullContext.includes(commonClean)) {
                    score += 5;
                  }
                }

                candidates.push({
                  thumbUrl: info.thumburl,
                  title: (p.title || '').replace(/^File:/, ''),
                  score,
                });
              }
            }

            if (candidates.length > 0) {
              candidates.sort((a, b) => b.score - a.score);
              const best = candidates[0];
              return resolve({
                imageUrl: best.thumbUrl,
                imageTitle: best.title,
                source: 'Wikimedia Commons',
              });
            }

            resolve(undefined);
          } catch {
            resolve(undefined);
          }
        });
      }
    );

    req.on('error', () => resolve(undefined));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(undefined);
    });
  });

  const timerPromise = new Promise<undefined>((resolve) =>
    setTimeout(() => resolve(undefined), 3200)
  );

  return Promise.race([fetchPromise, timerPromise]);
}

/**
 * Endpoint: POST /api/autofill-plant
 * Uses Gemini (gemini-3.8-flash) to identify regional Indian / English / botanical
 * plant names, check for ambiguity, and generate all 12 container care specs
 * and kitchen remedies.
 */
app.post('/api/autofill-plant', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Please enter a plant name to auto-fill.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check your AI Studio Secrets panel.',
      });
    }

    const promptText = `You are a master botanist and horticulturist specializing in Indian home, terrace, and balcony gardening.
You have comprehensive knowledge of Indian regional and vernacular plant names in Hindi, Marathi, Bengali, Tamil, Telugu, Malayalam, Gujarati, etc. (such as Mogra, Gudhal, Champa, Tulsi, Parijat/Harshringar, Aparajita, Ghritkumari, Kadi Patta, Sadafuli/Sadabahar, Raat ki Rani, Chameli, Juhi, Madhumalti, Palak, Methi, Bhindi, Karela, Lauki, Mirchi, Tamatar, Dhaniya, Pothos/Money Plant, Sansevieria/Snake Plant, etc.) as well as English common names and botanical/scientific binomial nomenclature.

The user has typed the following plant name or query into the "Add Plant" form: "${query.trim()}".

Evaluate the user's input:

1. AMBIGUOUS CHECK:
Is the name ambiguous or could it easily refer to multiple distinct garden plants?
Examples:
- "Rose" -> Could be Desi Rose (Rosa damascena / Rosa indica) vs Desert Rose (Adenium obesum) vs Rose Apple (Syzygium jambos).
- "Champa" -> Could be Plumeria / Frangipani (Safed Champa / Plumeria alba) vs Magnolia champaca (Swarna Champa) vs Artabotrys hexapetalus (Hari Champa).
- "Jasmine" -> Could be Mogra (Jasminum sambac) vs Chameli (Jasminum grandiflorum) vs Juhi (Jasminum auriculatum).
- "Lily" -> Could be Peace Lily (Spathiphyllum) vs Rain Lily (Zephyranthes) vs Spider Lily (Hymenocallis).
- "Apple" -> Could be Rose Apple vs Custard Apple (Sitaphal) vs Wood Apple (Bael).
If the name is ambiguous:
- Set "status" to "ambiguous".
- Provide a polite, direct "clarificationQuestion" (e.g. "Did you mean Desi Rose (Damask Rose), Desert Rose (Adenium), or Rose Apple?").
- Provide 2 to 4 distinct "suggestions", each containing:
  - "name": display title of the plant
  - "botanicalName": botanical binomial
  - "hint": a short explanatory phrase (e.g. "Fragrant shrub with layered pink petals", "Succulent with swollen caudex and bell blooms").

2. UNRECOGNIZED CHECK:
Is the query unrecognizable as a plant, nonsensical, gibberish, an inanimate object (e.g. "car", "phone"), or a non-plant term?
If so:
- Set "status" to "unrecognized".
- Provide a helpful "message" explaining that no garden plant could be identified for "${query.trim()}", and encourage trying another regional or botanical name (e.g., Mogra, Gudhal, Champa, Tulsi) or filling out the fields manually.

3. CONFIDENT IDENTIFICATION:
If the plant is clearly identified (or if the user specified a specific plant like "Mogra", "Gudhal", "Hibiscus", "Curry Leaf", "Snake plant", "Safed Champa", "Desi Gulab", "Rosa damascena", etc.):
- Set "status" to "success".
- Set "identificationConfidence" to "high".
- Generate comprehensive, realistic, practical values for container terrace and balcony gardening in Indian climates across all 12 key fields in "plantData":
  - "name": Standard display title with common English/Indian name (e.g., "Mogra (Arabian Jasmine)").
  - "botanicalName": Latin binomial (e.g., "Jasminum sambac").
  - "hindiName": Vernacular Devanagari script name (e.g., "मोगरा / बेला").
  - "category": MUST be one of EXACTLY: "Flowering", "Foliage", "Vegetable", "Herb", "Succulent", "Fruit".
  - "waterRequirement":
    - "level": MUST be one of EXACTLY: "Low", "Moderate", "High".
    - "frequency": Realistic container frequency (e.g., "Daily in summer; alternate days in winter").
    - "seasonalNote": Crucial terrace advice for Indian hot summers and monsoon rains.
  - "sunlightRequirement":
    - "type": MUST be one of EXACTLY: "Full Sun", "Partial Shade", "Bright Indirect", "Low Light".
    - "hoursNeeded": Daily hours (e.g., "5 to 6 hours direct sunlight").
    - "summerTerraceNote": Protection or terrace placement during intense 42°C+ summer heat.
  - "fertilizerRequirement":
    - "type": Top feeds (e.g., "Vermicompost, Mustard cake (Sarson khali) liquid tea, or Cow Dung Manure").
    - "npkOrOrganic": Formulation or organic composition.
    - "frequency": Application cycle (e.g., "Every 20 to 25 days during active growth").
  - "sowingTime":
    - "months": Array of month numbers from 1 to 12 (1=Jan, 2=Feb, ..., 12=Dec).
    - "seasonText": Descriptive season (e.g., "Monsoon (June–August) or Spring (Feb–March)").
    - "method": Propagation method (seeds, stem cuttings, layering, division).
  - "pruningTime":
    - "months": Array of month numbers (1 to 12).
    - "seasonText": Pruning window description.
    - "frequency": Pruning cycle.
    - "tips": Practical technique (e.g., angle, deadheading, pinch tips).
  - "repottingTime":
    - "months": Array of month numbers (1 to 12).
    - "seasonText": Best repotting months.
    - "frequency": (e.g., "Once every 1.5 to 2 years").
    - "signs": Array of 3 string symptoms indicating root-bound containers.
  - "potSizeRequired":
    - "sizeInches": Recommended container diameter (e.g., "12 to 14 inches").
    - "volumeLiters": Approximate volume (e.g., "15–20 Liters").
    - "materialAdvice": Container material guidance (terracotta clay, grow bag, plastic).
  - "floweringSeason":
    - "isFlowering": boolean (true for flowering shrubs, false for non-flowering foliage).
    - "months": Array of blooming month numbers (1 to 12).
    - "seasonText": Descriptive bloom period.
  - "diseasesAndPests": Array of 2 distinct common pests/diseases for this species in terrace containers. Each must contain:
    - "name": Specific pest or disease name (e.g., "Aphids & Mealybugs").
    - "symptomType": MUST be one of: "pests_visible", "yellowing", "curling", "powdery_coating", "spots", "holes", "wilting", "bud_drop".
    - "symptoms": 1-2 sentences of visual cues.
    - "homeRemedy":
      - "name": Traditional Indian kitchen remedy (e.g., "Cold-pressed Neem Oil & Mild Liquid Soap Spray", "3-Day Sour Buttermilk (Khatta Chhaas) & Turmeric Mist", "Garlic & Green Chili Decoction", "Wood Ash Soil Ring", "Baking Soda Solution").
      - "ingredients": Exact kitchen measurements (e.g., "5ml pure neem oil + 3 drops dish soap in 1L lukewarm water").
      - "preparationAndUse": Instructions on how and when to apply (e.g., spray at sunset).
      - "frequency": Application cadence (e.g., "Once every 4 days for 3 cycles").
    - "conventionalTreatment": A safe, nursery backup chemical/commercial alternative (e.g., "Saaf fungicide (Carbendazim 12% + Mancozeb 63% WP)", "Imidacloprid 17.8 SL").
  - "notes": 1-2 sentences highlighting sacred, medicinal, culinary, or terrace garden tips.`;

    const generateParams = {
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              description: "Must be 'success', 'ambiguous', or 'unrecognized'",
            },
            clarificationQuestion: {
              type: Type.STRING,
              description: 'When ambiguous, specific question asking user to clarify',
            },
            suggestions: {
              type: Type.ARRAY,
              description: 'When ambiguous, 2 to 4 plant choices',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  botanicalName: { type: Type.STRING },
                  hint: { type: Type.STRING },
                },
                required: ['name', 'botanicalName', 'hint'],
              },
            },
            message: {
              type: Type.STRING,
              description: 'When unrecognized, explanation to the user',
            },
            plantData: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                botanicalName: { type: Type.STRING },
                hindiName: { type: Type.STRING },
                category: { type: Type.STRING },
                waterRequirement: {
                  type: Type.OBJECT,
                  properties: {
                    level: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    seasonalNote: { type: Type.STRING },
                  },
                  required: ['level', 'frequency', 'seasonalNote'],
                },
                sunlightRequirement: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    hoursNeeded: { type: Type.STRING },
                    summerTerraceNote: { type: Type.STRING },
                  },
                  required: ['type', 'hoursNeeded', 'summerTerraceNote'],
                },
                fertilizerRequirement: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    npkOrOrganic: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                  },
                  required: ['type', 'npkOrOrganic', 'frequency'],
                },
                sowingTime: {
                  type: Type.OBJECT,
                  properties: {
                    months: {
                      type: Type.ARRAY,
                      items: { type: Type.INTEGER },
                    },
                    seasonText: { type: Type.STRING },
                    method: { type: Type.STRING },
                  },
                  required: ['months', 'seasonText', 'method'],
                },
                pruningTime: {
                  type: Type.OBJECT,
                  properties: {
                    months: {
                      type: Type.ARRAY,
                      items: { type: Type.INTEGER },
                    },
                    seasonText: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    tips: { type: Type.STRING },
                  },
                  required: ['months', 'seasonText', 'frequency', 'tips'],
                },
                repottingTime: {
                  type: Type.OBJECT,
                  properties: {
                    months: {
                      type: Type.ARRAY,
                      items: { type: Type.INTEGER },
                    },
                    seasonText: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    signs: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['months', 'seasonText', 'frequency', 'signs'],
                },
                potSizeRequired: {
                  type: Type.OBJECT,
                  properties: {
                    sizeInches: { type: Type.STRING },
                    volumeLiters: { type: Type.STRING },
                    materialAdvice: { type: Type.STRING },
                  },
                  required: ['sizeInches', 'volumeLiters', 'materialAdvice'],
                },
                floweringSeason: {
                  type: Type.OBJECT,
                  properties: {
                    isFlowering: { type: Type.BOOLEAN },
                    months: {
                      type: Type.ARRAY,
                      items: { type: Type.INTEGER },
                    },
                    seasonText: { type: Type.STRING },
                  },
                  required: ['isFlowering', 'months', 'seasonText'],
                },
                diseasesAndPests: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      symptomType: { type: Type.STRING },
                      symptoms: { type: Type.STRING },
                      homeRemedy: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          ingredients: { type: Type.STRING },
                          preparationAndUse: { type: Type.STRING },
                          frequency: { type: Type.STRING },
                        },
                        required: ['name', 'ingredients', 'preparationAndUse', 'frequency'],
                      },
                      conventionalTreatment: { type: Type.STRING },
                    },
                    required: ['name', 'symptomType', 'symptoms', 'homeRemedy', 'conventionalTreatment'],
                  },
                },
                notes: { type: Type.STRING },
              },
              required: [
                'name',
                'botanicalName',
                'hindiName',
                'category',
                'waterRequirement',
                'sunlightRequirement',
                'fertilizerRequirement',
                'sowingTime',
                'pruningTime',
                'repottingTime',
                'potSizeRequired',
                'floweringSeason',
                'diseasesAndPests',
              ],
            },
          },
          required: ['status'],
        },
      },
    };

    // Helper for transient API retry and quota fallback
    const generateWithRetry = async () => {
      let lastErr: any;
      const isQuotaCooling = Date.now() < flashQuotaExhaustedUntil;
      const modelsToTry = isQuotaCooling
        ? ['gemini-3.1-flash-lite', 'gemini-3.8-flash']
        : ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

      for (const modelName of modelsToTry) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            return await ai.models.generateContent({
              ...generateParams,
              model: modelName,
            });
          } catch (err: any) {
            lastErr = err;
            const msg = String(err?.message || err);
            if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
              console.warn(`Model ${modelName} quota exceeded, switching to fallback model...`);
              if (modelName === 'gemini-3.8-flash') {
                flashQuotaExhaustedUntil = Date.now() + 10 * 60 * 1000;
              }
              break; // switch to fallback model
            }
            if (attempt === 0 && (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('demand'))) {
              await new Promise((r) => setTimeout(r, 1000));
              continue;
            }
            break;
          }
        }
      }
      throw lastErr;
    };

    const response = await generateWithRetry();

    const responseText = response.text?.trim();
    if (!responseText) {
      throw new Error('Gemini model returned empty response for plant autofill');
    }

    const autofillResult = JSON.parse(responseText);

    // If successfully identified and has botanical name, search Wikimedia Commons with strict botanical verification
    if (autofillResult.status === 'success' && autofillResult.plantData?.botanicalName) {
      try {
        const verifiedImage = await searchWikimediaThumbnail(
          autofillResult.plantData.botanicalName,
          autofillResult.plantData.name
        );
        if (verifiedImage) {
          autofillResult.plantData.imageUrl = verifiedImage.imageUrl;
          autofillResult.plantData.imageTitle = verifiedImage.imageTitle;
          autofillResult.imageMatched = true;
          autofillResult.imageTitle = verifiedImage.imageTitle;
        } else {
          autofillResult.imageMatched = false;
          autofillResult.imageNote =
            'No verified image found on Wikimedia Commons matching this botanical species. Please upload your own photo.';
        }
      } catch (err) {
        console.warn('Could not fetch Wikimedia thumbnail for autofilled plant:', err);
        autofillResult.imageMatched = false;
      }
    }

    return res.json(autofillResult);
  } catch (error: unknown) {
    console.error('Error during plant autofill:', error);
    const message = error instanceof Error ? error.message : 'Unknown autofill error';
    return res.status(500).json({
      error: 'Failed to auto-fill plant details. ' + message,
    });
  }
});

// Vite middleware for dev or static serving for prod
if (!process.env.VERCEL) {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Terrace Garden Tracker server listening on http://0.0.0.0:${PORT}`);
  });
}

export default app;
