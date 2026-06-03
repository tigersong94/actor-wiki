import { NextResponse } from 'next/server'

export async function GET() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dt = yesterday.toISOString().slice(0, 10).replace(/-/g, '')

  const res = await fetch(
    `http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${process.env.NEXT_PUBLIC_KOBIS_API_KEY}&targetDt=${dt}`
  )
  const data = await res.json()
  const list = data.boxOfficeResult?.dailyBoxOfficeList || []

  // TMDB에서 포스터 매칭
  const withPosters = await Promise.all(
    list.map(async (movie: any) => {
      try {
        const tmdbRes = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(movie.movieNm)}&language=ko-KR`
        )
        const tmdbData = await tmdbRes.json()
        const match = tmdbData.results?.[0]
        return {
          ...movie,
          poster_path: match?.poster_path || null,
          tmdb_id: match?.id || null,
        }
      } catch {
        return { ...movie, poster_path: null }
      }
    })
  )

  return NextResponse.json({ boxOfficeResult: { dailyBoxOfficeList: withPosters } })
}