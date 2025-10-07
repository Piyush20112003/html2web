'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, Play, Share2, Download, Code, Eye, Sparkles, FileText, Loader2, FileTextIcon, Edit3, Columns } from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { safeCopyToClipboard } from '@/lib/clipboard'
import Link from 'next/link'

export default function Home() {
  const [activeTab, setActiveTab] = useState('html')
  const [htmlCode, setHtmlCode] = useState('')
  const [markdownCode, setMarkdownCode] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEditorLoading, setIsEditorLoading] = useState(false)
  const [codeStats, setCodeStats] = useState({ lines: 0, chars: 0, size: '0 KB' })
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'both'>('both')
  
  // 防抖定时器引用
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // 初始化代码统计
  useEffect(() => {
    updateCodeStats(getCurrentCode())
  }, [activeTab])
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const sampleHtmlCode = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>示例页面</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: white;
            color: #667eea;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin-top: 20px;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 欢迎使用 HTML2WEB</h1>
        <p>粘贴你的 HTML 代码，实时预览并分享你的创意！</p>
        <a href="#" class="button">开始体验</a>
    </div>
</body>
</html>`

  const sampleMarkdownCode = `# 🎉 欢迎使用 HTML2WEB

## 支持 Markdown 渲染

这是一个功能强大的 **Markdown 编辑器**，支持：

### 🚀 核心功能
- **实时预览** - 即时查看渲染效果
- **语法高亮** - 代码块高亮显示
- **GitHub 风格** - 支持 GFM 语法
- **表格支持** - 完美支持表格渲染

### 📝 Markdown 语法示例

#### 文本格式
**粗体文本** 和 *斜体文本* 以及 ~~删除线~~

