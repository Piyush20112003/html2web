import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// 验证管理员权限
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded
  } catch (jwtError) {
    return null
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request)
    
    if (!admin) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 401 }
      )
    }

    const fileId = params.id

    // 查找文件
    const file = await db.file.findUnique({
      where: { id: fileId }
    })

    if (!file) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      )
    }

    // 删除文件
    await db.file.delete({
      where: { id: fileId }
    })

    return NextResponse.json({
      success: true,
      message: '文件删除成功'
    })

  } catch (error) {
    console.error('File delete error:', error)
    return NextResponse.json(
      { error: '文件删除失败' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = params.id

    const file = await db.file.findUnique({
      where: { id: fileId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    })

    if (!file) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      file: {
        id: file.id,
        filename: file.filename,
        title: file.title,
        content: file.content,
        type: file.type,
        htmlOutput: file.htmlOutput,
        shareUrl: file.shareUrl,
        isPublic: file.isPublic,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        creator: file.creator
      }
    })

  } catch (error) {
    console.error('File get error:', error)
    return NextResponse.json(
      { error: '获取文件失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request)
    
    if (!admin) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 401 }
      )
    }

    const fileId = params.id
    const body = await request.json()
    const { content, title, filename, isPublic } = body

    // 查找文件
    const file = await db.file.findUnique({
      where: { id: fileId }
    })

    if (!file) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      )
    }

    let htmlOutput = file.htmlOutput

    // 如果内容发生变化，重新处理
    if (content && content !== file.content) {
      if (file.type === 'markdown') {
        const { remark } = await import('remark')
        const remarkGfm = await import('remark-gfm')
        const remarkRehype = await import('remark-rehype')
        const rehypeHighlight = await import('rehype-highlight')
        const rehypeStringify = await import('rehype-stringify')

        const processor = remark()
          .use(remarkGfm)
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeHighlight)
          .use(rehypeStringify, { allowDangerousHtml: true })

        const result = await processor.process(content)
        htmlOutput = result.toString()
      } else {
        htmlOutput = content
      }
    }

    // 更新文件
    const updatedFile = await db.file.update({
      where: { id: fileId },
      data: {
        content: content || file.content,
        htmlOutput,
        title: title !== undefined ? title : file.title,
        filename: filename !== undefined ? filename : file.filename,
        isPublic: isPublic !== undefined ? isPublic : file.isPublic
      }
    })

    return NextResponse.json({
      success: true,
      file: {
        id: updatedFile.id,
        filename: updatedFile.filename,
        title: updatedFile.title,
        type: updatedFile.type,
        shareUrl: updatedFile.shareUrl,
        isPublic: updatedFile.isPublic,
        createdAt: updatedFile.createdAt,
        updatedAt: updatedFile.updatedAt
      },
      message: '文件更新成功'
    })

  } catch (error) {
    console.error('File update error:', error)
    return NextResponse.json(
      { error: '文件更新失败' },
      { status: 500 }
    )
  }
}