import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function initAdmin() {
  try {
    // 检查是否已存在管理员
    const existingAdmin = await db.admin.findFirst({
      where: { username: 'admin' }
    })

    if (existingAdmin) {
      console.log('管理员账户已存在')
      return
    }

    // 创建默认管理员
    const hashedPassword = await bcrypt.hash('123456', 10)
    
    const admin = await db.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com'
      }
    })

    console.log('默认管理员账户创建成功:')
    console.log('用户名: admin')
    console.log('密码: 123456')
    console.log('管理员ID:', admin.id)

  } catch (error) {
    console.error('初始化管理员失败:', error)
  } finally {
    await db.$disconnect()
  }
}

initAdmin()