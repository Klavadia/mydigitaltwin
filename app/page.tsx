'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [isListening, setIsListening] = useState(false)
  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setLoading(true)
    const currentQuestion = question
    setQuestion('')

    try {
      // Add 1 second delay before getting response
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const result = await digitalTwinQuery(currentQuestion)
      setResponse(result.response)
      setChatHistory(prev => [...prev, { question: currentQuestion, response: result.response }])
      
      // Auto-scroll to bottom with smooth animation
      setTimeout(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTo({
            top: chatMessagesRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 100)
    } catch (error) {
      const errorMsg = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      setResponse(errorMsg)
      setChatHistory(prev => [...prev, { question: currentQuestion, response: errorMsg }])
      
      // Auto-scroll to bottom with smooth animation
      setTimeout(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTo({
            top: chatMessagesRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 100)
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

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }
      
      setQuestion(finalTranscript || interimTranscript)
    }

    recognition.onerror = (event: any) => {
      setIsListening(false)
      if (event.error === 'no-speech') {
        // User didn't speak, just reset
      } else if (event.error === 'network') {
        // Network error, silence it or show user-friendly message
      }
    }

    recognition.onend = () => {
      if (isListening) {
        // Only restart if we're still supposed to be listening
        recognition.start()
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopListening = () => {
    setIsListening(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
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
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 capitalize transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-indigo-500/30 hover:text-white hover:px-4 hover:py-2 hover:rounded-lg"
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
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all hover:scale-105 hover:from-purple-600 hover:to-indigo-600"
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
          <div className="mb-12 text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              About Me
            </h2>
            
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-purple-900/20 rounded-2xl shadow-lg p-8 mb-8 border border-purple-100 dark:border-purple-800/30">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-200 to-indigo-200 dark:from-purple-700 dark:to-indigo-700 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-700 dark:text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    I am passionate about technology, web development, and AI innovation. As a BS Information Technology student at St. Paul University Philippines, my goal is to create innovative solutions that bridge the gap between cutting-edge technology and practical, user-friendly applications.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    With hands-on experience in Laravel, Filament, and modern JavaScript frameworks, combined with a strong foundation in full-stack development, I build responsive, scalable web applications that solve real-world problems. I'm actively exploring AI/ML integration, having built projects with RAG systems and vector databases.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-md p-6 text-center border border-purple-100 dark:border-purple-800/30">
                <h3 className="font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">Education</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">BSIT-4 at Saint Paul University Philippines</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-md p-6 text-center border border-purple-100 dark:border-purple-800/30">
                <h3 className="font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">Specialization</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Full-Stack Web Development & AI Integration</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-md p-6 text-center border border-purple-100 dark:border-purple-800/30">
                <h3 className="font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">Passion</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Technology, Web Design  & AI Innovation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills & Expertise Section */}
      <section id="skills" className="min-h-screen flex items-center justify-center px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Skills & Expertise
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Technical proficiencies and domain expertise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">◆</span>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Frontend Development</h3>
              </div>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> React & Next.js</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> HTML5 & CSS3</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> JavaScript frameworks</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Responsive design</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Accessibility standards</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">◆</span>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Backend Development</h3>
              </div>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Node.js & Express</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> RESTful API design</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Server architecture</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> MVC principles</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> PHP & Laravel</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">◆</span>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Database Management</h3>
              </div>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> MySQL</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> PostgreSQL</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> MongoDB</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Data structure design</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Query optimization</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">◆</span>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Development Tools</h3>
              </div>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Git version control</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Modern IDEs</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> CI/CD basics</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Vercel & Firebase</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Cloud deployment</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">◆</span>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">UI/UX Design</h3>
              </div>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> User experience design</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Visual hierarchy</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Accessibility focus</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Design consistency</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Bootstrap & Tailwind</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">◆</span>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">AI/ML Development</h3>
              </div>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> RAG systems</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Vector databases</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> LLM integration</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Groq API</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Upstash Vector</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section id="projects" className="min-h-screen flex items-center justify-center px-8 py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Featured Projects
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
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

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30 p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="text-4xl">✦</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Digital Twin</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    An AI-powered digital twin portfolio website with RAG (Retrieval-Augmented Generation) capabilities. Features semantic search through vector databases, real-time chat interface powered by Groq API, and MCP integration for GitHub Copilot and Claude Desktop.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md text-xs border border-purple-200 dark:border-purple-700">Next.js</span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md text-xs border border-purple-200 dark:border-purple-700">TypeScript</span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md text-xs border border-purple-200 dark:border-purple-700">Upstash Vector</span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md text-xs border border-purple-200 dark:border-purple-700">Groq API</span>
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
                👤
              </div>
              <div>
                <h3 className="font-bold">Karl's Digital Twin</h3>
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
          <div ref={chatMessagesRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadStatus && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-sm text-center">
                {loadStatus}
              </div>
            )}
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
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl rounded-tl-sm px-4 py-3 border border-purple-100 dark:border-purple-800/30">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`p-3 rounded-full transition-all ${
                  isListening 
                    ? 'bg-red-500 animate-pulse' 
                    : 'bg-purple-500 hover:bg-purple-600'
                } text-white`}
                disabled={loading}
                title={isListening ? 'Stop recording' : 'Start voice input'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </button>
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
