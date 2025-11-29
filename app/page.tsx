'use client'

import { useState, useEffect } from 'react'
import { digitalTwinQuery, loadDigitalTwinData, getVectorInfo } from './actions/digital-twin-actions'

export default function Home() {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadStatus, setLoadStatus] = useState('')
  const [vectorInfo, setVectorInfo] = useState<any>(null)
  const [activeSection, setActiveSection] = useState('home')
  const [isSetupOpen, setIsSetupOpen] = useState(false)

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

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'chat', 'setup']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Digital Twin
            </h1>
            <div className="flex gap-8">
              {['home', 'about', 'chat', 'setup'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`capitalize transition-colors ${
                    activeSection === section
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8 inline-block">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-5xl shadow-2xl">
              🤖
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Hello, I&apos;m Your
            <br />
            Digital Twin
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            AI-powered interview preparation assistant. Ask me anything about my experience, skills, and achievements.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => scrollToSection('chat')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all"
            >
              Start Chatting
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all border border-gray-200 dark:border-gray-700"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              About This Digital Twin
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Powered by advanced RAG technology, combining vector search and LLM capabilities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">Vector Search</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Utilizes Upstash Vector DB for semantic search across professional profile data
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">Fast Inference</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Powered by Groq&apos;s lightning-fast LLM inference for instant responses
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105">
              <div className="text-4xl mb-4">🔌</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">MCP Integration</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Model Context Protocol support for VS Code and Claude Desktop integration
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section id="chat" className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Chat with Digital Twin
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Ask me anything about experience, skills, projects, and career goals
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8">
            <form onSubmit={handleQuery} className="space-y-6">
              <div>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask about experience, skills, projects, salary expectations..."
                  className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all text-lg"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? '🤔 Thinking...' : '💬 Ask Question'}
              </button>
            </form>

            {response && (
              <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 rounded-xl border-2 border-blue-200 dark:border-blue-900">
                <h3 className="font-semibold text-lg mb-3 text-blue-900 dark:text-blue-300">Response:</h3>
                <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">{response}</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-8 rounded-2xl border border-purple-200 dark:border-purple-900">
            <h3 className="font-bold text-lg mb-4 text-purple-900 dark:text-purple-300">💡 Sample Questions</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'Tell me about your work experience',
                'What are your technical skills?',
                'Describe your key achievements',
                'What are your salary expectations?',
                'Tell me about your career goals',
                'What projects have you worked on?'
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => setQuestion(q)}
                  className="text-left p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md hover:scale-[1.02] transition-all text-sm text-gray-700 dark:text-gray-300 border border-purple-100 dark:border-purple-900"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Setup Section */}
      <section id="setup" className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Setup & Configuration
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Initialize and manage your digital twin data
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <button
                  onClick={handleLoadData}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  📥 Load Digital Twin Data
                </button>
                <button
                  onClick={handleGetInfo}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  📊 Check Vector DB Status
                </button>
              </div>

              {loadStatus && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-xl border border-blue-200 dark:border-blue-900">
                  <p className="text-center font-medium">{loadStatus}</p>
                </div>
              )}

              {vectorInfo && (
                <div className="bg-gray-900 p-6 rounded-xl overflow-auto">
                  <pre className="text-sm text-green-400 font-mono">
                    {JSON.stringify(vectorInfo, null, 2)}
                  </pre>
                </div>
              )}

              <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-xl border border-indigo-200 dark:border-indigo-900">
                <h3 className="font-bold text-lg mb-3 text-indigo-900 dark:text-indigo-300">🔌 MCP Endpoint</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-mono bg-white dark:bg-gray-800 p-3 rounded">
                  {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/mcp
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure VS Code or Claude Desktop to use this endpoint for AI-powered interview preparation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © 2025 Digital Twin MCP Server • Built with Next.js, Upstash Vector, and Groq
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Powered by RAG technology for intelligent interview preparation
          </p>
        </div>
      </footer>
    </div>
  )
}
