import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-3.1-flash-lite';

function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please check your key in Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const BRAND_CONTEXT = `
You are an elite luxury cosmetics Art Director and Commercial Advertising Prompt Engineer specializing in high-converting Facebook Ads for Cambodian luxury beauty brand "Sស្នេហ៍h" (Sneh Perfume Lotion).

Exact physical packaging reference for Sneh Perfume Lotion:
1. "ROSY VIOLET" Perfume Lotion: Matte soft blush-pink squeeze tube (150ml sleek cosmetic tube) with delicate dark rose-burgundy botanical floral line-art illustrations wrapping the lower and upper edges, centered pink-and-periwinkle calligraphic Khmer-English logo "Sស្នេហ៍h" above italic script "Perfume Lotion" and subtitle "ROSY VIOLET", matching matte pastel pink flip-top cap.
2. "BLACK VANILLA" Perfume Lotion: Sleek pearl-white glossy-matte squeeze tube featuring dreamy lavender, indigo-violet, and ice-blue watercolor marble strata sweeping diagonally across the lower half with fine liquid gold metallic veins, centered blue-gradient "Sស្នេហ៍h" logo and "Perfume Lotion / BLACK VANILLA", matching matte powder-blue flip-top cap.
3. "DUO SET": Both Rosy Violet and Black Vanilla tubes staged together in balanced editorial harmony.

Key Commercial Ad Standards:
- Prompts MUST be written in rich, vivid, studio-grade English tailored to the requested image generation engine (Midjourney v6.1, Flux Pro, Gemini Image / Nano Banana, Ideogram 2.0, or DALL-E / ChatGPT).
- Specify exact camera optics (e.g. Hasselblad H6D-100c, 80mm macro f/2.8, Phase One IQ4), studio lighting modifiers (softbox diffusion, window gobo leaf shadows, caustic crystal reflections, specular highlights), tactile surfaces (travertine, whipped lotion swirls, frosted quartz, raw silk, water ripples), and composition safe-zones for Facebook mobile feed thumb-stopping impact.
- Never produce generic clichés or repeat previously generated scene ideas. Every output must feel like a fresh, magazine-worthy campaign from Paris/Seoul/Phnom Penh luxury beauty studios.
- Khmer ad copy and headlines must be natural, alluring, emotionally resonant modern Khmer beauty copy (not awkward literal translations).
`;

