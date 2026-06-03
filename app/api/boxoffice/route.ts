import { NextResponse } from 'next/server'

export async function GET() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dt = yesterday.toISOString().slice(0, 10).replace(/-/g, '')

  const res = await fetch(
    `http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${process.env.NEXT_PUBLIC_KOBIS_API_KEY}&targetDt=${dt}`
  )
  const data = await res.json()
  return NextResponse.json(data)
}