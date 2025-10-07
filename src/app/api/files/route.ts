import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { v4 as uuidv4 } from 'uuid'

interface FileCreateRequest {
  content: string
  type: 'html' | 'markdown'
  title?: string
  filename?: string
  isPublic?: boolean
  createdBy?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: FileCreateRequest = await request.json()
    const { content, type, title, filename, isPublic = false, createdBy } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: '内容不能为空' },
        { status: 400 }
      )
    }

    if (!type || !['html', 'markdown'].includes(type)) {
      return NextResponse.json(
        { error: '类型必须是 html 或 markdown' },
        { status: 400 }
      )
    }

    // 检查文件大小限制
    if (content.length > 1000000) { // 1MB 限制
      return NextResponse.json(
        { error: '文件过大，请控制在 1MB 以内' },
        { status: 400 }
      )
    }

    let htmlOutput: string

    if (type === 'markdown') {
      // 转换 Markdown 为 HTML
      const processor = remark()
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeHighlight)
        .use(rehypeStringify, { allowDangerousHtml: true })

      const result = await processor.process(content)
      htmlOutput = result.toString()
    } else {
      // 直接使用 HTML 内容
      htmlOutput = content
    }

    // 生成文件名和分享链接
    const finalFilename = filename || `${type}-${Date.now()}`
    const shareId = uuidv4()
    const shareUrl = `/preview/${shareId}`

    // 验证 createdBy 存在
    if (!createdBy) {
      return NextResponse.json(
        { error: '缺少创建者信息，请重新登录' },
        { status: 400 }
      )
    }

    // 保存到数据库
    const file = await db.file.create({
      data: {
        filename: finalFilename,
        title: title || finalFilename,
        content,
        type,
        htmlOutput,
        shareUrl,
        isPublic,
        createdBy
      }
    })

    // 同时创建 Share 记录以保持兼容性
    await db.share.create({
      data: {
        id: shareId,
        htmlCode: htmlOutput,
        markdownCode: type === 'markdown' ? content : null,
        type
      }
    })

    return NextResponse.json({
      success: true,
      file: {
        id: file.id,
        filename: file.filename,
        title: file.title,
        type: file.type,
        shareUrl: file.shareUrl,
        isPublic: file.isPublic,
        createdAt: file.createdAt
      },
      message: '文件创建成功'
    })

  } catch (error) {
    console.error('File creation error:', error)
    return NextResponse.json(
      { error: '文件创建失败' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const isPublic = searchParams.get('public') === 'true'
    const createdBy = searchParams.get('createdBy')

    const where: any = {}
    
    if (type && ['html', 'markdown'].includes(type)) {
      where.type = type
    }
    
    if (isPublic) {
      where.isPublic = true
    }
    
    if (createdBy) {
      where.createdBy = createdBy
    }

    const files = await db.file.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      files: files.map(file => ({
        id: file.id,
        filename: file.filename,
        title: file.title,
        type: file.type,
        shareUrl: file.shareUrl,
        isPublic: file.isPublic,
        createdAt: file.createdAt,
        creator: file.creator
      })),
      total: files.length
    })

  } catch (error) {
    console.error('File list error:', error)
    return NextResponse.json(
      { error: '获取文件列表失败' },
      { status: 500 }
    )
  }
}