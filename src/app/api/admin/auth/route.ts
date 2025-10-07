import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

interface AuthRequest {
  username: string
  password: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const body: AuthRequest = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      )
    }

    // 查找管理员
    const admin = await db.admin.findUnique({
      where: { username }
    })

    if (!admin) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }

    // 生成 JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username,
        type: 'admin'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      },
      token,
      message: '登录成功'
    })

  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未提供认证令牌' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      const admin = await db.admin.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true
        }
      })

      if (!admin) {
        return NextResponse.json(
          { error: '管理员不存在' },
          { status: 401 }
        )
      }

      return NextResponse.json({
        success: true,
        admin,
        message: '认证成功'
      })

    } catch (jwtError) {
      return NextResponse.json(
        { error: '认证令牌无效' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Admin verify error:', error)
    return NextResponse.json(
      { error: '认证验证失败' },
      { status: 500 }
    )
  }
}