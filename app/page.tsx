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

    const currentQuestion = question
    setQuestion('')
    
    // Add user message immediately
    setChatHistory(prev => [...prev, { question: currentQuestion, response: '' }])
    setLoading(true)

    // Auto-scroll to show user message
    setTimeout(() => {
      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTo({
          top: chatMessagesRef.current.scrollHeight,
          behavior: 'smooth'
        })
      }
    }, 100)

    try {
      const result = await digitalTwinQuery(currentQuestion)
      setResponse(result.response)
      // Update the last message with the response
      setChatHistory(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { question: currentQuestion, response: result.response }
        return updated
      })
      
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
      // Update the last message with error
      setChatHistory(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { question: currentQuestion, response: errorMsg }
        return updated
      })
      
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex justify-between items-center">
            <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Karl Lavadia
            </h1>
            <div className="hidden md:flex gap-4 lg:gap-8">
              {['home', 'about', 'skills', 'projects', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 capitalize transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-indigo-500/30 hover:text-white hover:px-4 hover:py-2 hover:rounded-lg"
                >
                  {section}
                </button>
              ))}
            </div>
            {/* Mobile menu button */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="md:hidden bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Chat
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center md:text-left order-2 md:order-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Karl Francis L. Lavadia
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
                Full-stack developer passionate about building scalable web applications and innovative solutions. Specializing in modern technologies and creating seamless user experiences from front-end to back-end.
              </p>
              <button
                onClick={() => scrollToSection('about')}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-medium hover:shadow-lg transition-all hover:scale-105 hover:from-purple-600 hover:to-indigo-600 text-sm sm:text-base"
              >
                Learn More
              </button>
            </div>
            <div className="flex justify-center order-1 md:order-2">
              <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] overflow-hidden rounded-3xl shadow-2xl ring-4 ring-purple-200 dark:ring-purple-800">
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
      <section id="about" className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-8 sm:mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              About Me
            </h2>
            
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-purple-900/20 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-purple-100 dark:border-purple-800/30">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-200 to-indigo-200 dark:from-purple-700 dark:to-indigo-700 flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-700 dark:text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 leading-relaxed">
                    I am passionate about technology, web development, and AI innovation. As a BS Information Technology student at St. Paul University Philippines, my goal is to create innovative solutions that bridge the gap between cutting-edge technology and practical, user-friendly applications.
                  </p>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    With hands-on experience in Laravel, Filament, and modern JavaScript frameworks, combined with a strong foundation in full-stack development, I build responsive, scalable web applications that solve real-world problems. I'm actively exploring AI/ML integration, having built projects with RAG systems and vector databases.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-md p-4 sm:p-6 text-center border border-purple-100 dark:border-purple-800/30">
                <h3 className="text-sm sm:text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">Education</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">BSIT-4 at Saint Paul University Philippines</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-md p-4 sm:p-6 text-center border border-purple-100 dark:border-purple-800/30">
                <h3 className="text-sm sm:text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">Specialization</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Full-Stack Web Development & AI Integration</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-md p-4 sm:p-6 text-center border border-purple-100 dark:border-purple-800/30 sm:col-span-2 md:col-span-1">
                <h3 className="text-sm sm:text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">Passion</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Technology, Web Design  & AI Innovation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills & Expertise Section */}
      <section id="skills" className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-8 sm:mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Skills & Expertise
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
              Technical proficiencies and domain expertise
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">✦</span>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Frontend Development</h3>
              </div>
              <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> React & Next.js</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> HTML5 & CSS3</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> TypeScript & JavaScript</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Responsive design</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Accessibility standards</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">✦</span>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Backend Development</h3>
              </div>
              <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> PHP & Laravel</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Node.js & Express</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> RESTful API design</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> Server architecture</li>
                <li className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"><span className="text-purple-600 dark:text-purple-400">✦</span> MVC principles</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">✦</span>
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
                <span className="text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">✦</span>
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
                <span className="text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">✦</span>
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
                <span className="text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">✦</span>
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
      <section id="projects" className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-8 sm:mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Featured Projects
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
              Showcasing innovative solutions and technical implementations
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30 p-4 sm:p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-2xl sm:text-3xl lg:text-4xl">✦</div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 text-gray-800 dark:text-white">Paulinian Student Council E-Portfolio and Ranking System</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                    A digital portfolio and performance evaluation platform for student council members. Tracks activities, achievements, and contributions with an intelligent ranking system to recognize outstanding performance and leadership.
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    <span className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md text-xs border border-purple-200 dark:border-purple-700">PHP</span>
                    <span className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md text-xs border border-purple-200 dark:border-purple-700">Laravel</span>
                    <span className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md text-xs border border-purple-200 dark:border-purple-700">MySQL</span>
                  </div>
                  <a 
                    href="https://github.com/Klavadia/eportfolio" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all text-xs sm:text-sm font-medium hover:scale-105"
                  >
                    View Project
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30 p-4 sm:p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-2xl sm:text-3xl lg:text-4xl">✦</div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 text-gray-800 dark:text-white">Digital Twin</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                    An AI-powered digital twin portfolio website with RAG (Retrieval-Augmented Generation) capabilities. Features semantic search through vector databases, real-time chat interface powered by Groq API, and MCP integration for GitHub Copilot and Claude Desktop.
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    <span className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md text-xs border border-purple-200 dark:border-purple-700">Next.js</span>
                    <span className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md text-xs border border-purple-200 dark:border-purple-700">TypeScript</span>
                    <span className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md text-xs border border-purple-200 dark:border-purple-700">Upstash Vector</span>
                    <span className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md text-xs border border-purple-200 dark:border-purple-700">Groq API</span>
                  </div>
                  <a 
                    href="https://mydigitaltwin-olive.vercel.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all text-xs sm:text-sm font-medium hover:scale-105"
                  >
                    View Project
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-8 sm:mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Get In Touch
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
              Let's connect and discuss opportunities
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <a 
                href="mailto:zkaelnich@gmail.com"
                className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30 p-4 sm:p-6 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-1">Email</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Get in touch</p>
                  </div>
                </div>
              </a>

              <a 
                href="https://github.com/Klavadia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30 p-4 sm:p-6 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-1">GitHub</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">View repositories</p>
                  </div>
                </div>
              </a>

              <a 
                href="https://www.linkedin.com/in/karl-lavadia-9a6212385" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30 p-4 sm:p-6 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-1">LinkedIn</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Connect with me</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 text-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Powered By Section */}
          <div className="mb-8">
            <h3 className="text-center text-sm font-semibold text-purple-300 uppercase tracking-wider mb-6">
              Powered By
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-all">
                <h4 className="font-bold text-base mb-1">Next.js 15</h4>
                <p className="text-xs text-purple-200">React Framework</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-all">
                <h4 className="font-bold text-base mb-1">Groq</h4>
                <p className="text-xs text-purple-200">AI Inference</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-all">
                <h4 className="font-bold text-base mb-1">Upstash Vector</h4>
                <p className="text-xs text-purple-200">RAG Database</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-all">
                <h4 className="font-bold text-base mb-1">Vercel</h4>
                <p className="text-xs text-purple-200">Deployment</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-all sm:col-span-3 md:col-span-1">
                <h4 className="font-bold text-base mb-1">TypeScript</h4>
                <p className="text-xs text-purple-200">Type Safety</p>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="text-center pt-6 border-t border-purple-700/50">
            <p className="text-sm text-purple-200">
              © 2024 Karl Lavadia. Powered by Upstash Vector & Groq.
            </p>
          </div>
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
        <div className="fixed bottom-0 right-0 left-0 sm:bottom-6 sm:right-6 sm:left-auto z-50 w-full sm:w-96 h-[100dvh] sm:h-[600px] bg-white dark:bg-gray-900 sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col border border-purple-200 dark:border-purple-800">
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
                  {chat.response && (
                    <div className="flex justify-start">
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%] border border-purple-100 dark:border-purple-800/30">
                        <p className="text-sm whitespace-pre-wrap">{chat.response}</p>
                      </div>
                    </div>
                  )}
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
