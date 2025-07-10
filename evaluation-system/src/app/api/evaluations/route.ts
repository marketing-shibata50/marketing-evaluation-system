import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 評価一覧取得
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const employeeId = searchParams.get('employeeId')
  
  try {
    const where = employeeId ? { employeeId: parseInt(employeeId) } : {}
    
    const evaluations = await prisma.evaluation.findMany({
      where,
      include: {
        employee: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(evaluations)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch evaluations' }, { status: 500 })
  }
}

// 評価追加
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      employeeId, 
      periodStart, 
      periodEnd,
      performance,
      skill,
      growth,
      contribution,
      comment
    } = body

    // 合計スコアと評価等級を計算
    const totalScore = performance + skill + growth + contribution
    let grade = 'D'
    if (totalScore >= 90) grade = 'S'
    else if (totalScore >= 80) grade = 'A'
    else if (totalScore >= 70) grade = 'B'
    else if (totalScore >= 60) grade = 'C'

    const evaluation = await prisma.evaluation.create({
      data: {
        employeeId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        performance,
        skill,
        growth,
        contribution,
        totalScore,
        grade,
        comment
      },
      include: {
        employee: true
      }
    })

    return NextResponse.json(evaluation)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create evaluation' }, { status: 500 })
  }
}