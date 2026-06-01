import { GoogleGenerativeAI } from '@google/generative-ai';
import { Groq } from 'groq-sdk';

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

export const getScenarioFeedbackFn = async (data: { premise: string; choice: string; isCorrect: boolean }) => {
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a critical thinking coach. Explain in less than 40 words why the selected answer is correct or flawed.' },
          { role: 'user', content: `Scenario: ${data.premise}\nSelected Answer: ${data.choice}\nThis answer is ${data.isCorrect ? 'correct' : 'incorrect'}. Briefly explain why.` }
        ],
        max_tokens: 60,
      });

      return response.choices[0]?.message?.content || "No feedback generated.";
    } catch (error) {
      console.error("Groq Generation Error:", error);
      return data.isCorrect 
        ? "Correct! You successfully identified the logical structure." 
        : "Incorrect. The reasoning relies on a cognitive bias or logical fallacy.";
    }
};
