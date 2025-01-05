import { NextResponse } from 'next/server'
import { nutritionalAnalysisService } from '@/features/nutrition/services/nutritional-analysis-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const mealPlanId = searchParams.get('mealPlanId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const analysisType = searchParams.get('type')

    if (!mealPlanId) {
      return new NextResponse('Missing meal plan ID', { status: 400 })
    }

    switch (analysisType) {
      case 'nutrients':
        const analysis = await nutritionalAnalysisService.analyzeNutrients(
          mealPlanId,
          new Date()
        )
        return NextResponse.json(analysis)

      case 'compliance':
        const compliance = await nutritionalAnalysisService.checkDietaryCompliance(
          mealPlanId,
          new Date()
        )
        return NextResponse.json({ compliant: compliance })

      case 'progress':
        if (!startDate || !endDate) {
          return new NextResponse('Missing date range', { status: 400 })
        }
        const report = await nutritionalAnalysisService.trackGoalProgress(
          mealPlanId,
          new Date(startDate),
          new Date(endDate)
        )
        return NextResponse.json(report)

      default:
        return new NextResponse('Invalid analysis type', { status: 400 })
    }
  } catch (error) {
    console.error('Error in nutritional analysis GET:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