function parseDataUrl(dataUrl?: string): { mimeType: string; data: string } | null {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

function getEngineDirective(engineId: string, aspectRatio: string): string {
  switch (engineId) {
    case 'midjourney':
      return `Format the masterPrompt for Midjourney v6.1: concise, comma-separated photographic & art-direction descriptors with crisp material textures, ending strictly with "--ar ${aspectRatio} --style raw --s 250 --v 6.1".`;
    case 'flux':
      return `Format the masterPrompt for Flux Pro: rich natural photographic prose describing exact spatial relationships, lens optics, light falloff, and packaging fidelity in ${aspectRatio} vertical/square framing. No Midjourney flags.`;
    case 'gemini-image':
      return `Format the masterPrompt for Gemini Image / Nano Banana: clear, structured studio photography brief with explicit subject placement, packaging color accuracy, lighting direction, and clean negative space composition in ${aspectRatio} aspect ratio. No Midjourney flags.`;
    case 'ideogram':
      return `Format the masterPrompt for Ideogram 2.0: crisp commercial poster composition in ${aspectRatio} aspect ratio with explicit typography layout zone, clean luxury background, and photorealistic product rendering. No Midjourney flags.`;
    case 'dalle':
    default:
      return `Format the masterPrompt for ChatGPT / DALL-E: expressive, detailed commercial advertising art-direction paragraph specifying product tube design, set props, lighting, mood, and ${aspectRatio} framing. No Midjourney flags.`;
  }
}

async function generateWithRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      if (status && status >= 400 && status < 500 && status !== 429) {
        throw err;
      }
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

function formatApiError(err: unknown): { status: number; message: string } {
  const e = err as { status?: number; message?: string };
  const msg = e?.message || 'Unexpected error communicating with Gemini API.';
  if (msg.includes('API_KEY_INVALID') || msg.includes('PERMISSION_DENIED') || e?.status === 403) {
    return {
      status: 403,
      message:
        'Gemini API key is invalid or unauthorized. Please verify your API key in Settings > Secrets.',
    };
  }
  if (msg.includes('RESOURCE_EXHAUSTED') || e?.status === 429) {
    return {
      status: 429,
      message: 'API rate limit reached. Please wait a moment and try again.',
    };
  }
  if (msg.includes('GEMINI_API_KEY is not configured')) {
    return { status: 500, message: msg };
  }
  return { status: e?.status && e.status >= 400 ? e.status : 500, message: msg };
}

/**
 * Keeps mobile Safari & Cloud Run proxies alive during AI calls by flushing headers
 * immediately and emitting RFC-8259-valid leading whitespace every 3 seconds.
 */
async function respondWithJsonKeepalive<T>(
  res: express.Response,
  work: () => Promise<T>
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Accel-Buffering', 'no');
  res.status(200);
  res.flushHeaders();

  const heartbeat = setInterval(() => {
    if (!res.writableEnded) {
      res.write(' ');
    }
  }, 3000);

  try {
    const payload = await work();
    clearInterval(heartbeat);
    if (!res.writableEnded) {
      res.end(JSON.stringify(payload));
    }
  } catch (err) {
    clearInterval(heartbeat);
    const formatted = formatApiError(err);
    if (!res.writableEnded) {
      res.end(JSON.stringify({ error: formatted.message, status: formatted.status }));
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  app.get('/api/health', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true, model: MODEL_NAME });
  });

  app.post('/api/generate-fresh-concepts', async (req, res) => {
    await respondWithJsonKeepalive(res, async () => {
      const {
        variantId = 'duo',
        engineId = 'midjourney',
        aspectRatio = '4:5',
        campaignGoal = 'conversion',
        textPlacement = 'clean-space',
        customBrief = '',
        avoidTitles = [],
        customImageDataUrl,
      } = req.body ?? {};

      const ai = createGeminiClient();
      const engineDirective = getEngineDirective(engineId, aspectRatio);

      const avoidClause =
        Array.isArray(avoidTitles) && avoidTitles.length > 0
          ? `CRITICAL ANTI-REPETITION RULE: Do NOT repeat any of these previously generated concepts or their core set designs: ${avoidTitles
              .slice(-15)
              .join('; ')}. Invent 3 completely NEW, visually distinct luxury concepts.`
          : 'Make all 3 concepts strikingly distinct from one another (e.g. 1 sensory tactile texture, 1 architectural sculptural studio, 1 atmospheric poetic storytelling).';

      const textModeInstruction =
        textPlacement === 'clean-space'
          ? 'Keep the top 30% or side area as clean, uncluttered negative space with soft lighting so the designer can overlay Khmer typography cleanly in Photoshop/Canva; explicitly instruct "no text, clean negative space for ad typography".'
          : textPlacement === 'integrated-khmer'
            ? 'Design the poster layout with an intentional top headline typography zone for luxury editorial ad text and balanced bottom tagline space.'
            : 'Include minimal refined English luxury serif typography ("Perfume Lotion", "Rosy Violet", "Black Vanilla") integrated seamlessly into the editorial composition.';

      const goalDirection =
        campaignGoal === 'avant-garde-viral'
          ? 'ULTRA-BOLD AVANT-GARDE / VIRAL LUXURY DIRECTION (Tamburins Seoul × Dior Paris × Viral FOOH 3D): Push creative ambition to 10/10! Invent breathtaking, jaw-dropping visual spectacles — e.g. giant architectural FOOH city-plaza monuments, liquid chrome & blown Murano glass sculptures, glacial crystal ice monoliths with frozen roses, high-speed 1/8000s molten gold + cream splash collisions, or moonlit obsidian mirror night-perfume installations. Zero boring tabletop shots!'
          : `Campaign Goal: ${campaignGoal}`;

      const userPrompt = `Generate 3 brand-new, ultra-luxurious, scroll-stopping Facebook Ad image generation concepts for Sneh Perfume Lotion.

Parameters:
- Product Focus: ${variantId}
- ${goalDirection}
- Aspect Ratio: ${aspectRatio}
- Text Layout Strategy: ${textModeInstruction}
- Engine Formatting: ${engineDirective}
- Extra Creative Brief from User: ${customBrief || 'Surprise me with ultra-cool, jaw-dropping 2026 luxury fragrance & skincare campaign art direction that stops thumbs instantly on Facebook Cambodia.'}
${avoidClause}

For each of the 3 concepts return:
- titleKm: Catchy luxury concept title in Khmer
- titleEn: Editorial concept title in English (3-5 words)
- visualDirectionKm: 2-sentence explanation in natural Khmer describing why this visual stops thumbs and sells the scent/moisture story
- visualDirectionEn: 1-2 sentence English art-direction summary
- masterPrompt: Complete, high-craft English prompt ready to paste directly into the chosen AI image generator
- negativePrompt: Curated negative prompt preventing plastic glare, warped tubes, deformed hands, or messy typography
- khmerHeadline: Short punchy Khmer ad headline (4-9 words) to put on the ad creative
- subHeadline: Short refined English or Khmer sub-headline (2-5 words)
- fbPrimaryCopyKm: Engaging, ready-to-post Facebook Ad caption in Khmer (2-3 short lines with tasteful line breaks, persuasive & elegant, no excessive emoji spam)
- fbCtaKm: Short Khmer call-to-action button label (e.g. "ឆាតសួរព័ត៌មាន", "កម្ម៉ង់ឥឡូវនេះ")
- cameraSpec: Short camera/lens spec (e.g. "Hasselblad 80mm f/2.8 · Top-down")
- lightingSpec: Short lighting setup (e.g. "Soft sunlit window gobo · Rim glow")
- palette: Array of exactly 3 hex colors harmonizing with the scene and tubes (e.g. ["#F6E6EC", "#9E3B5B", "#4A5D8F"])`;

      const parsedImage = parseDataUrl(customImageDataUrl);
      const contents = parsedImage
        ? {
            parts: [
              {
                inlineData: {
                  mimeType: parsedImage.mimeType,
                  data: parsedImage.data,
                },
              },
              {
                text: `The user uploaded this exact product image. Inspect its bottle/tube shape, colors, label style, and mood accurately, and weave those exact packaging details into all 3 prompts.\n\n${userPrompt}`,
              },
            ],
          }
        : userPrompt;

      const response = await generateWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents,
          config: {
            systemInstruction: BRAND_CONTEXT,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                concepts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      titleKm: { type: Type.STRING },
                      titleEn: { type: Type.STRING },
                      visualDirectionKm: { type: Type.STRING },
                      visualDirectionEn: { type: Type.STRING },
                      masterPrompt: { type: Type.STRING },
                      negativePrompt: { type: Type.STRING },
                      khmerHeadline: { type: Type.STRING },
                      subHeadline: { type: Type.STRING },
                      fbPrimaryCopyKm: { type: Type.STRING },
                      fbCtaKm: { type: Type.STRING },
                      cameraSpec: { type: Type.STRING },
                      lightingSpec: { type: Type.STRING },
                      palette: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: [
                      'titleKm',
                      'titleEn',
                      'visualDirectionKm',
                      'visualDirectionEn',
                      'masterPrompt',
                      'negativePrompt',
                      'khmerHeadline',
                      'subHeadline',
                      'fbPrimaryCopyKm',
                      'fbCtaKm',
                      'cameraSpec',
                      'lightingSpec',
                      'palette',
                    ],
                  },
                },
              },
              required: ['concepts'],
            },
          },
        })
      );

      const rawText = (response.text ?? '{}')
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      const parsed = JSON.parse(rawText);
      const concepts = Array.isArray(parsed?.concepts) ? parsed.concepts : [];

      return {
        concepts: concepts.map((item: Record<string, unknown>, idx: number) => {
          const paletteArr = Array.isArray(item.palette) ? item.palette.slice(0, 3) : [];
          while (paletteArr.length < 3) paletteArr.push('#FAF9F7');
          return {
            ...item,
            id: `fresh-${Date.now()}-${idx}`,
            palette: paletteArr,
            engineId,
            aspectRatio,
            variantId,
            createdAt: new Date().toISOString(),
            source: 'ai-fresh',
          };
        }),
      };
    });
  });

  app.post('/api/remix-prompt', async (req, res) => {
    const {
      config,
      basePrompt,
      previousRemixTitles = [],
    } = req.body ?? {};

    if (!config || !basePrompt) {
      res.status(400).json({ error: 'Missing studio configuration or base prompt.' });
      return;
    }

    await respondWithJsonKeepalive(res, async () => {
      const ai = createGeminiClient();
      const engineDirective = getEngineDirective(config.engineId, config.aspectRatio);

      const userPrompt = `Elevate and remix this Facebook Ad prompt blueprint into a breathtaking, fresh, studio-grade luxury editorial concept for Sneh Perfume Lotion.

Current Blueprint Draft:
${basePrompt}

Selected Controls:
- Product Variant: ${config.variantId}
- Aspect Ratio: ${config.aspectRatio}
- Desired Khmer Headline: ${config.khmerHeadline || 'None specified'}
- Sub-headline: ${config.subHeadline || 'None specified'}
- Text Mode: ${config.textPlacement}
- Extra User Direction: ${config.customNote || 'Make it look like a high-fashion luxury fragrance house campaign.'}
- Engine Formatting: ${engineDirective}
${
  Array.isArray(previousRemixTitles) && previousRemixTitles.length > 0
    ? `- Avoid repeating these previous angles: ${previousRemixTitles.slice(-8).join('; ')}`
    : ''
}

Upgrade the lighting physics, tactile micro-textures, lens depth, prop choreography, and color harmony so it feels genuinely fresh and museum-grade commercial photography. Also craft a persuasive Khmer Facebook Ad caption and 1 fresh Khmer headline option.`;

      const parsedImage = parseDataUrl(config.customImageDataUrl);
      const contents = parsedImage
        ? {
            parts: [
              {
                inlineData: {
                  mimeType: parsedImage.mimeType,
                  data: parsedImage.data,
                },
              },
              {
                text: `Analyze this uploaded product photo carefully (packaging silhouette, colors, cap, graphics) and incorporate its exact visual identity into the remixed prompt.\n\n${userPrompt}`,
              },
            ],
          }
        : userPrompt;

      const response = await generateWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents,
          config: {
            systemInstruction: BRAND_CONTEXT,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                titleKm: { type: Type.STRING },
                titleEn: { type: Type.STRING },
                visualDirectionKm: { type: Type.STRING },
                visualDirectionEn: { type: Type.STRING },
                masterPrompt: { type: Type.STRING },
                negativePrompt: { type: Type.STRING },
                khmerHeadline: { type: Type.STRING },
                subHeadline: { type: Type.STRING },
                fbPrimaryCopyKm: { type: Type.STRING },
                fbCtaKm: { type: Type.STRING },
                cameraSpec: { type: Type.STRING },
                lightingSpec: { type: Type.STRING },
                palette: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'titleKm',
                'titleEn',
                'visualDirectionKm',
                'visualDirectionEn',
                'masterPrompt',
                'negativePrompt',
                'khmerHeadline',
                'subHeadline',
                'fbPrimaryCopyKm',
                'fbCtaKm',
                'cameraSpec',
                'lightingSpec',
                'palette',
              ],
            },
          },
        })
      );

      const rawText = (response.text ?? '{}')
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      const item = JSON.parse(rawText);
      const paletteArr = Array.isArray(item.palette) ? item.palette.slice(0, 3) : [];
      while (paletteArr.length < 3) paletteArr.push('#FAF9F7');

      return {
        concept: {
          ...item,
          id: `remix-${Date.now()}`,
          palette: paletteArr,
          engineId: config.engineId,
          aspectRatio: config.aspectRatio,
          variantId: config.variantId,
          createdAt: new Date().toISOString(),
          source: 'ai-remix',
        },
      };
    });
  });

  app.post('/api/auto-design-from-photo', async (req, res) => {
    const {
      imageDataUrl,
      engineId = 'midjourney',
      aspectRatio = '4:5',
      avoidTitles = [],
    } = req.body ?? {};

    const parsedImage = parseDataUrl(imageDataUrl);
    if (!parsedImage) {
      res.status(400).json({ error: 'Please upload a valid product image.' });
      return;
    }

    await respondWithJsonKeepalive(res, async () => {
      const ai = createGeminiClient();
      const engineDirective = getEngineDirective(engineId, aspectRatio);
      const avoidClause =
        Array.isArray(avoidTitles) && avoidTitles.length > 0
          ? `Do NOT repeat these previous concept titles/scenes: ${avoidTitles.slice(-15).join('; ')}. Invent 3 brand-new visual worlds.`
          : '';

      const designerPrompt = `Look closely at this uploaded product photograph. Act as a Senior Luxury Commercial Ad Designer & Art Director for high-converting Facebook Ads in Cambodia.

Step 1 (Visual Inspection): Accurately identify the exact product type, bottle/tube silhouette, material finish, cap, colors, label graphics, and luxury positioning directly from the image.
Step 2 (Auto-Design 3 Distinct Commercial Luxury Ad Concepts): Do not make the user configure anything — YOU decide the most prestigious, market-ready, eye-catching art direction for this exact product:
  - Concept 1: "Commercial Best-Seller Luxury Hero" (high-converting studio showcase with tactile texture/ingredients, crystal-clear product readability, clean upper negative space for Khmer headline)
  - Concept 2: "Avant-Garde Viral Scroll-Stopper" (bold Dior / Tamburins Seoul / sculptural 3D luxury spectacle that stops thumbs in 1 second on Facebook mobile feed)
  - Concept 3: "Sensory Allure & Emotional Prestige" (romantic lighting, skin/hand elegance or atmospheric luxury storytelling that elevates brand desire)

Requirements:
- Every masterPrompt must faithfully preserve the EXACT product packaging seen in the uploaded photo (its true colors, silhouette, cap, and label design).
- ${engineDirective}
- Aspect Ratio: ${aspectRatio}
- Keep clean uncluttered negative space in the upper third so Khmer Facebook Ad typography can sit cleanly, or harmonize seamlessly.
- ${avoidClause}

Return structured JSON with:
- productInsightKm: 1 concise, confident Designer observation in natural Khmer describing what you spotted in the product photo and the luxury aesthetic that sells it best.
- productInsightEn: 1-sentence English Designer visual diagnosis of the uploaded product.
- concepts: Array of exactly 3 concept objects (titleKm, titleEn, visualDirectionKm, visualDirectionEn, masterPrompt, negativePrompt, khmerHeadline, subHeadline, fbPrimaryCopyKm, fbCtaKm, cameraSpec, lightingSpec, palette [3 hex colors]).`;

      const response = await generateWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: parsedImage.mimeType,
                  data: parsedImage.data,
                },
              },
              { text: designerPrompt },
            ],
          },
          config: {
            systemInstruction: BRAND_CONTEXT,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                productInsightKm: { type: Type.STRING },
                productInsightEn: { type: Type.STRING },
                concepts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      titleKm: { type: Type.STRING },
                      titleEn: { type: Type.STRING },
                      visualDirectionKm: { type: Type.STRING },
                      visualDirectionEn: { type: Type.STRING },
                      masterPrompt: { type: Type.STRING },
                      negativePrompt: { type: Type.STRING },
                      khmerHeadline: { type: Type.STRING },
                      subHeadline: { type: Type.STRING },
                      fbPrimaryCopyKm: { type: Type.STRING },
                      fbCtaKm: { type: Type.STRING },
                      cameraSpec: { type: Type.STRING },
                      lightingSpec: { type: Type.STRING },
                      palette: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: [
                      'titleKm',
                      'titleEn',
                      'visualDirectionKm',
                      'visualDirectionEn',
                      'masterPrompt',
                      'negativePrompt',
                      'khmerHeadline',
                      'subHeadline',
                      'fbPrimaryCopyKm',
                      'fbCtaKm',
                      'cameraSpec',
                      'lightingSpec',
                      'palette',
                    ],
                  },
                },
              },
              required: ['productInsightKm', 'productInsightEn', 'concepts'],
            },
          },
        })
      );

      const rawText = (response.text ?? '{}')
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      const parsed = JSON.parse(rawText);
      const concepts = Array.isArray(parsed?.concepts) ? parsed.concepts : [];

      return {
        productInsightKm: parsed?.productInsightKm || '',
        productInsightEn: parsed?.productInsightEn || '',
        concepts: concepts.map((item: Record<string, unknown>, idx: number) => {
          const paletteArr = Array.isArray(item.palette) ? item.palette.slice(0, 3) : [];
          while (paletteArr.length < 3) paletteArr.push('#FAF9F7');
          return {
            ...item,
            id: `autodesign-${Date.now()}-${idx}`,
            palette: paletteArr,
            engineId,
            aspectRatio,
            variantId: 'custom',
            createdAt: new Date().toISOString(),
            source: 'ai-fresh',
          };
        }),
      };
    });
  });

  app.post('/api/generate-tvc-prompt', async (req, res) => {
    const {
      variantId = 'duo',
      videoEngine = 'veo3',
      durationId = '15s-vertical',
      styleId = 'auto',
      vfxId = 'auto',
      aspectRatio = '9:16',
      customBrief = '',
      avoidTitles = [],
      avoidVfxIds = [],
      avoidStyleIds = [],
      customImageDataUrl,
    } = req.body ?? {};

    await respondWithJsonKeepalive(res, async () => {
      const ai = createGeminiClient();
      const shotsCount = durationId === '6s-bumper' ? 2 : 4;
      const durationLabel =
        durationId === '30s-cinema'
          ? '30-second full luxury Television Commercial (16:9 widescreen cinema)'
          : durationId === '6s-bumper'
            ? '6-second ultra-punchy scroll-stopper video ad (4:5 mobile feed)'
            : '15-second modern vertical TVC for Facebook Reels, TikTok & Stories (9:16)';

      const engineGuidance =
        videoEngine === 'veo3'
          ? 'Format prompts for Google Veo 3: vivid cinematic camera choreography, realistic fluid/cloth/light VFX physics, and explicit native audio/ASMR/music sound cues inside the prompt.'
          : videoEngine === 'kling'
            ? 'Format prompts for Kling 2.0: smooth continuous motion cues, expressive natural hand/skin/fabric movement, hyper-real CGI fluid motion, consistent product packaging lock, and clear start-to-end action.'
            : videoEngine === 'runway'
              ? 'Format prompts for Runway Gen-4: crisp directorial camera move syntax (slow dolly-in, orbital 360, rack focus, 120fps slow motion) with high-end CGI compositing and locked lighting continuity.'
              : videoEngine === 'sora'
                ? 'Format prompts for OpenAI Sora: expressive multi-beat visual choreography, rich VFX world physics, volumetric lighting, and surreal luxury CGI depth.'
                : 'Format prompts for Luma Dream Machine / Hailuo: clean, glossy commercial hero product movement, shimmering CGI reflections, and smooth cinematic arcs.';

      const styleDescriptions: Record<string, string> = {
        'haute-parfumerie':
          'Parisian Haute-Parfumerie Cinema (Dior J’adore / Chanel No. 5 aesthetic): 120fps slow-motion champagne silk waves, sunlit golden caustics, drifting pink rose petals, luminous skin, and monumental hero packshot.',
        'seoul-avant-garde':
          'Seoul Tamburins / Gentle Monster Modern Art Film: sleek architectural gallery, liquid chrome waves, blown Murano rose glass, razor-sharp rainbow prism sunbeams, crisp contemporary rhythm.',
        'fooh-viral-3d':
          'Viral 3D FOOH (Fake-Out-Of-Home) City Spectacle: colossal luxury perfume lotion tubes emerging in a sunlit luxury city plaza or glass pavilion, real rose petals and silky cream ribbons floating across the sky.',
        'asmr-sensory':
          'Hyper-Tactile ASMR Sensory Macro Film: extreme close-up slow-motion creamy white lotion ribbon swirling, iridescent moisture bubbles bursting softly, dewy hydrated skin glow, soothing ASMR soundscape.',
        'romantic-story':
          'Modern Romantic Golden Hour Lifestyle Story: graceful young woman applying perfume lotion to collarbone/wrist, stepping into golden afternoon light, turning heads with an irresistible glowing scent trail.',
        'dark-night-luxury':
          'Obsidian Night Haute-Parfumerie Film: black volcanic mirror water, glowing lunar eclipse rim light, swirling 24K gold dust constellations, velvet plum fragrance mist.',
      };

      const vfxDescriptions: Record<string, string> = {
        'liquid-gold-silk':
          'Houdini 3D Molten 24K Gold & Liquid Silk CGI: weightless ribbons of melted champagne gold and iridescent blush silk weaving around the bottle at 120fps with physically accurate specular highlights.',
        'zero-g-cream-fluid':
          'Zero-Gravity Whipped Lotion Fluid Simulation CGI: ultra-glossy pearlescent white perfume lotion ribbons erupting into sculptural slow-motion arcs and wrapping delicately around the packaging.',
        'fooh-giant-cgi':
          'FOOH (Fake-Out-Of-Home) Photorealistic 3D Architectural CGI: giant 20-meter perfume lotion tubes tracked seamlessly into a sunlit luxury plaza with 3D silk banners and falling rose petal physics.',
        'crystal-caustics-raytrace':
          'Octane Raytraced Crystal Prism & Glacial Shatter VFX: sculpted optical glass and ice monoliths fracturing in ultra slow-motion, casting razor-sharp rainbow light caustics and suspended dew spheres.',
        'botanical-bloom-vfx':
          'Photorealistic 3D Botanical Time-Lapse CGI: velvety pink Damask roses and golden black-vanilla orchids rapidly blooming out of the bottle’s aura and dissolving into glowing scent pollen particles.',
        'liquid-chrome-morph':
          'Liquid Mercury Chrome Morphing CGI (Seoul Gallery Style): reflective silver-lilac liquid metal morphing fluidly into floating geometric plinths and kinetic mirror waves around the product.',
        'obsidian-stardust-vfx':
          'Volumetric Perfume Mist & 24K Stardust Particle VFX: luminous violet-rose volumetric fragrance vapor swirling over black volcanic mirror water with micro-shimmering gold dust constellations.',
        'macro-hydration-spheres':
          '3D Iridescent Moisture Micro-Spheres & Skin Glow CGI: translucent pearl-glass hydration bubbles orbiting in macro depth-of-field, bursting gently into luminous dewy light across the frame.',
      };

      const pickRandomAvoiding = (keys: string[], recent: unknown): string => {
        const recentSet = new Set(Array.isArray(recent) ? recent : []);
        const freshPool = keys.filter((k) => !recentSet.has(k));
        const pool = freshPool.length > 0 ? freshPool : keys;
        return pool[Math.floor(Math.random() * pool.length)];
      };

      const styleKeys = Object.keys(styleDescriptions);
      const vfxKeys = Object.keys(vfxDescriptions);

      const resolvedStyleId =
        styleId === 'auto' || !styleDescriptions[styleId]
          ? pickRandomAvoiding(styleKeys, avoidStyleIds)
          : styleId;

      const resolvedVfxId =
        vfxId === 'auto' || !vfxDescriptions[vfxId]
          ? pickRandomAvoiding(vfxKeys, avoidVfxIds)
          : vfxId;

      const avoidClause =
        Array.isArray(avoidTitles) && avoidTitles.length > 0
          ? `ANTI-REPETITION: Do NOT repeat these previous TVC concepts: ${avoidTitles.slice(-10).join('; ')}. Invent a completely fresh visual narrative and surprising VFX choreography.`
          : '';

      const tvcPrompt = `You are an Award-Winning Luxury Commercial Film Director & Senior Houdini/CGI VFX Supervisor (Cannes Lions × Dior Beauty × Seoul Tamburins × The Mill VFX) writing a modern, jaw-dropping Television Commercial (TVC) AI Video Prompt Blueprint for Sneh Perfume Lotion.

Campaign Specs:
- Product Focus: ${variantId}
- Format & Duration: ${durationLabel} (Aspect Ratio: ${aspectRatio})
- Visual Film Style (Auto-Selected by Creative Director): ${styleDescriptions[resolvedStyleId]}
- Signature VFX & CGI Simulation Direction: ${vfxDescriptions[resolvedVfxId]}
- Video Generator Target: ${engineGuidance}
- Exact Shot Count: ${shotsCount} timed shots covering the full duration cleanly.
- User Custom Direction: ${customBrief || 'Auto-direct with bold, unforgettable luxury CGI & VFX artistry that looks like a $200,000 international fragrance TVC on Cambodian Facebook Reels and TV screens.'}
${avoidClause}

CRITICAL VFX & CGI REQUIREMENT:
- Weave the Signature VFX & CGI physics (fluid simulation, volumetric particles, raytraced reflections, 3D cloth/petal dynamics, or FOOH compositing) naturally into the masterVideoPrompt AND into every individual shot's videoPrompt so the AI video generator renders breathtaking luxury CGI motion while keeping the Sneh Perfume Lotion packaging 100% crisp and authentic.

Return structured JSON containing:
- titleKm: Trendy luxury TVC campaign title in natural Khmer
- titleEn: Editorial film title in English (3-5 words)
- loglineKm: 2-sentence Director's pitch in natural Khmer explaining the emotional hook and luxury CGI/VFX flow
- loglineEn: 1-2 sentence English director's treatment
- masterVideoPrompt: One complete, cohesive, ready-to-paste English AI Video Prompt summarizing the entire hero TVC sequence with rich VFX & CGI direction for ${videoEngine} (${aspectRatio})
- vfxCgiDirectionKm: 1-2 crisp sentences in natural Khmer explaining the hero VFX & CGI techniques used (e.g. Houdini fluid sim, 3D petals, raytraced light, FOOH compositing)
- vfxCgiDirectionEn: 1 crisp sentence in English naming the VFX/CGI pipeline techniques
- musicDirectionKm: Modern background music & sound design direction in Khmer (e.g. modern synth-harp, ASMR cream swirl, soft bass drop)
- musicDirectionEn: English music & SFX direction
- ctaLineKm: Memorable closing Khmer tagline + CTA for the final packshot (e.g. "Sស្នេហ៍h Perfume Lotion — ក្រអូបជឿជាក់ ទាក់ទាញគ្រប់ជំហាន")
- palette: Array of exactly 3 hex colors for color grading
- shots: Array of exactly ${shotsCount} shot objects, each with:
  - shotNumber: 1..${shotsCount}
  - timecode: e.g. "00:00 – 00:03"
  - roleKm: Khmer beat label (e.g. "ឈុតទី ១ · ទាក់ទាញ ៣ វិនាទីដំបូង (Hook)")
  - roleEn: English beat label (e.g. "Shot 01 · 3-Second Visual Hook")
  - cameraMovement: Crisp cinema camera move + fps (e.g. "120fps macro dolly-in · f/2.0 rack focus")
  - videoPrompt: Complete standalone English AI video generation prompt for THIS exact shot (preserving exact Sneh packaging details, rich CGI/VFX physics, lighting continuity, motion, and ${aspectRatio} framing)
  - vfxCgiCue: Specific VFX/CGI effect active in this shot (e.g. "Houdini 120fps molten 24K gold ribbon + micro-rose petal particle swirl")
  - voiceoverKm: Short alluring Khmer Voiceover line (natural, poetic, spoken smoothly within the timecode)
  - onScreenTextKm: Short crisp Khmer supers/text overlay for that shot (3-7 words)
  - sfxCue: Specific sound effect / ASMR cue (e.g. "Silky lotion glide ASMR + crystal shimmer chime")`;

      const parsedImage = parseDataUrl(customImageDataUrl);
      const contents = parsedImage
        ? {
            parts: [
              {
                inlineData: {
                  mimeType: parsedImage.mimeType,
                  data: parsedImage.data,
                },
              },
              {
                text: `Inspect this uploaded product photograph carefully. Preserve its EXACT packaging silhouette, colors, cap, and label design across the masterVideoPrompt and every shot's videoPrompt while surrounding it with the assigned luxury VFX & CGI.\n\n${tvcPrompt}`,
              },
            ],
          }
        : tvcPrompt;

      const response = await generateWithRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents,
          config: {
            systemInstruction: BRAND_CONTEXT,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                titleKm: { type: Type.STRING },
                titleEn: { type: Type.STRING },
                loglineKm: { type: Type.STRING },
                loglineEn: { type: Type.STRING },
                masterVideoPrompt: { type: Type.STRING },
                vfxCgiDirectionKm: { type: Type.STRING },
                vfxCgiDirectionEn: { type: Type.STRING },
                musicDirectionKm: { type: Type.STRING },
                musicDirectionEn: { type: Type.STRING },
                ctaLineKm: { type: Type.STRING },
                palette: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                shots: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      shotNumber: { type: Type.INTEGER },
                      timecode: { type: Type.STRING },
                      roleKm: { type: Type.STRING },
                      roleEn: { type: Type.STRING },
                      cameraMovement: { type: Type.STRING },
                      videoPrompt: { type: Type.STRING },
                      vfxCgiCue: { type: Type.STRING },
                      voiceoverKm: { type: Type.STRING },
                      onScreenTextKm: { type: Type.STRING },
                      sfxCue: { type: Type.STRING },
                    },
                    required: [
                      'shotNumber',
                      'timecode',
                      'roleKm',
                      'roleEn',
                      'cameraMovement',
                      'videoPrompt',
                      'vfxCgiCue',
                      'voiceoverKm',
                      'onScreenTextKm',
                      'sfxCue',
                    ],
                  },
                },
              },
              required: [
                'titleKm',
                'titleEn',
                'loglineKm',
                'loglineEn',
                'masterVideoPrompt',
                'vfxCgiDirectionKm',
                'vfxCgiDirectionEn',
                'musicDirectionKm',
                'musicDirectionEn',
                'ctaLineKm',
                'palette',
                'shots',
              ],
            },
          },
        })
      );

      const rawText = (response.text ?? '{}')
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      const parsed = JSON.parse(rawText);
      const paletteArr = Array.isArray(parsed?.palette) ? parsed.palette.slice(0, 3) : [];
      while (paletteArr.length < 3) paletteArr.push('#FAF9F7');

      return {
        tvc: {
          ...parsed,
          id: `tvc-${Date.now()}`,
          palette: paletteArr,
          shots: Array.isArray(parsed?.shots) ? parsed.shots : [],
          videoEngine,
          durationId,
          styleId: resolvedStyleId,
          vfxPresetId: resolvedVfxId,
          aspectRatio,
          createdAt: new Date().toISOString(),
        },
      };
    });
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sneh Atelier server listening on http://localhost:${PORT}`);
  });
}

startServer();
