'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, Download, ArrowLeft, Eye, Code, Share2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { safeCopyToClipboard } from '@/lib/clipboard'
import Link from 'next/link'

export default function PreviewPage() {
  const params = useParams()
  const id = params.id as string
  
  const [htmlCode, setHtmlCode] = useState('')
  const [markdownCode, setMarkdownCode] = useState('')
  const [contentType, setContentType] = useState<'html' | 'markdown'>('html')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCode, setShowCode] = useState(false)

  useEffect(() => {
    const fetchShare = async () => {
      try {
        const response = await fetch(`/api/share?id=${id}`)
        
        if (response.ok) {
          const data = await response.json()
          setHtmlCode(data.htmlCode)
          setMarkdownCode(data.markdownCode || '')
          setContentType(data.type || 'html')
        } else {
          const errorData = await response.json()
          setError(errorData.error || '加载失败')
        }
      } catch (error) {
        setError('网络错误')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchShare()
    }
  }, [id])

  const handleCopyCode = async () => {
    const code = contentType === 'markdown' ? markdownCode : htmlCode
    if (!code) return
    
    const success = await safeCopyToClipboard(code)
    if (success) {
      toast.success('代码已复制到剪贴板')
    } else {
      toast.error('复制失败，请手动复制')
    }
  }

  const handleCopyLink = async () => {
    const success = await safeCopyToClipboard(window.location.href)
    if (success) {
      toast.success('链接已复制到剪贴板')
    } else {
      toast.error('复制失败，请手动复制')
    }
  }

  const handleDownload = () => {
    const code = contentType === 'markdown' ? markdownCode : htmlCode
    if (!code) return
    
    const blob = new Blob([code], { 
      type: contentType === 'markdown' ? 'text/markdown' : 'text/html' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = contentType === 'markdown' ? 'document.md' : 'index.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('文件已下载')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Code className="w-6 h-6 text-violet-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">正在加载预览</h2>
          <p className="text-gray-600">请稍候，正在准备您的内容...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">😞</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">加载失败</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">HTML2WEB</h1>
                  <p className="text-xs text-gray-600">分享预览</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                <Eye className="w-3 h-3 mr-1" />
                预览模式
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                {contentType === 'markdown' ? <FileText className="w-3 h-3 mr-1" /> : <Code className="w-3 h-3 mr-1" />}
                {contentType === 'markdown' ? 'Markdown' : 'HTML'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCode(!showCode)}
                className="hover:bg-gray-50"
              >
                <Code className="w-4 h-4 mr-1" />
                {showCode ? '隐藏代码' : '显示代码'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="hover:bg-gray-50"
              >
                <Share2 className="w-4 h-4 mr-1" />
                分享
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-1" />
                下载
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        <div className={`grid gap-4 ${showCode ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} ${showCode ? 'xl:grid-cols-2' : 'xl:grid-cols-1'}`}>
          {/* Preview */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    {contentType === 'markdown' ? 'Markdown 渲染' : '页面预览'}
                  </h2>
                </div>
                <Badge variant="outline" className="bg-white/80 backdrop-blur-sm text-xs">
                  实时预览
                </Badge>
              </div>
            </div>
            <div className="h-[60vh] sm:h-[70vh] bg-white">
              {contentType === 'markdown' ? (
                <div className="w-full h-full overflow-auto">
                  <div className="max-w-none">
                    <div className="prose prose-sm sm:prose-lg max-w-none p-4 sm:p-8 prose-headings:text-gray-900 prose-p:text-gray-700 prose-code:text-pink-600 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-l-4 prose-blockquote:border-violet-500 prose-blockquote:bg-violet-50 prose-blockquote:p-4 prose-blockquote:rounded-lg prose-table:border prose-table:border-gray-200 prose-th:bg-gray-50 prose-td:border prose-td:border-gray-200 prose-img:rounded-lg prose-img:shadow-lg hover:prose-img:shadow-xl transition-shadow duration-300">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight, rehypeRaw]}
                      >
                        {markdownCode}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <iframe
                  srcDoc={htmlCode}
                  className="w-full h-full border-0"
                  title="Preview"
                  sandbox="allow-scripts"
                />
              )}
            </div>
          </div>

          {/* Code View */}
          {showCode && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                      {contentType === 'markdown' ? <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-white" /> : <Code className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold text-white">
                      {contentType === 'markdown' ? 'Markdown 源码' : 'HTML 源码'}
                    </h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
                  >
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">复制代码</span>
                    <span className="sm:hidden">复制</span>
                  </Button>
                </div>
              </div>
              <div className="h-[60vh] sm:h-[70vh] bg-gray-900">
                <pre className="w-full h-full p-4 sm:p-6 text-gray-100 overflow-auto text-xs sm:text-sm font-mono leading-relaxed">
                  <code className={`language-${contentType === 'markdown' ? 'markdown' : 'html'}`}>
                    {contentType === 'markdown' ? markdownCode : htmlCode}
                  </code>
                </pre>
              </div>
            </div>
          )}
        </div>

        {!showCode && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setShowCode(true)}
              className="bg-white/80 backdrop-blur-sm hover:bg-white border-gray-200 shadow-sm"
            >
              <Code className="w-4 h-4 mr-2" />
              查看源代码
            </Button>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-violet-100 to-indigo-100 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">分享信息</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                    <span>
                      分享ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{id}</code>
                    </span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 w-fit">
                      {contentType === 'markdown' ? <FileText className="w-3 h-3 mr-1" /> : <Code className="w-3 h-3 mr-1" />}
                      {contentType === 'markdown' ? 'Markdown' : 'HTML'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium">
                  通过 HTML2WEB 创建
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  粘贴代码，分享创意！
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}