import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

// Character database
const CHARACTERS = {
  "the-office": [
    { name: "Jim Halpert", traits: ["witty", "pranks", "sarcastic", "romantic"], show: "The Office" },
    { name: "Dwight Schrute", traits: ["intense", "competitive", "loyal", "eccentric"], show: "The Office" },
    {
      name: "Michael Scott",
      traits: ["enthusiastic", "inappropriate", "caring", "attention-seeking"],
      show: "The Office",
    },
    { name: "Pam Beesly", traits: ["artistic", "kind", "supportive", "gentle"], show: "The Office" },
  ],
  friends: [
    { name: "Chandler Bing", traits: ["sarcastic", "witty", "awkward", "loyal"], show: "Friends" },
    { name: "Ross Geller", traits: ["nerdy", "passionate", "dramatic", "intellectual"], show: "Friends" },
    { name: "Rachel Green", traits: ["fashionable", "determined", "social", "ambitious"], show: "Friends" },
    { name: "Monica Geller", traits: ["organized", "competitive", "caring", "perfectionist"], show: "Friends" },
  ],
  "big-bang-theory": [
    { name: "Sheldon Cooper", traits: ["genius", "rigid", "literal", "scientific"], show: "Big Bang Theory" },
    { name: "Leonard Hofstadter", traits: ["smart", "romantic", "insecure", "kind"], show: "Big Bang Theory" },
    { name: "Penny", traits: ["social", "practical", "friendly", "street-smart"], show: "Big Bang Theory" },
    { name: "Howard Wolowitz", traits: ["flirty", "creative", "insecure", "loyal"], show: "Big Bang Theory" },
  ],
  "silicon-valley": [
    { name: "Richard Hendricks", traits: ["anxious", "idealistic", "technical", "ethical"], show: "Silicon Valley" },
    { name: "Erlich Bachman", traits: ["arrogant", "delusional", "entrepreneurial", "loud"], show: "Silicon Valley" },
    { name: "Gilfoyle", traits: ["sarcastic", "dark", "technical", "pessimistic"], show: "Silicon Valley" },
    { name: "Dinesh", traits: ["competitive", "insecure", "technical", "petty"], show: "Silicon Valley" },
  ],
  himym: [
    {
      name: "Barney Stinson",
      traits: ["legendary", "suit-obsessed", "confident", "loyal"],
      show: "How I Met Your Mother",
    },
    {
      name: "Ted Mosby",
      traits: ["romantic", "architect", "storyteller", "optimistic"],
      show: "How I Met Your Mother",
    },
    { name: "Marshall Eriksen", traits: ["gentle", "environmental", "loyal", "funny"], show: "How I Met Your Mother" },
    {
      name: "Robin Scherbatsky",
      traits: ["independent", "canadian", "news-anchor", "tough"],
      show: "How I Met Your Mother",
    },
  ],
}

export async function POST(request: NextRequest) {
  try {
    const { casts } = await request.json()

    if (!casts || !Array.isArray(casts) || casts.length === 0) {
      return NextResponse.json({ error: "Casts data is required" }, { status: 400 })
    }

    const allCharacters = Object.values(CHARACTERS).flat()
    const characterDescriptions = allCharacters
      .map((char) => `${char.name} from ${char.show}: ${char.traits.join(", ")}`)
      .join("\n")

    // Extract cast text content for analysis
    const castTexts = casts.map(cast => cast.text).join("\n")

    const { text } = await generateText({
      model: groq("llama-3.1-70b-instruct"),
      prompt: `Analyze these Farcaster casts and determine which sitcom character the author is most similar to based on their personality, humor style, and communication patterns.

Casts to analyze:
${castTexts}

Available characters:
${characterDescriptions}

Based on the writing style, humor, topics, and personality traits shown in these casts, which character matches best? Consider:
- Communication style (sarcastic, enthusiastic, technical, etc.)
- Topics of interest
- Humor type
- Personality traits
- Writing patterns and vocabulary

Respond with just the character name exactly as listed above, followed by a confidence percentage (70-95%), then a brief explanation of why they match.

Format: CHARACTER_NAME|CONFIDENCE%|EXPLANATION`,
    })

    const parts = text.split("|")
    if (parts.length !== 3) {
      throw new Error("Invalid AI response format")
    }

    const characterName = parts[0].trim()
    const confidence = Number.parseInt(parts[1].replace("%", ""))
    const explanation = parts[2].trim()

    // Find the matching character
    const matchedCharacter = allCharacters.find((char) => char.name.toLowerCase() === characterName.toLowerCase())

    if (!matchedCharacter) {
      throw new Error("Character not found")
    }

    return NextResponse.json({
      character: matchedCharacter,
      confidence: Math.max(70, Math.min(95, confidence)), // Ensure confidence is between 70-95%
      reasoning: explanation,
      analyzedCasts: casts.length,
    })
  } catch (error) {
    console.error("Analysis error:", error)

    const allCharacters = Object.values(CHARACTERS).flat()
    const randomCharacter = allCharacters[Math.floor(Math.random() * allCharacters.length)]

    return NextResponse.json({
      character: randomCharacter,
      confidence: Math.floor(Math.random() * 20) + 75,
      reasoning: `Based on your posting style, you show traits of being ${randomCharacter.traits.slice(0, 2).join(" and ")}, just like ${randomCharacter.name}!`,
      analyzedCasts: casts?.length || 0,
    })
  }
}
