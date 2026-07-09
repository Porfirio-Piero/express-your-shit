import { NextRequest, NextResponse } from 'next/server';

// POST /api/tts - Generate voice note (Web Speech API preview in v1, production TTS ready)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.character || !body.gender || !body.accent || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: character, gender, accent, message' },
        { status: 400 }
      );
    }

    // Validate message length
    if (body.message.length > 180) {
      return NextResponse.json(
        { error: 'Message must be 180 characters or less' },
        { status: 400 }
      );
    }

    // Content moderation check (basic wordlist)
    const prohibitedWords = [
      'kill', 'murder', 'threat', 'bomb', 'terrorist', 'suicide', 'self-harm',
      'minor', 'child', 'school shooting', 'rape', 'assault', 'stab', 'shoot',
    ];
    const messageLower = body.message.toLowerCase();
    const containsProhibited = prohibitedWords.some(word => messageLower.includes(word));

    if (containsProhibited) {
      return NextResponse.json(
        { error: 'Message contains prohibited content. Please revise.' },
        { status: 400 }
      );
    }

    // In v1, we return Web Speech API parameters for client-side preview
    // Production version will call OpenAI TTS API here
    const CHARACTER_PROMPTS: Record<string, string> = {
      'disappointed-judge': 'Speaking as a disappointed judge delivering a verdict. Stern, measured, dripping with disapproval.',
      'movie-trailer': 'Speaking as an epic movie trailer narrator. Dramatic pauses, deep resonance, building intensity.',
      'royal-herald': 'Speaking as a royal herald making a proclamation. Regal, formal, with grandiose flourish.',
      'nature-doc': 'Speaking as a nature documentarian observing a specimen. Clinical fascination, dry wit, BBC-style narration.',
      'drill-sergeant': 'Speaking as a drill sergeant. Loud, commanding, withering, no-nonsense.',
      'disappointed-parent': 'Speaking as a deeply disappointed parent. Quiet letdown, the weight of expectation unmet.',
    };

    const ACCENT_MAP: Record<string, string> = {
      'american': 'en-US',
      'british': 'en-GB',
      'australian': 'en-AU',
      'flat-robotic': 'en-US', // Flat & Robotic uses American English but slower rate
    };

    const characterPrompt = CHARACTER_PROMPTS[body.character] || CHARACTER_PROMPTS['disappointed-judge'];
    const lang = ACCENT_MAP[body.accent] || 'en-US';

    // V1: Return client-side TTS parameters
    return NextResponse.json({
      mode: 'preview',
      character: body.character,
      character_prompt: characterPrompt,
      gender: body.gender,
      accent: body.accent,
      lang: lang,
      message: body.message,
      rate: body.accent === 'flat-robotic' ? 0.7 : 0.9,
      pitch: body.gender === 'female' ? 1.3 : 0.8,
      // Production TTS endpoint ready:
      // tts_url: `/api/tts/generate?order=${body.order_id}`,
      note: 'Production version will use OpenAI TTS API for high-quality voice generation.',
    });

  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}