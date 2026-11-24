import { renderToStaticMarkup } from 'react-dom/server'
import type { SummaryData } from '../lib/documents'

/** 화면·인쇄·다운로드 파일에서 공통으로 쓰는 스타일 (Tailwind에 의존하지 않음) */
export const SUMMARY_CSS = `
.sm{font-family:'Pretendard Variable','Pretendard','Noto Sans KR','Malgun Gothic',sans-serif;color:#172033;line-height:1.6;max-width:760px;margin:0 auto;background:#fff;padding:28px;font-size:15px}
.sm h1{font-size:24px;color:#12388a;margin:0 0 6px}
.sm .banner{background:#fff6ed;border:2px solid #f97316;color:#b74a05;font-weight:700;border-radius:12px;padding:10px 14px;margin:10px 0 6px}
.sm .meta{color:#6b7280;font-size:13px;margin-bottom:14px}
.sm h2{font-size:17px;color:#12388a;border-bottom:2px solid #dce8ff;padding-bottom:4px;margin:22px 0 8px}
.sm table{width:100%;border-collapse:collapse}
.sm th{width:34%;text-align:left;vertical-align:top;background:#f6f7fa;padding:6px 10px;border:1px solid #e5e7eb;font-weight:700;font-size:14px}
.sm td{padding:6px 10px;border:1px solid #e5e7eb;font-size:14px}
.sm ul{list-style:none;padding:0;margin:8px 0 0}
.sm li{padding:6px 0;border-bottom:1px dashed #e5e7eb;font-size:14px}
.sm li .mk{display:inline-block;width:1.6em}
.sm li .sub{display:block;color:#6b7280;font-size:12.5px;margin-left:1.6em}
.sm .note{color:#6b7280;font-size:12.5px;margin-top:6px}
.sm .disc{margin-top:22px;border-top:2px solid #e5e7eb;padding-top:10px;color:#6b7280;font-size:12.5px}
@media print{.sm{padding:0;font-size:12.5px;max-width:none}.sm h2{break-after:avoid}.sm li,.sm tr{break-inside:avoid}}
`

export function SummarySheet({ data }: { data: SummaryData }) {
  return (
    <article className="sm" id="summary-sheet">
      <h1>{data.title}</h1>
      <p className="banner">⚠️ {data.banner}</p>
      <p className="meta">작성일시: {data.generatedAt}</p>
      {data.sections.map((s) => (
        <section key={s.title}>
          <h2>{s.title}</h2>
          {s.rows && (
            <table>
              <tbody>
                {s.rows.map(([k, v]) => (
                  <tr key={k}>
                    <th>{k}</th>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {s.list && (
            <ul>
              {s.list.map((it, i) => (
                <li key={i}>
                  <span className="mk">{it.mark}</span>
                  {it.text}
                  {it.sub && <span className="sub">{it.sub}</span>}
                </li>
              ))}
            </ul>
          )}
          {s.note && <p className="note">※ {s.note}</p>}
        </section>
      ))}
      <p className="disc">{data.disclaimer}</p>
    </article>
  )
}

/** 다운로드용 독립 HTML 문서 */
export function summaryToHtml(data: SummaryData): string {
  const body = renderToStaticMarkup(<SummarySheet data={data} />)
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${data.title}</title><style>body{margin:0;background:#f6f7fa}${SUMMARY_CSS}</style></head><body>${body}</body></html>`
}
