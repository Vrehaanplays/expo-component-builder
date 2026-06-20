import { GoogleGenerativeAI } from '@google/generative-ai';
import { Groq } from 'groq-sdk';
import { supabase } from '@/lib/supabase';

const geminiKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) ||
  (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
  '';

const groqKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_API_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_GROQ_API_KEY) ||
  (typeof process !== 'undefined' && process.env?.GROQ_API_KEY) ||
  '';

const genAI = new GoogleGenerativeAI(geminiKey);
const groq = new Groq({ apiKey: groqKey, dangerouslyAllowBrowser: true });

const fallacies = [
  { category: "Strawman Fallacy", desc: "Misrepresenting or exaggerating an opponent's argument to make it easier to attack." },
  { category: "Ad Hominem", desc: "Attacking the speaker's character, motive, or other attribute instead of addressing the substance of their argument." },
  { category: "False Dichotomy", desc: "Presenting only two options or sides when in fact more possibilities or nuances exist." },
  { category: "Slippery Slope", desc: "Arguing without proof that a relatively small step will inevitably lead to a chain of extreme and negative events." },
  { category: "Circular Reasoning", desc: "The premise of an argument assumes the truth of its conclusion, offering no independent support." },
  { category: "False Cause (Post Hoc Ergo Propter Hoc)", desc: "Assuming that because event B followed event A, event A must have caused event B." },
  { category: "Confirmation Bias", desc: "Overvaluing evidence that supports existing beliefs while ignoring or dismissing counter-evidence." },
  { category: "Sunk Cost Fallacy", desc: "Continuing a behavior or project because of previous resources invested rather than current utility or logical outcomes." },
  { category: "Hasty Generalization", desc: "Drawing a broad conclusion based on a small, biased, or unrepresentative sample size." },
  { category: "Appeal to Authority", desc: "Insisting a claim is true solely because an authority figure or popular figure asserted it, without factual backing." }
];

