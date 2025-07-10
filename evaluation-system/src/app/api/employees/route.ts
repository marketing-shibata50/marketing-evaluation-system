import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 従業員一覧取得
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(employees)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}

// 従業員追加
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, department, position } = body

    const employee = await prisma.employee.create({
      data: {
        name,
        department,
        position
      }
    })

    return NextResponse.json(employee)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
  }
}