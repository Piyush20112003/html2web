'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, ArrowLeft, Code, FileText, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { safeCopyToClipboard } from '@/lib/clipboard'

const apiExamples = {
  files: {
    endpoint: '/api/files',
    method: 'POST',
    description: '创建 HTML 或 Markdown 文件并返回分享链接',
    request: {
      content: 'string (required)',
      type: 'string (html|markdown, required)',
      title: 'string (optional)',
      filename: 'string (optional)',
      isPublic: 'boolean (default: false)',
      createdBy: 'string (optional, admin ID)'
    },
    example: `{
  "content": "# Hello World\\n\\nThis is **bold** text.",
  "type": "markdown",
  "title": "My Document",
  "filename": "hello-world",
  "isPublic": true
}`,
    response: `{
  "success": true,
  "file": {
    "id": "file123",
    "filename": "hello-world",
    "title": "My Document",
    "type": "markdown",
    "shareUrl": "/preview/share456",
    "isPublic": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "文件创建成功"
}`
  },
  markdown: {
    endpoint: '/api/markdown',
    method: 'POST',
    description: '将 Markdown 转换为 HTML',
    request: {
      markdown: 'string (required)',
      options: {
        enableGfm: 'boolean (default: true)',
        enableHighlight: 'boolean (default: true)', 
        wrapper: 'boolean (default: true)'
      }
    },
    example: `{
  "markdown": "# Hello World\\n\\nThis is **bold** text.",
  "options": {
    "enableGfm": true,
    "enableHighlight": true,
    "wrapper": true
  }
}`,
    response: `{
  "html": "<!DOCTYPE html>...",
  "markdown": "# Hello World...",
  "options": {...},
  "message": "Markdown 转换成功"
}`
  },
  share: {
    endpoint: '/api/share',
    method: 'POST', 
    description: '创建分享链接',
    request: {
      htmlCode: 'string (required)',
      markdownCode: 'string (optional)',
      type: 'string (html|markdown, default: html)'
    },
    example: `{
  "htmlCode": "<h1>Hello</h1>",
  "markdownCode": "# Hello",
  "type": "markdown"
}`,
    response: `{
  "id": "abc12345",
  "type": "markdown", 
  "message": "分享链接生成成功"
}`
  }
}

