/** 学业完成进度条目 */
export interface AcademicProgressItem {
  /** 课程类别名称 */
  KCLBMC?: string
  /** 类别代码 */
  KCLBDM?: string
  /** 要求学分 */
  YQXF: number | string
  /** 已获得学分 */
  YHDXF: number | string
  /** 还差学分 */
  HCXF?: number | string
  /** 是否完成 */
  SFWC: string
}

/** 学业完成查询响应 */
export interface AcademicResponse {
  datas: {
    bysc: {
      rows: AcademicProgressItem[]
    }
  }
}

/** 毕业绩点响应 */
export interface GraduateGPAResponse {
  datas: {
    byscjd: {
      rows: Array<{
        /** 总绩点 */
        ZJD?: number | string
        /** 总学分 */
        ZXF?: number | string
        /** 平均绩点 */
    PJJD?: number | string
        /** 平均学分绩点 */
    PJXFJD?: number | string
      }>
    }
  }
}

/** 个人培养方案概要（grpyfacx.do） */
export interface PersonalPlanSummary {
  PYFADM: string
  PYFAMC: string
  ZYDM: string
  XH: string
  XM: string
  /** 总要求学分 */
  ZSYQXF: number | string
  /** 已完成学分 */
  YWCXF: number | string
  XDLXDM_DISPLAY?: string
  XZNJ?: string
}

/** 个人培养方案响应（grpyfacx.do） */
export interface PersonalPlanResponse {
  datas: {
    grpyfacx: {
      totalSize: number
      pageSize: number
      rows: PersonalPlanSummary[]
    }
  }
}

/** 培养方案课程 */
export interface CurriculumCourse {
  KCMC: string
  KCH: string
  XF: number | string
  KCLBDM: string
  KCLBMC: string
  /** 是否已通过 */
  SFYG?: string
  CJ?: number | string
}

/** 培养方案响应 */
export interface CurriculumResponse {
  datas: {
    cxxsscfa: {
      rows: CurriculumCourse[]
    }
  }
}
