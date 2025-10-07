'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  FileText,
  Code,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Settings,
  LogOut,
  Shield,
  Copy,
  ExternalLink,
  Maximize2,
  Minimize2
} from 'lucide-react'
import dynamic from 'next/dynamic'

// 动态导入 Monaco Editor 以避免 SSR 问题
const MonacoEditor = dynamic(() => import('@/components/MonacoEditor'), {
  ssr: false,
  loading: () => (
    <div className="border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center" style={{ height: '400px' }}>
      <div className="text-gray-500">加载编辑器...</div>
    </div>
  )
})

interface File {
  id: string
  filename: string
  title?: string
  type: 'html' | 'markdown'
  shareUrl: string
  isPublic: boolean
  createdAt: string
  creator?: {
    id: string
    username: string
    email?: string
  }
}

interface AdminUser {
  id: string
  username: string
  email?: string
}

export default function AdminDashboard() {
  const [files, setFiles] = useState<File[]>([])
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [editingFile, setEditingFile] = useState<File | null>(null)
  const [editorContent, setEditorContent] = useState('')
  const [editorType, setEditorType] = useState<'html' | 'markdown'>('html')
  const [filename, setFilename] = useState('')
  const [title, setTitle] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const router = useRouter()

  // 密码修改状态
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)

  // 生成预览 HTML
  const generatePreview = async () => {
    if (editorType === 'markdown' && editorContent) {
      try {
        const response = await fetch('/api/markdown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: editorContent })
        })
        const data = await response.json()
        if (response.ok && data.success) {
          setPreviewHtml(data.htmlCode)
        }
      } catch (error) {
        console.error('Preview generation error:', error)
      }
    } else {
      setPreviewHtml(editorContent)
    }
  }

  // 当切换到预览模式时生成预览
  useEffect(() => {
    if (isPreviewMode) {
      generatePreview()
    }
  }, [isPreviewMode, editorContent, editorType])

  useEffect(() => {
    // 只在客户端执行
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('adminToken')
    const user = localStorage.getItem('adminUser')
    
    if (!token || !user) {
      router.push('/admin/login')
      return
    }

    checkAuth()
    loadFiles()
  }, [])

  const checkAuth = async () => {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('adminToken')
    const user = localStorage.getItem('adminUser')
    
    if (!token || !user) {
      router.push('/admin/login')
      return
    }

    try {
      const response = await fetch('/api/admin/auth', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAdminUser(data.admin)
        }
      } else {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    } finally {
      setIsLoading(false)
    }
  }

  const loadFiles = async () => {
    if (typeof window === 'undefined') return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/files')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setFiles(data.files)
        }
      }
    } catch (error) {
      toast.error('加载文件列表失败')
    }
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
    }
    router.push('/admin/login')
    toast.success('已退出登录')
  }

  const handleCreateFile = () => {
    setEditingFile(null)
    setEditorContent('')
    setEditorType('html')
    setFilename('')
    setTitle('')
    setIsPublic(false)
    setIsFullscreen(false)
    setIsPreviewMode(false)
    setIsEditorOpen(true)
  }

  const handleEditFile = async (file: File) => {
    if (typeof window === 'undefined') return

    try {
      // 从 API 获取完整文件内容
      const response = await fetch(`/api/files/${file.id}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setEditingFile(file)
        setEditorContent(data.file.content || '')
        setEditorType(data.file.type)
        setFilename(data.file.filename)
        setTitle(data.file.title || '')
        setIsPublic(data.file.isPublic)
        setIsFullscreen(false)
        setIsPreviewMode(false)
        setIsEditorOpen(true)
      } else {
        toast.error('加载文件失败')
      }
    } catch (error) {
      toast.error('网络错误，请重试')
    }
  }

  const handleSaveFile = async () => {
    if (typeof window === 'undefined') return

    if (!filename.trim()) {
      toast.error('请输入文件名')
      return
    }

    if (!editorContent.trim()) {
      toast.error('请输入内容')
      return
    }

    try {
      const token = localStorage.getItem('adminToken')

      // 判断是创建还是更新
      if (editingFile) {
        // 更新文件
        const response = await fetch(`/api/files/${editingFile.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: editorContent,
            filename: filename.trim(),
            title: title.trim() || filename.trim(),
            isPublic
          })
        })

        const data = await response.json()

        if (response.ok && data.success) {
          toast.success('文件更新成功')
          setIsEditorOpen(false)
          loadFiles()
        } else {
          toast.error(data.error || '文件更新失败')
        }
      } else {
        // 创建文件
        const response = await fetch('/api/files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: editorContent,
            type: editorType,
            filename: filename.trim(),
            title: title.trim() || filename.trim(),
            isPublic,
            createdBy: adminUser?.id
          })
        })

        const data = await response.json()

        if (response.ok && data.success) {
          toast.success('文件创建成功')
          setIsEditorOpen(false)
          loadFiles()
        } else {
          toast.error(data.error || '文件创建失败')
        }
      }
    } catch (error) {
      toast.error('网络错误，请重试')
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (typeof window === 'undefined') return

    if (!confirm('确定要删除这个文件吗？')) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('文件删除成功')
        loadFiles()
      } else {
        toast.error('文件删除失败')
      }
    } catch (error) {
      toast.error('网络错误，请重试')
    }
  }

  const handleCopyShareUrl = (shareUrl: string) => {
    if (typeof window === 'undefined') return

    const fullUrl = `${window.location.origin}${shareUrl}`
    navigator.clipboard.writeText(fullUrl)
    toast.success('分享链接已复制')
  }

  const handleChangePassword = async () => {
    if (typeof window === 'undefined') return

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('请填写所有密码字段')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('新密码和确认密码不匹配')
      return
    }

    if (newPassword.length < 6) {
      toast.error('新密码长度至少为6位')
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('密码修改成功')
        setIsPasswordDialogOpen(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(data.error || '密码修改失败')
      }
    } catch (error) {
      toast.error('网络错误，请重试')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">管理后台</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                欢迎，{adminUser?.username}
              </span>
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-1" />
                    修改密码
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>修改密码</DialogTitle>
                    <DialogDescription>
                      请输入当前密码和新密码
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">当前密码</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">新密码</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">确认新密码</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleChangePassword} className="w-full">
                      修改密码
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1" />
                退出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">文件管理</h2>
          <Button onClick={handleCreateFile}>
            <Plus className="w-4 h-4 mr-2" />
            新建文件
          </Button>
        </div>

        {/* Files List */}
        <div className="grid gap-4">
          {files.map((file) => (
            <Card key={file.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      {file.type === 'html' ? (
                        <Code className="w-5 h-5 text-purple-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{file.title || file.filename}</h3>
                      <p className="text-sm text-gray-600">{file.filename}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={file.type === 'html' ? 'default' : 'secondary'}>
                          {file.type.toUpperCase()}
                        </Badge>
                        {file.isPublic && (
                          <Badge variant="outline">公开</Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(file.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyShareUrl(file.shareUrl)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(file.shareUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditFile(file)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {files.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文件</h3>
            <p className="text-gray-600 mb-4">创建您的第一个文件开始使用</p>
            <Button onClick={handleCreateFile}>
              <Plus className="w-4 h-4 mr-2" />
              新建文件
            </Button>
          </div>
        )}
      </main>

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className={isFullscreen ? "max-w-full max-h-full h-screen w-screen m-0 p-0" : "max-w-4xl max-h-[80vh]"}>
          {!isFullscreen && (
            <DialogHeader>
              <DialogTitle>
                {editingFile ? '编辑文件' : '新建文件'}
              </DialogTitle>
            </DialogHeader>
          )}
          <div className={isFullscreen ? "flex flex-col h-full" : "space-y-4"}>
            {/* 全屏模式下的顶部工具栏 */}
            {isFullscreen && (
              <div className="flex items-center justify-between p-4 border-b bg-white">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold">
                    {editingFile ? '编辑文件' : '新建文件'} - {filename || '未命名'}
                  </h2>
                  <Tabs value={isPreviewMode ? 'preview' : 'edit'} onValueChange={(value) => setIsPreviewMode(value === 'preview')}>
                    <TabsList>
                      <TabsTrigger value="edit">编辑</TabsTrigger>
                      <TabsTrigger value="preview">预览</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={handleSaveFile}>
                    保存文件
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setIsFullscreen(false)}>
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
                    取消
                  </Button>
                </div>
              </div>
            )}

            <div className={isFullscreen ? "flex-1 overflow-hidden" : ""}>
              {!isFullscreen && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="filename">文件名</Label>
                    <Input
                      id="filename"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      placeholder="输入文件名"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">标题</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="输入标题（可选）"
                    />
                  </div>
                </div>
              )}

              {!isFullscreen && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label>文件类型:</Label>
                    <Tabs value={editorType} onValueChange={(value) => setEditorType(value as 'html' | 'markdown')}>
                      <TabsList>
                        <TabsTrigger value="html">HTML</TabsTrigger>
                        <TabsTrigger value="markdown">Markdown</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                    />
                    <Label htmlFor="isPublic">公开文件</Label>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)}>
                    <Maximize2 className="w-4 h-4 mr-1" />
                    全屏
                  </Button>
                </div>
              )}

              {/* 编辑器或预览区域 */}
              {isPreviewMode && isFullscreen ? (
                <div className="h-full overflow-auto p-8 bg-white">
                  <div
                    className="prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              ) : (
                <div className="border rounded-lg" style={{ height: isFullscreen ? 'calc(100vh - 120px)' : '400px' }}>
                  <MonacoEditor
                    language={editorType === 'markdown' ? 'markdown' : 'html'}
                    value={editorContent}
                    onChange={(value) => setEditorContent(value || '')}
                    height={isFullscreen ? 'calc(100vh - 120px)' : '400px'}
                  />
                </div>
              )}
            </div>

            {!isFullscreen && (
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleSaveFile}>
                  保存文件
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}