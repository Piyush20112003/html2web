import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface ShareRequest {
  htmlCode: string
  markdownCode?: string
  type?: string
}

// 生成随机ID
function generateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const body: ShareRequest = await request.json()
    const { htmlCode, markdownCode, type = 'html' } = body

    if (!htmlCode || htmlCode.trim().length === 0) {
      return NextResponse.json(
        { error: '内容不能为空' },
        { status: 400 }
      )
    }

    // 生成唯一ID
    const id = generateId()
    
    // 检查ID是否已存在，如果存在则重新生成
    let uniqueId = id
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      try {
        const existing = await db.share.findUnique({
          where: { id: uniqueId }
        })
        
        if (!existing) {
          break
        }
        
        uniqueId = generateId()
        attempts++
      } catch (error) {
        // 如果表不存在，创建它
        break
      }
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: '生成分享链接失败，请重试' },
        { status: 500 }
      )
    }

    // 保存到数据库
    try {
      await db.share.create({
        data: {
          id: uniqueId,
          htmlCode: htmlCode.trim(),
          markdownCode: markdownCode?.trim() || null,
          type: type,
          createdAt: new Date(),
        }
      })
    } catch (error) {
      // 如果表不存在或其他错误，尝试创建表
      console.error('Database error:', error)
      return NextResponse.json(
        { error: '保存失败，请重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      id: uniqueId,
      type: type,
      message: '分享链接生成成功'
    })

  } catch (error) {
    console.error('Share API error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '缺少分享ID' },
        { status: 400 }
      )
    }

    const share = await db.share.findUnique({
      where: { id }
    })

    if (!share) {
      return NextResponse.json(
        { error: '分享链接不存在或已过期' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: share.id,
      htmlCode: share.htmlCode,
      markdownCode: share.markdownCode,
      type: share.type,
      createdAt: share.createdAt
    })

  } catch (error) {
    console.error('Get share error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}