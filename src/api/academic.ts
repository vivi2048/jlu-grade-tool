import { emapRequest } from './request'
import type { AcademicResponse, GraduateGPAResponse, CurriculumResponse, PersonalPlanResponse } from '../types/academic'

/**
 * 查询学业完成情况（毕业审核）
 * 参数需要从页面或配置中获取
 */
export async function fetchAcademicProgress(params: {
  XH: string       // 学号
  PYFADM: string   // 培养方案代码
  SCLBDM: string   // 审查类别代码
  BYNJDM?: string  // 毕业年级代码
}): Promise<AcademicResponse> {
  const body = new URLSearchParams({
    XH: params.XH,
    PYFADM: params.PYFADM,
    SCLBDM: params.SCLBDM,
    BYNJDM: params.BYNJDM || '-',
  })

  return emapRequest<AcademicResponse>(
    '/jwapp/sys/xywccx/modules/xywccx/bysc.do',
    { body: body.toString() }
  )
}

/**
 * 查询毕业成绩绩点
 */
export async function fetchGraduateGPA(zxjdKey: string): Promise<GraduateGPAResponse> {
  const body = new URLSearchParams({
    ZXJDKEY: zxjdKey,
  })

  return emapRequest<GraduateGPAResponse>(
    '/jwapp/sys/xywccx/modules/xywccx/byscjd.do',
    { body: body.toString() }
  )
}

/**
 * 查询个人培养方案
 */
export async function fetchCurriculum(params: {
  XH: string
  SCLBDM: string
}): Promise<CurriculumResponse> {
  const body = new URLSearchParams({
    XH: params.XH,
    SCLBDM: params.SCLBDM,
    '*order': '-CZSJ',
  })

  return emapRequest<CurriculumResponse>(
    '/jwapp/sys/xywccx/modules/xywccx/cxxsscfa.do',
    { body: body.toString() }
  )
}

/**
 * 查询个人培养方案概要（含已完成学分/总要求学分）
 */
export async function fetchPersonalPlanSummary(): Promise<PersonalPlanResponse> {
  return emapRequest<PersonalPlanResponse>(
    '/jwapp/sys/xywccx/modules/xywccx/grpyfacx.do',
    { body: '', moduleKey: 'academic' }
  )
}
