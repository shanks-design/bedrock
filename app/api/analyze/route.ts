import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'

// Define sitcom characters with their key personality traits
const SITCOM_CHARACTERS = [
  {
    name: "Sheldon Cooper",
    show: "The Big Bang Theory",
    traits: ["intellectual", "analytical", "socially awkward", "detail-oriented", "logical", "scientific", "particular about routines", "direct communication"],
    description: "A brilliant theoretical physicist with exceptional intelligence but limited social skills"
  },
  {
    name: "Joey Tribbiani",
    show: "Friends",
    traits: ["loyal", "simple-minded", "good-hearted", "naive", "protective", "food-loving", "not book smart", "emotionally intelligent"],
    description: "A lovable actor with a big heart but limited intellectual depth"
  },
  {
    name: "Michael Scott",
    show: "The Office",
    traits: ["well-meaning", "socially inappropriate", "attention-seeking", "optimistic", "clueless", "caring", "unprofessional", "desperate for approval"],
    description: "A well-intentioned but socially awkward regional manager"
  },
  {
    name: "Barney Stinson",
    show: "How I Met Your Mother",
    traits: ["confident", "charismatic", "playful", "loyal to friends", "smooth", "entertaining", "mischievous", "self-assured"],
    description: "A confident, smooth-talking womanizer with a heart of gold for his friends"
  },
  {
    name: "Richard Hendricks",
    show: "Silicon Valley",
    traits: ["intelligent", "socially awkward", "idealistic", "passionate about technology", "introverted", "honest", "naive about business", "focused"],
    description: "A brilliant but socially awkward tech entrepreneur"
  },
  {
    name: "Chandler Bing",
    show: "Friends",
    traits: ["sarcastic", "witty", "self-deprecating", "loyal", "intelligent", "humorous", "insecure", "supportive"],
    description: "A sarcastic and witty data analyst with a heart of gold"
  },
  {
    name: "Leslie Knope",
    show: "Parks and Recreation",
    traits: ["enthusiastic", "determined", "optimistic", "loyal", "hardworking", "passionate", "organized", "caring"],
    description: "An enthusiastic and determined government employee with boundless optimism"
  },
  {
    name: "Jake Peralta",
    show: "Brooklyn Nine-Nine",
    traits: ["funny", "immature", "talented", "loyal", "competitive", "creative", "childlike", "dedicated"],
    description: "A talented but immature detective with a great sense of humor"
  }
]

export async function POST(request: NextRequest) {
  try {
    console.log('=== Character Analysis API Called ===')
    
    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ Groq API key not configured')
      return NextResponse.json(
        { error: 'AI analysis service not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { userData } = body

    if (!userData) {
      console.error('❌ No user data provided')
      return NextResponse.json(
        { error: 'User data is required for analysis' },
        { status: 400 }
      )
    }

    console.log('Analyzing user data for FID:', userData.fid)
    console.log('User profile:', userData.profile?.username)

    // Prepare user data for analysis
    const analysisData = {
      username: userData.profile?.username || 'Unknown',
      displayName: userData.profile?.displayName || 'Unknown',
      bio: userData.profile?.bio || 'No bio provided',
      casts: userData.casts?.slice(0, 20) || [], // Analyze recent 20 casts
      reactions: userData.reactions || [],
      followerCount: userData.profile?.followerCount || 0,
      followingCount: userData.profile?.followingCount || 0
    }

    console.log('Analysis data prepared:', {
      username: analysisData.username,
      castsCount: analysisData.casts.length,
      reactionsCount: analysisData.reactions.length,
      hasBio: !!analysisData.bio
    })

    // Create the analysis prompt
    const analysisPrompt = `
You are a personality analyst specializing in matching people to sitcom characters based on their social media behavior and personality traits.

IMPORTANT: You must respond with ONLY valid JSON. No additional text, no explanations, just the JSON object.

Analyze the following user data and match them to the most suitable sitcom character from this list:

${SITCOM_CHARACTERS.map(char => 
  `- ${char.name} (${char.show}): ${char.description}`
).join('\n')}

User Data to Analyze:
- Username: ${analysisData.username}
- Display Name: ${analysisData.displayName}
- Bio: ${analysisData.bio}
- Recent Casts: ${analysisData.casts.map(cast => cast.text).join('\n')}
- Follower Count: ${analysisData.followerCount}
- Following Count: ${analysisData.followingCount}

Based on this data, provide a JSON response with this EXACT structure (no additional fields, no extra text):

{
  "topMatches": [
    {
      "character": "Character Name",
      "show": "Show Name",
      "confidence": 85,
      "reasoning": "Detailed explanation of why this character matches"
    }
  ],
  "identifiedTraits": ["trait1", "trait2", "trait3"],
  "personalitySummary": "Overall personality description based on the analysis"
}

Remember: ONLY return the JSON object, nothing else.
`

    console.log('Sending analysis request to Groq...')
    
    // Get AI analysis
    const { text: analysisResponse } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: `You are a professional personality analyst. Always respond with valid JSON. Be specific and evidence-based in your analysis.

${analysisPrompt}`,
      temperature: 0.7,
      maxTokens: 2000,
    })
    console.log('✅ Groq analysis received')
    console.log('Raw AI response length:', analysisResponse?.length || 0)
    console.log('Raw AI response preview:', analysisResponse?.substring(0, 200) || 'None')

    if (!analysisResponse) {
      throw new Error('No analysis response received from AI service')
    }

    // Clean up the AI response to extract just the JSON
    let cleanResponse = analysisResponse.trim()
    
    // Remove markdown code blocks if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    // Remove any trailing text after the JSON
    const jsonEndIndex = cleanResponse.lastIndexOf('}')
    if (jsonEndIndex > 0) {
      cleanResponse = cleanResponse.substring(0, jsonEndIndex + 1)
    }
    
    console.log('Cleaned response preview:', cleanResponse.substring(0, 200))

    // Parse the cleaned AI response
    let analysisResult
    try {
      analysisResult = JSON.parse(cleanResponse)
      console.log('✅ AI response parsed successfully')
      console.log('Analysis result structure:', {
        hasTopMatches: !!analysisResult.topMatches,
        topMatchesLength: analysisResult.topMatches?.length || 0,
        hasIdentifiedTraits: !!analysisResult.identifiedTraits,
        hasPersonalitySummary: !!analysisResult.personalitySummary
      })
    } catch (parseError) {
      console.error('❌ Failed to parse cleaned AI response:', parseError)
      console.error('Original response:', analysisResponse)
      console.error('Cleaned response:', cleanResponse)
      console.error('Response type:', typeof analysisResponse)
      throw new Error('Invalid AI response format')
    }

    // Validate the analysis result
    if (!analysisResult.topMatches || !Array.isArray(analysisResult.topMatches)) {
      throw new Error('AI response missing required analysis structure')
    }

    console.log('✅ Analysis completed successfully')
    console.log('Top match:', analysisResult.topMatches[0]?.character)

    // Return the analysis result
    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      userData: {
        username: analysisData.username,
        displayName: analysisData.displayName,
        castsAnalyzed: analysisData.casts.length,
        reactionsAnalyzed: analysisData.reactions.length
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Character analysis error:', error)
    
    let errorMessage = 'Failed to analyze personality. Please try again later.'
    if (error instanceof Error) {
      errorMessage = `Analysis Error: ${error.message}`
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