export default function ApiDocs() {
  const [copiedExample, setCopiedExample] = useState<string | null>(null)

  const handleCopy = async (text: string, exampleId: string) => {
    const success = await safeCopyToClipboard(text)
    if (success) {
      setCopiedExample(exampleId)
      toast.success('已复制到剪贴板')
      setTimeout(() => setCopiedExample(null), 2000)
    } else {
      toast.error('复制失败，请手动复制')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">API 文档</h1>
                  <p className="text-xs text-gray-600">HTML2WEB 接口说明</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            HTML2WEB API 接口文档
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            提供 Markdown 转换和内容分享功能的 RESTful API 接口
          </p>
        </div>

        <Tabs defaultValue="files" className="space-y-6">
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="files" className="flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>文件 API</span>
              </TabsTrigger>
              <TabsTrigger value="markdown" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Markdown API</span>
              </TabsTrigger>
              <TabsTrigger value="share" className="flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>分享 API</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="files">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Code className="w-5 h-5 mr-2" />
                      文件创建 API
                    </CardTitle>
                    <CardDescription>
                      创建 HTML 或 Markdown 文件并自动生成分享链接
                    </CardDescription>
                  </div>
                  <Badge variant="outline">POST</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">接口地址</h4>
                  <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                    {apiExamples.files.endpoint}
                  </code>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">请求参数</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(apiExamples.files.request, null, 2)}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">请求示例</h4>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                      {apiExamples.files.example}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(apiExamples.files.example, 'files-example')}
                    >
                      {copiedExample === 'files-example' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">响应示例</h4>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                      {apiExamples.files.response}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(apiExamples.files.response, 'files-response')}
                    >
                      {copiedExample === 'files-response' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">代码示例</h4>
                  <Tabs defaultValue="javascript" className="w-full">
                    <TabsList>
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                    </TabsList>
                    <TabsContent value="javascript">
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`// 创建文件
async function createFile() {
  const response = await fetch('/api/files', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: '# Hello World\\n\\nThis is **bold** text.',
      type: 'markdown',
      title: 'My Document',
      filename: 'hello-world',
      isPublic: true
    })
  })

  const result = await response.json()
  console.log('分享链接:', result.file.shareUrl)
}`}
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleCopy(`// 创建文件
async function createFile() {
  const response = await fetch('/api/files', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: '# Hello World\\n\\nThis is **bold** text.',
      type: 'markdown',
      title: 'My Document',
      filename: 'hello-world',
      isPublic: true
    })
  })

  const result = await response.json()
  console.log('分享链接:', result.file.shareUrl)
}`, 'files-js')}
                        >
                          {copiedExample === 'files-js' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="python">
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`import requests

# 创建文件
response = requests.post('/api/files', json={
    'content': '# Hello World\\n\\nThis is **bold** text.',
    'type': 'markdown',
    'title': 'My Document',
    'filename': 'hello-world',
    'isPublic': True
})

result = response.json()
print('分享链接:', result['file']['shareUrl'])`}
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleCopy(`import requests

# 创建文件
response = requests.post('/api/files', json={
    'content': '# Hello World\\n\\nThis is **bold** text.',
    'type': 'markdown',
    'title': 'My Document',
    'filename': 'hello-world',
    'isPublic': True
})

result = response.json()
print('分享链接:', result['file']['shareUrl'])`, 'files-python')}
                        >
                          {copiedExample === 'files-python' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="curl">
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`# 创建文件
curl -X POST http://localhost:3000/api/files \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "# Hello World\\n\\nThis is **bold** text.",
    "type": "markdown",
    "title": "My Document",
    "filename": "hello-world",
    "isPublic": true
  }'`}
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleCopy(`# 创建文件
curl -X POST http://localhost:3000/api/files \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "# Hello World\\n\\nThis is **bold** text.",
    "type": "markdown",
    "title": "My Document",
    "filename": "hello-world",
    "isPublic": true
  }'`, 'files-curl')}
                        >
                          {copiedExample === 'files-curl' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="markdown">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Markdown 转换 API
                    </CardTitle>
                    <CardDescription>
                      将 Markdown 文本转换为渲染好的 HTML
                    </CardDescription>
                  </div>
                  <Badge variant="outline">POST</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">接口地址</h4>
                  <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                    {apiExamples.markdown.endpoint}
                  </code>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">请求参数</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(apiExamples.markdown.request, null, 2)}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">请求示例</h4>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
                      {apiExamples.markdown.example}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(apiExamples.markdown.example, 'markdown-example')}
                    >
                      {copiedExample === 'markdown-example' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">响应示例</h4>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
                      {apiExamples.markdown.response}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(apiExamples.markdown.response, 'markdown-response')}
                    >
                      {copiedExample === 'markdown-response' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="share">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Code className="w-5 h-5 mr-2" />
                      内容分享 API
                    </CardTitle>
                    <CardDescription>
                      创建内容分享链接，支持 HTML 和 Markdown
                    </CardDescription>
                  </div>
                  <Badge variant="outline">POST</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">接口地址</h4>
                  <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                    {apiExamples.share.endpoint}
                  </code>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">请求参数</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(apiExamples.share.request, null, 2)}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">请求示例</h4>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
                      {apiExamples.share.example}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(apiExamples.share.example, 'share-example')}
                    >
                      {copiedExample === 'share-example' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">响应示例</h4>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
                      {apiExamples.share.response}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(apiExamples.share.response, 'share-response')}
                    >
                      {copiedExample === 'share-response' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Usage Examples */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>使用示例</CardTitle>
            <CardDescription>
              常见的使用场景和代码示例
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">JavaScript/TypeScript</h4>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
{`// 转换 Markdown
async function convertMarkdown() {
  const response = await fetch('/api/markdown', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      markdown: '# Hello World\\n\\nThis is **bold** text.',
      options: {
        enableGfm: true,
        enableHighlight: true,
        wrapper: true
      }
    })
  })
  
  const result = await response.json()
  console.log(result.html)
}

// 创建分享
async function createShare() {
  const response = await fetch('/api/share', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      htmlCode: '<h1>Hello World</h1>',
      markdownCode: '# Hello World',
      type: 'markdown'
    })
  })
  
  const result = await response.json()
  console.log(\`分享链接: /preview/\${result.id}\`)
}`}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(`// 转换 Markdown
async function convertMarkdown() {
  const response = await fetch('/api/markdown', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      markdown: '# Hello World\\n\\nThis is **bold** text.',
      options: {
        enableGfm: true,
        enableHighlight: true,
        wrapper: true
      }
    })
  })
  
  const result = await response.json()
  console.log(result.html)
}

// 创建分享
async function createShare() {
  const response = await fetch('/api/share', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      htmlCode: '<h1>Hello World</h1>',
      markdownCode: '# Hello World',
      type: 'markdown'
    })
  })
  
  const result = await response.json()
  console.log(\`分享链接: /preview/\${result.id}\`)
}`, 'js-example')}
                >
                  {copiedExample === 'js-example' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">cURL</h4>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
{`# 转换 Markdown
curl -X POST http://localhost:3000/api/markdown \\
  -H "Content-Type: application/json" \\
  -d '{
    "markdown": "# Hello World\\n\\nThis is **bold** text.",
    "options": {
      "enableGfm": true,
      "enableHighlight": true,
      "wrapper": true
    }
  }'

# 创建分享
curl -X POST http://localhost:3000/api/share \\
  -H "Content-Type: application/json" \\
  -d '{
    "htmlCode": "<h1>Hello World</h1>",
    "markdownCode": "# Hello World",
    "type": "markdown"
  }'`}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(`# 转换 Markdown
curl -X POST http://localhost:3000/api/markdown \\
  -H "Content-Type: application/json" \\
  -d '{
    "markdown": "# Hello World\\n\\nThis is **bold** text.",
    "options": {
      "enableGfm": true,
      "enableHighlight": true,
      "wrapper": true
    }
  }'

# 创建分享
curl -X POST http://localhost:3000/api/share \\
  -H "Content-Type: application/json" \\
  -d '{
    "htmlCode": "<h1>Hello World</h1>",
    "markdownCode": "# Hello World",
    "type": "markdown"
  }'`, 'curl-example')}
                >
                  {copiedExample === 'curl-example' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}