#### 代码示例
\`\`\`javascript
function hello() {
  console.log("Hello, HTML2WEB!");
}
\`\`\`

#### 表格示例
| 功能 | 支持 | 说明 |
|------|------|------|
| HTML | ✅ | 完整支持 |
| Markdown | ✅ | 实时渲染 |
| 分享 | ✅ | 一键分享 |

#### 列表示例
1. 有序列表项 1
2. 有序列表项 2
3. 有序列表项 3

- 无序列表项 A
- 无序列表项 B
- 无序列表项 C

> 💡 **提示**: 你可以粘贴任何 Markdown 内容，系统会自动渲染并生成分享链接！

---

### 🔗 链接和图片
[访问官网](https://html2web.com)

![示例图片](https://via.placeholder.com/300x200/667eea/ffffff?text=HTML2WEB)

---

*让创意触达世界* 🌍`

  // 更新代码统计信息
  const updateCodeStats = useCallback((code: string) => {
    const lines = code.split('\n').length
    const chars = code.length
    const size = chars > 1024 ? `${(chars / 1024).toFixed(1)} KB` : `${chars} B`
    
    setCodeStats({ lines, chars, size })
  }, [])

  const getCurrentCode = useCallback(() => activeTab === 'html' ? htmlCode : markdownCode, [activeTab, htmlCode, markdownCode])
  const getCurrentSample = useCallback(() => activeTab === 'html' ? sampleHtmlCode : sampleMarkdownCode, [activeTab])
  const setCurrentCode = useCallback((code: string) => {
    setIsEditorLoading(true)
    
    // 使用 requestAnimationFrame 优化大文本输入性能
    requestAnimationFrame(() => {
      if (activeTab === 'html') {
        setHtmlCode(code)
      } else {
        setMarkdownCode(code)
      }
      
      // 更新代码统计
      updateCodeStats(code)
      
      // 延迟重置加载状态
      setTimeout(() => setIsEditorLoading(false), 100)
    })
  }, [activeTab, updateCodeStats])

  // 优化的代码处理函数
  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const code = e.target.value
    
    // 对于超长代码（>50KB），使用防抖处理
    if (code.length > 50000) {
      // 清除之前的定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      
      // 设置新的防抖定时器
      debounceTimerRef.current = setTimeout(() => {
        setCurrentCode(code)
        debounceTimerRef.current = null
      }, 300)
    } else {
      // 小文件直接处理
      setCurrentCode(code)
    }
  }, [setCurrentCode])

  const handleCopyCode = async () => {
    const code = getCurrentCode()
    if (!code.trim()) {
      toast.error('没有可复制的内容')
      return
    }
    
    const success = await safeCopyToClipboard(code)
    if (success) {
      toast.success('内容已复制到剪贴板')
    } else {
      toast.error('复制失败，请手动复制')
    }
  }

  // 分享功能
  const handleShare = async () => {
    const code = getCurrentCode()
    if (!code.trim()) {
      toast.error(`请先输入 ${activeTab === 'html' ? 'HTML' : 'Markdown'} 代码`)
      return
    }
    
    // 检查文件大小限制
    if (code.length > 1000000) { // 1MB 限制
      toast.error('文件过大，请控制在 1MB 以内')
      return
    }
    
    if (code.length > 500000) { // 500KB 警告
      toast.warning('文件较大，上传可能需要一些时间...')
    }
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          htmlCode: activeTab === 'html' ? code : markdownToHtml(code),
          markdownCode: activeTab === 'markdown' ? code : null,
          type: activeTab
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setShareUrl(`${window.location.origin}/preview/${data.id}`)
        toast.success('分享链接已生成')
      } else {
        toast.error('分享失败')
      }
    } catch (error) {
      toast.error('分享失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyShareUrl = async () => {
    if (!shareUrl) return
    
    const success = await safeCopyToClipboard(shareUrl)
    if (success) {
      toast.success('分享链接已复制')
    } else {
      toast.error('复制失败，请手动复制')
    }
  }

  const handleDownload = () => {
    const code = getCurrentCode()
    if (!code.trim()) {
      toast.error('没有可下载的内容')
      return
    }
    
    const blob = new Blob([code], { 
      type: activeTab === 'html' ? 'text/html' : 'text/markdown' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = activeTab === 'html' ? 'index.html' : 'document.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('文件已下载')
  }

  const markdownToHtml = (markdown: string): string => {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Document</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #fff;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
        }
        h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
        h3 { font-size: 1.25em; }
        code {
            background: #f6f8fa;
            border-radius: 3px;
            padding: 0.2em 0.4em;
            font-size: 85%;
        }
        pre {
            background: #f6f8fa;
            border-radius: 6px;
            padding: 16px;
            overflow: auto;
        }
        pre code {
            background: transparent;
            padding: 0;
        }
        blockquote {
            border-left: 4px solid #dfe2e5;
            padding: 0 16px;
            color: #6a737d;
            margin: 0 0 16px 0;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
        }
        table th, table td {
            border: 1px solid #dfe2e5;
            padding: 6px 13px;
        }
        table th {
            background: #f6f8fa;
            font-weight: 600;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        a {
            color: #0366d6;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="markdown-body">
        <!-- Markdown content would be rendered here -->
        <p><strong>Note:</strong> This is a placeholder. The actual markdown rendering happens in the preview.</p>
    </div>
</body>
</html>`
  }

  const renderPreview = () => {
    const code = getCurrentCode()
    if (!code.trim()) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>预览区域</p>
            <p className="text-sm">粘贴内容后即可查看效果</p>
          </div>
        </div>
      )
    }

    if (activeTab === 'html') {
      return (
        <iframe
          srcDoc={code}
          className="w-full h-full border-0"
          title="HTML Preview"
          sandbox="allow-scripts"
          loading="lazy"
        />
      )
    } else {
      // 对于超长 Markdown，使用虚拟滚动优化
      if (code.length > 100000) {
        return (
          <div className="w-full h-full overflow-auto p-6 bg-white">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                <p className="text-lg font-semibold text-gray-700 mb-2">大文件预览</p>
                <p className="text-sm text-gray-500 mb-4">
                  文件过大 ({codeStats.size})，为提升性能已简化渲染
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // 在新窗口中完整渲染
                    const newWindow = window.open('', '_blank')
                    if (newWindow) {
                      newWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>Markdown Preview</title>
                          <style>
                            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
                            ${typeof window !== 'undefined' && typeof document !== 'undefined' ? document.querySelector('#__next')?.innerHTML?.match(/\/\*[\s\S]*?\*\//)?.[0] || '' : ''}
                          </style>
                        </head>
                        <body>
                          <div class="markdown-body">
                            ${code}
                          </div>
                        </body>
                        </html>
                      `)
                      newWindow.document.close()
                    }
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  在新窗口中查看
                </Button>
              </div>
            </div>
          </div>
        )
      }

      return (
        <div className="w-full h-full overflow-auto p-6 bg-white">
          <div className="markdown-body prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
            >
              {code}
            </ReactMarkdown>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HTML2WEB</h1>
                <p className="text-xs text-gray-600">粘贴代码，分享创意！</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                <Sparkles className="w-3 h-3 mr-1" />
                AI 友好
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                <FileText className="w-3 h-3 mr-1" />
                Markdown
              </Badge>
              <Badge variant="outline" className="bg-gray-50 border-gray-200">实时预览</Badge>
              <Link href="/api-docs">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  API 文档
                </Button>
              </Link>
              <Link href="/test-large">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  性能测试
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            粘贴代码，分享无限创意！
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            支持 HTML 和 Markdown，实时预览，一键分享。完美适配 AI 生成的内容。
          </p>
        </div>

        {/* Mode Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="html" className="flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>HTML</span>
              </TabsTrigger>
              <TabsTrigger value="markdown" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Markdown</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg border p-1">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'edit'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Edit3 className="w-4 h-4 inline mr-2" />
              编辑
            </button>
            <button
              onClick={() => setViewMode('both')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'both'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Columns className="w-4 h-4 inline mr-2" />
              分屏
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'preview'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              预览
            </button>
          </div>
        </div>

        {/* Dynamic Layout based on viewMode */}
        {viewMode === 'both' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Code Editor */}
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      {activeTab === 'html' ? <Code className="w-5 h-5 mr-2" /> : <FileText className="w-5 h-5 mr-2" />}
                      {activeTab === 'html' ? 'HTML 编辑器' : 'Markdown 编辑器'}
                    </CardTitle>
                    <CardDescription>
                      粘贴你的 {activeTab === 'html' ? 'HTML' : 'Markdown'} 代码
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentCode(getCurrentSample())}
                      disabled={isEditorLoading}
                    >
                      示例代码
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCode}
                      disabled={!getCurrentCode().trim() || isEditorLoading}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      复制
                    </Button>
                  </div>
                </div>
                {/* 代码统计信息 */}
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                  <span>行数: {codeStats.lines}</span>
                  <span>字符: {codeStats.chars}</span>
                  <span>大小: {codeStats.size}</span>
                  {codeStats.chars > 50000 && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <FileTextIcon className="w-3 h-3 mr-1" />
                      大文件
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 relative overflow-hidden">
                {isEditorLoading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-600">处理中...</span>
                    </div>
                  </div>
                )}
                <Textarea
                  value={getCurrentCode()}
                  onChange={handleCodeChange}
                  placeholder={`在这里粘贴你的 ${activeTab === 'html' ? 'HTML' : 'Markdown'} 代码...`}
                  className="h-full border-0 resize-none font-mono text-sm focus-visible:ring-0 overflow-auto"
                  style={{
                    scrollBehavior: 'smooth',
                    fontSize: codeStats.chars > 100000 ? '12px' : '14px'
                  }}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      实时预览
                    </CardTitle>
                    <CardDescription>查看你的内容效果</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      disabled={!getCurrentCode().trim()}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      下载
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                {renderPreview()}
              </CardContent>
            </Card>
          </div>
        )}

        {viewMode === 'edit' && (
          <Card className="h-[600px] flex flex-col max-w-4xl mx-auto w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    {activeTab === 'html' ? <Code className="w-5 h-5 mr-2" /> : <FileText className="w-5 h-5 mr-2" />}
                    {activeTab === 'html' ? 'HTML 编辑器' : 'Markdown 编辑器'}
                  </CardTitle>
                  <CardDescription>
                    粘贴你的 {activeTab === 'html' ? 'HTML' : 'Markdown'} 代码
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentCode(getCurrentSample())}
                    disabled={isEditorLoading}
                  >
                    示例代码
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    disabled={!getCurrentCode().trim() || isEditorLoading}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    复制
                  </Button>
                </div>
              </div>
              {/* 代码统计信息 */}
              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                <span>行数: {codeStats.lines}</span>
                <span>字符: {codeStats.chars}</span>
                <span>大小: {codeStats.size}</span>
                {codeStats.chars > 50000 && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <FileTextIcon className="w-3 h-3 mr-1" />
                    大文件
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative overflow-hidden">
              {isEditorLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">处理中...</span>
                  </div>
                </div>
              )}
              <Textarea
                value={getCurrentCode()}
                onChange={handleCodeChange}
                placeholder={`在这里粘贴你的 ${activeTab === 'html' ? 'HTML' : 'Markdown'} 代码...`}
                className="h-full border-0 resize-none font-mono text-sm focus-visible:ring-0 overflow-auto"
                style={{
                  scrollBehavior: 'smooth',
                  fontSize: codeStats.chars > 100000 ? '12px' : '14px'
                }}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
            </CardContent>
          </Card>
        )}

        {viewMode === 'preview' && (
          <Card className="h-[600px] flex flex-col max-w-4xl mx-auto w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    实时预览
                  </CardTitle>
                  <CardDescription>查看你的内容效果</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={!getCurrentCode().trim()}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    下载
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              {renderPreview()}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={handleShare}
            disabled={!getCurrentCode().trim() || isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Share2 className="w-5 h-5 mr-2" />
            {isLoading ? '生成中...' : '生成分享链接'}
          </Button>
        </div>

        {/* Share Result */}
        {shareUrl && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-700 mb-1">分享链接已生成！</h3>
                  <p className="text-sm text-gray-600 font-mono break-all">{shareUrl}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyShareUrl}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  复制链接
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-5 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">AI 友好</h3>
              <p className="text-sm text-gray-600">
                完美支持 AI 生成的内容
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">实时预览</h3>
              <p className="text-sm text-gray-600">
                即时查看渲染效果
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Markdown</h3>
              <p className="text-sm text-gray-600">
                支持 GFM 语法高亮
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">一键分享</h3>
              <p className="text-sm text-gray-600">
                生成专属链接分享
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold mb-2">性能优化</h3>
              <p className="text-sm text-gray-600">
                支持大文件流畅编辑
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">HTML2WEB - 让创意触达世界</p>
            <p className="text-sm">
              支持 HTML、Markdown、CSS、JavaScript | 实时预览 | 永久免费
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}