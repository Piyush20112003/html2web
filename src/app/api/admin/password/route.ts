import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
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
    } catch (jwtError) {
      return NextResponse.json(
        { error: '认证令牌无效' },
        { status: 401 }
      )
    }

    const body: PasswordChangeRequest = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '当前密码和新密码不能为空' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '新密码长度至少为6位' },
        { status: 400 }
      )
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // 获取当前管理员信息
    const admin = await db.admin.findUnique({
      where: { id: decoded.id }
    })

    if (!admin) {
      return NextResponse.json(
        { error: '管理员不存在' },
        { status: 401 }
      )
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: '当前密码错误' },
        { status: 401 }
      )
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // 更新密码
    await db.admin.update({
      where: { id: admin.id },
      data: { password: hashedNewPassword }
    })

    return NextResponse.json({
      success: true,
      message: '密码修改成功'
    })

  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json(
      { error: '密码修改失败' },
      { status: 500 }
    )
  }
}