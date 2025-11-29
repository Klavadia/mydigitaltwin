'use server'

import { Index } from '@upstash/vector'
import Groq from 'groq-sdk'

// Initialize Upstash Vector
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
})

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export async function digitalTwinQuery(question: string) {
  try {
    // Step 1: Query vector database for relevant information
    const vectorResults = await index.query({
      data: question,
      topK: 3,
      includeMetadata: true,
    })

    if (!vectorResults || vectorResults.length === 0) {
      return {
        success: false,
        response: "I don't have specific information about that topic.",
      }
    }

    // Step 2: Extract context from results
    const context = vectorResults
      .map((result) => {
        const metadata = result.metadata as any
        const title = metadata?.title || 'Information'
        const content = metadata?.content || ''
        return `${title}: ${content}`
      })
      .join('\n\n')

    // Step 3: Generate response with Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are an AI digital twin. Answer questions as if you are the person, speaking in first person about your background, skills, and experience.',
        },
        {
          role: 'user',
          content: `Based on the following information about yourself, answer the question.
Speak in first person as if you are describing your own background.

Your Information:
${context}

Question: ${question}

Provide a helpful, professional response:`,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || 'Unable to generate response'

    return {
      success: true,
      response,
      sources: vectorResults.map((r) => ({
        title: (r.metadata as any)?.title,
        score: r.score,
      })),
    }
  } catch (error) {
    console.error('Digital twin query error:', error)
    return {
      success: false,
      response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

export async function loadDigitalTwinData(profileData: any) {
  try {
    const contentChunks = profileData.content_chunks || []

    if (contentChunks.length === 0) {
      return {
        success: false,
        message: 'No content chunks found in profile data',
      }
    }

    // Prepare vectors for upload
    const vectors = contentChunks.map((chunk: any) => ({
      id: chunk.id,
      data: `${chunk.title}: ${chunk.content}`,
      metadata: {
        title: chunk.title,
        type: chunk.type,
        content: chunk.content,
        category: chunk.metadata?.category || '',
        tags: chunk.metadata?.tags || [],
      },
    }))

    // Upload to Upstash Vector
    await index.upsert(vectors)

    return {
      success: true,
      message: `Successfully loaded ${vectors.length} content chunks`,
      count: vectors.length,
    }
  } catch (error) {
    console.error('Load data error:', error)
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

export async function getVectorInfo() {
  try {
    const info = await index.info()
    return {
      success: true,
      info,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
