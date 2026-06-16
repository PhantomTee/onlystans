export interface LMSReport {
  activityId: string
  score: number
  maxScore: number
  completion: boolean
  success: boolean
  meta?: Record<string, unknown>
}

export function reportToLMS(report: LMSReport): void {
  console.info('[RemoteLab] LMS report:', report)

  try {
    window.parent.postMessage({ type: 'remoteLab:completion', ...report }, '*')
  } catch (_) {}

  try {
    const statement = {
      actor: {
        objectType: 'Agent',
        name: 'Student',
        mbox: 'mailto:student@remoteLab.ng',
      },
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/scored',
        display: { 'en-US': 'scored' },
      },
      object: {
        id: `https://remoteLab.ng/activities/${report.activityId}`,
        definition: {
          name: { 'en-US': 'DC Motor Speed Control Lab' },
          type: 'http://adlnet.gov/expapi/activities/assessment',
        },
      },
      result: {
        score: { scaled: report.score / report.maxScore, raw: report.score, max: report.maxScore },
        completion: report.completion,
        success: report.success,
        extensions: report.meta ?? {},
      },
    }
    window.parent.postMessage({ type: 'xapi:statement', statement }, '*')
  } catch (_) {}
}
