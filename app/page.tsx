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
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatHistory, setChatHistory] = useState<Array<{question: string, response: string}>>([])
  const [isSetupOpen, setIsSetupOpen] = useState(false)

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setLoading(true)
    const currentQuestion = question
    setQuestion('')

    try {
      const result = await digitalTwinQuery(currentQuestion)
      setResponse(result.response)
      setChatHistory(prev => [...prev, { question: currentQuestion, response: result.response }])
    } catch (error) {
      const errorMsg = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      setResponse(errorMsg)
      setChatHistory(prev => [...prev, { question: currentQuestion, response: errorMsg }])
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
      const sections = ['home', 'about']
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-purple-100 dark:border-purple-900/30">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Karl Lavadia
            </h1>
            <div className="flex gap-8">
              {['home', 'about', 'skills', 'projects'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 capitalize transition-colors"
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center pt-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Karl Francis L. Lavadia
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Full-stack developer passionate about building scalable web applications and innovative solutions. Specializing in modern technologies and creating seamless user experiences from front-end to back-end.
              </p>
              <button
                onClick={() => scrollToSection('about')}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all hover:scale-105"
              >
                Learn More
              </button>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="w-[28rem] h-[28rem] overflow-hidden rounded-3xl shadow-2xl ring-4 ring-purple-200 dark:ring-purple-800">
                <img
                  src="/profile.webp"
                  alt="Karl Lavadia"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen flex items-center justify-center px-8 py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">✦</span>
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">About Me</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
              AI-powered digital twin system for intelligent interview preparation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all">
              <div className="text-4xl mb-3">🧠</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Vector Search</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Semantic search powered by Upstash Vector database
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Fast Inference</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lightning-fast responses with Groq LLM
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all">
              <div className="text-4xl mb-3">🔌</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">MCP Integration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Seamless AI assistant integration
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Skills & Expertise Section */}
      <section id="skills" className="min-h-screen flex items-center justify-center px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">✦</span>
              <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">Skills & Expertise</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
              Technical proficiencies and domain expertise
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all">
              <div className="text-3xl mb-3">💻</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Frontend Development</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                React, Next.js, TypeScript, and modern CSS frameworks
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs">React</span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs">Next.js</span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs">TypeScript</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all">
              <div className="text-3xl mb-3">⚙️</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Backend Development</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Node.js, Express, Python, and RESTful API design
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs">Node.js</span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs">Python</span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs">REST APIs</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all">
              <div className="text-3xl mb-3">🗄️</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Database Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                PostgreSQL, MongoDB, and vector databases
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs">PostgreSQL</span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs">MongoDB</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all">
              <div className="text-3xl mb-3">🛠️</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Development Tools</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Git, Docker, CI/CD, and cloud deployment
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs">Git</span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs">Docker</span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs">Vercel</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section id="projects" className="min-h-screen flex items-center justify-center px-8 py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">✦</span>
              <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">Featured Projects</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
              Showcasing innovative solutions and technical implementations
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30 p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="text-4xl">✦</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Paulinian Student Council E-Portfolio and Ranking System</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    A digital portfolio and performance evaluation platform for student council members. Tracks activities, achievements, and contributions with an intelligent ranking system to recognize outstanding performance and leadership.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md text-xs border border-purple-200 dark:border-purple-700">PHP</span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md text-xs border border-purple-200 dark:border-purple-700">Laravel</span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md text-xs border border-purple-200 dark:border-purple-700">MySQL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <p className="text-purple-200">
            © 2024 Karl Lavadia. Powered by Upstash Vector & Groq.
          </p>
        </div>
      </footer>

      {/* Floating Chat Widget */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Chat Modal */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col border border-purple-200 dark:border-purple-800">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <h3 className="font-bold">AI Assistant</h3>
                <p className="text-xs text-purple-100">Ask me anything</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <div className="text-4xl mb-4">👋</div>
                <p className="mb-4">Hi! I'm your Digital Twin.</p>
                <p className="text-sm mb-6">Ask me about experience, skills, or projects!</p>
                <div className="space-y-2">
                  {[
                    'Tell me about your experience',
                    'What are your skills?',
                    'What are your career goals?'
                  ].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setQuestion(q)}
                      className="block w-full text-left p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatHistory.map((chat, idx) => (
                <div key={idx} className="space-y-2">
                  {/* User Question */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                      <p className="text-sm">{chat.question}</p>
                    </div>
                  </div>
                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%] border border-purple-100 dark:border-purple-800/30">
                      <p className="text-sm whitespace-pre-wrap">{chat.response}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-purple-200 dark:border-purple-800">
            <form onSubmit={handleQuery} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 p-3 border border-purple-300 dark:border-purple-700 rounded-full bg-purple-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-3 rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
