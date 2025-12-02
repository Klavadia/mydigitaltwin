import { NextRequest, NextResponse } from 'next/server'
import { digitalTwinQuery } from '@/app/actions/digital-twin-actions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jsonrpc, method, params, id } = body

    // Handle JSON-RPC 2.0 protocol
    if (jsonrpc !== '2.0') {
      return NextResponse.json({
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request',
        },
        id: id || null,
      })
    }

    // Handle different MCP methods
    switch (method) {
      case 'initialize':
        return NextResponse.json({
          jsonrpc: '2.0',
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: 'Digital Twin MCP Server',
              version: '1.0.0',
            },
          },
          id,
        })

      case 'ping':
        return NextResponse.json({
          jsonrpc: '2.0',
          result: {
            status: 'ok',
            message: 'Digital Twin MCP Server is running',
          },
          id,
        })

      case 'tools/call':
        const toolName = params?.name
        const toolArgs = params?.arguments || {}
        
        if (toolName === 'digital_twin_query') {
          const question = toolArgs?.question
          
          if (!question) {
            return NextResponse.json({
              jsonrpc: '2.0',
              error: {
                code: -32602,
                message: 'Invalid params: question is required',
              },
              id,
            })
          }

          const result = await digitalTwinQuery(question)

          return NextResponse.json({
            jsonrpc: '2.0',
            result: {
              content: [
                {
                  type: 'text',
                  text: result.response || 'No response available',
                },
              ],
            },
            id,
          })
        }

        return NextResponse.json({
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: `Unknown tool: ${toolName}`,
          },
          id,
        })

      case 'query':
      case 'digital_twin_query':
        const question = params?.question || params?.arguments?.question
        
        if (!question) {
          return NextResponse.json({
            jsonrpc: '2.0',
            error: {
              code: -32602,
              message: 'Invalid params: question is required',
            },
            id,
          })
        }

        const result = await digitalTwinQuery(question)

        return NextResponse.json({
          jsonrpc: '2.0',
          result,
          id,
        })

      case 'tools/list':
      case 'list_tools':
        return NextResponse.json({
          jsonrpc: '2.0',
          result: {
            tools: [
              {
                name: 'digital_twin_query',
                description: 'Query the digital twin for professional information about Karl, including work experience, skills, education, and career background',
                inputSchema: {
                  type: 'object',
                  properties: {
                    question: {
                      type: 'string',
                      description: 'The question to ask about professional background',
                    },
                  },
                  required: ['question'],
                },
              },
            ],
          },
          id,
        })

      default:
        return NextResponse.json({
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: `Method not found: ${method}`,
          },
          id,
        })
    }
  } catch (error) {
    console.error('MCP endpoint error:', error)
    return NextResponse.json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal error',
        data: error instanceof Error ? error.message : 'Unknown error',
      },
      id: null,
    })
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Digital Twin MCP Server',
    version: '1.0.0',
    description: 'MCP server for AI-powered interview preparation using RAG',
    status: 'running',
  })
}
