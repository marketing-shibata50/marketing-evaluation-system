import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 評価一覧取得
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const employeeId = searchParams.get('employeeId')
  const patternId = searchParams.get('patternId')
  
  try {
    const where: any = {}
    if (employeeId) where.employeeId = parseInt(employeeId)
    if (patternId) where.patternId = patternId
    
    const evaluations = await prisma.evaluation.findMany({
      where,
      include: {
        employee: true,
        items: true
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
      patternId,
      periodStart, 
      periodEnd,
      totalScore,
      grade,
      comment,
      items
    } = body

    const evaluation = await prisma.evaluation.create({
      data: {
        employeeId,
        patternId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        totalScore,
        grade,
        comment,
        items: {
          create: items.map((item: any) => ({
            itemId: item.itemId,
            itemName: item.itemName,
            score: item.score,
            maxScore: item.maxScore
          }))
        }
      },
      include: {
        employee: true,
        items: true
      }
    })

    return NextResponse.json(evaluation)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create evaluation' }, { status: 500 })
  }
}