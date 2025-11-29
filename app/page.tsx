'use client'

import { useState } from 'react'
import { digitalTwinQuery, loadDigitalTwinData, getVectorInfo } from './actions/digital-twin-actions'

export default function Home() {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadStatus, setLoadStatus] = useState('')
  const [vectorInfo, setVectorInfo] = useState<any>(null)

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setLoading(true)
    setResponse('')

    try {
      const result = await digitalTwinQuery(question)
      setResponse(result.response)
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadData = async () => {
    setLoadStatus('Loading...')
    try {
      const res = await fetch('/digitaltwin.json')
      const profileData = await res.json()
      const result = await loadDigitalTwinData(profileData)
      setLoadStatus(result.success ? `✅ ${result.message}` : `❌ ${result.message}`)
    } catch (error) {
      setLoadStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleGetInfo = async () => {
    try {
      const result = await getVectorInfo()
      setVectorInfo(result)
    } catch (error) {
      setVectorInfo({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">🤖 Digital Twin MCP Server</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          AI-powered interview preparation assistant
        </p>

        <div className="mb-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Setup</h2>
          <div className="space-y-4">
            <div>
              <button
                onClick={handleLoadData}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-4"
              >
                Load Digital Twin Data
              </button>
              <button
                onClick={handleGetInfo}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Check Vector DB Status
              </button>
            </div>
            {loadStatus && <p className="text-sm">{loadStatus}</p>}
            {vectorInfo && (
              <pre className="text-xs bg-black text-green-400 p-4 rounded overflow-auto">
                {JSON.stringify(vectorInfo, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Ask Your Digital Twin</h2>
          <form onSubmit={handleQuery} className="space-y-4">
            <div>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about experience, skills, projects, etc..."
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Thinking...' : 'Ask Question'}
            </button>
          </form>

          {response && (
            <div className="mt-6 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2">Response:</h3>
              <p className="whitespace-pre-wrap">{response}</p>
            </div>
          )}
        </div>

        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold mb-2">💡 Try asking:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Tell me about your work experience</li>
            <li>What are your technical skills?</li>
            <li>Describe your key achievements</li>
            <li>What are your salary expectations?</li>
            <li>Tell me about your career goals</li>
          </ul>
        </div>

        <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>MCP Endpoint:</strong> http://localhost:3000/api/mcp
          </p>
          <p className="mt-2">
            Configure VS Code or Claude Desktop to use this endpoint for AI-powered interview
            preparation.
          </p>
        </div>
      </main>
    </div>
  )
}