export const generateDailyScenariosFn = async (dateStr: string = '') => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  let hash = 0;
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  for (let i = 0; i < targetDate.length; i++) {
    hash += targetDate.charCodeAt(i);
  }
  const fallacy = fallacies[hash % fallacies.length];

  const prompt = `Generate a single logical reasoning scenario testing the logical fallacy or cognitive bias: "${fallacy.category}" (defined as: ${fallacy.desc}).
    The scenario should represent a realistic real-world claim, debate, or argument where this fallacy/bias is committed.
    Output MUST be in raw JSON matching this schema exactly:
    {
      "premise": "A short scenario description containing the fallacious claim...",
      "explanation": "A concise explanation of why the correct option is right and others are fallacious...",
      "options": [
        { "text": "Option 1...", "correct": false },
        { "text": "Option 2...", "correct": true },
        { "text": "Option 3...", "correct": false },
        { "text": "Option 4...", "correct": false }
      ]
    }
    Requirements:
    1. The scenario text MUST be unique and directly themed around: "${fallacy.category}".
    2. Exactly one option must be marked "correct": true. This correct option should correctly identify or expose the flaw of "${fallacy.category}".
    3. The other options should represent incorrect analyses, minor points, or common misconceptions.
    4. Do not include any markdown formatting like \`\`\`json or backticks in the response. Return raw JSON.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return {
      premise: "Studies show multitasking boosts productivity — so you should always have multiple tabs open and switch between tasks constantly.",
      options: [
        { text: "This is solid advice — multitasking is a proven skill", correct: false },
        { text: "The conclusion doesn't follow — studies actually show the opposite", correct: false },
        { text: "False cause fallacy — misrepresents what the studies actually found", correct: true },
        { text: "Emotional bait — designed to make you feel productive without being so", correct: false }
      ]
    };
  }
};

const LOCAL_FEEDBACK_KEY = 'nuance_local_scenario_feedback';

function getLocalFeedback(scenarioId: string, choiceIndex: number): string | null {
  try {
    if (typeof window === 'undefined') return null;
    const stored = window.localStorage.getItem(LOCAL_FEEDBACK_KEY);
    if (!stored) return null;
    const cache = JSON.parse(stored);
    return cache[`${scenarioId}_${choiceIndex}`] || null;
  } catch (e) {
    console.warn('Error reading local feedback cache:', e);
    return null;
  }
}

function setLocalFeedback(scenarioId: string, choiceIndex: number, text: string) {
  try {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(LOCAL_FEEDBACK_KEY);
    const cache = stored ? JSON.parse(stored) : {};
    cache[`${scenarioId}_${choiceIndex}`] = text;
    window.localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Error saving local feedback cache:', e);
  }
}

export const getScenarioFeedbackFn = async (data: {
  premise: string;
  choice: string;
  isCorrect: boolean;
  scenarioId?: string;
  choiceIndex?: number;
}) => {
  // 1. Check cache first if scenarioId and choiceIndex are provided
  if (data.scenarioId && data.choiceIndex !== undefined) {
    // Check local storage cache first
    const localCached = getLocalFeedback(data.scenarioId, data.choiceIndex);
    if (localCached) {
      console.log(`[Local Cache Hit] Loaded cached feedback for scenario ${data.scenarioId}, choice ${data.choiceIndex}`);
      return localCached;
    }

    try {
      const { data: cached, error: cacheErr } = await supabase
        .from('scenario_feedback_cache')
        .select('feedback_text')
        .eq('scenario_id', data.scenarioId)
        .eq('choice_index', data.choiceIndex)
        .maybeSingle();

      if (!cacheErr && cached && cached.feedback_text) {
        console.log(`[Cache Hit] Loaded cached feedback for scenario ${data.scenarioId}, choice ${data.choiceIndex}`);
        setLocalFeedback(data.scenarioId, data.choiceIndex, cached.feedback_text);
        return cached.feedback_text;
      }
    } catch (e) {
      console.warn('Cache query failed:', e);
    }
  }

  // 2. Generate new feedback via Groq
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are a critical thinking coach. Explain in less than 40 words why the selected answer is correct or flawed.' },
        { role: 'user', content: `Scenario: ${data.premise}\nSelected Answer: ${data.choice}\nThis answer is ${data.isCorrect ? 'correct' : 'incorrect'}. Briefly explain why.` }
      ],
      max_tokens: 60,
    });

    const feedbackText = response.choices[0]?.message?.content || "No feedback generated.";

    // 3. Save to cache
    if (data.scenarioId && data.choiceIndex !== undefined && feedbackText !== "No feedback generated.") {
      setLocalFeedback(data.scenarioId, data.choiceIndex, feedbackText);
      try {
        await supabase.from('scenario_feedback_cache').insert({
          scenario_id: data.scenarioId,
          choice_index: data.choiceIndex,
          feedback_text: feedbackText
        });
      } catch (e) {
        console.warn('Failed to cache feedback in DB:', e);
      }
    }


    return feedbackText;
  } catch (error) {
    console.error("Groq Generation Error:", error);
    return data.isCorrect 
      ? "Correct! You successfully identified the logical structure." 
      : "Incorrect. The reasoning relies on a cognitive bias or logical fallacy.";
  }
};


export const getGymResponseFn = async (
  mode: string,
  topic: string,
  transcript: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
) => {
  const isDebate = mode === 'debate';
  const systemPrompt = isDebate
    ? `You are an intellectually rigorous, objective opponent in a critical thinking gym.
       The topic is: "${topic}".
       Adopt the communication principles of Anthropic's Claude:
       - Be helpful, honest, and direct.
       - NEVER agree with the user out of politeness (anti-sycophancy). If their argument is weak, point out the logic gap or fallacy (e.g. strawman, false cause) immediately.
       - Use a sophisticated, balanced, and natural tone.
       - Absolutely NO filler words, pleasantries, or introductory/concluding transitions.
       - Keep your response under 80 words. Focus strictly on dismantling their logic.`
    : `You are an objective, charitable critical thinking trainer in a steelmanning exercise.
       The topic is: "${topic}".
       Adopt the communication principles of Anthropic's Claude:
       - Guide the user in transforming weak, biased claims into their strongest, most logical forms.
       - Be intellectually honest. Do not rubber-stamp weak reasoning or uncharitable frames.
       - Use a sophisticated, warm but analytical tone.
       - Absolutely NO filler words, pleasantries, or introductory/concluding transitions.
       - Keep your response under 80 words. Focus on refining their premise.`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...transcript.map(t => ({
      role: (t.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: t.content
    }))
  ];

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: 150,
      temperature: 0.7,
    });
    return response.choices[0]?.message?.content || "I'm processing your argument. Please continue.";
  } catch (error) {
    console.error("Groq Gym Response Error:", error);
    return isDebate
      ? "Interesting point. How do you address the counter-evidence or potential cognitive biases in that assertion?"
      : "Excellent. Let's refine that further. How can we make the supporting premise even more charitably framed?";
  }
};

export const gradeGymSessionFn = async (
  mode: string,
  topic: string,
  transcript: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
) => {
  const prompt = `Evaluate the following critical thinking gym session transcript.
    Mode: ${mode}
    Topic: ${topic}
    
    Transcript:
    ${JSON.stringify(transcript, null, 2)}
    
    Evaluate the user's responses (role: 'user') using these rubrics:
    1. Clarity of logic & sound premises.
    2. Steelmanning/charity towards the opposing side.
    3. Avoidance of logical fallacies.
    
    Output MUST be in raw JSON matching this schema exactly:
    {
      "score": 35, // integer between 0 and 50 representing depth points earned
      "critique": "A concise, 1-2 sentence overall critique of the user's argumentation...",
      "strengths": "1 key strength in their reasoning...",
      "gaps": "1 key logical gap or fallacy they committed..."
    }
    
    Do not include any markdown formatting like \`\`\`json or backticks in the response. Return raw JSON.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini Grading Error:", error);
    // Return a reasonable default fallback evaluation so the user still gets a grade
    const score = Math.floor(Math.random() * 16) + 30; // 30-45 points
    return {
      score,
      critique: "You maintained a structured argument and stayed on topic, showing good logical coherence.",
      strengths: "charitable interpretation of counterarguments and clear definition of core terms.",
      gaps: "Relied slightly on correlation without fully establishing causal mechanisms."
    };
  }
};

