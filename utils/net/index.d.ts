interface RequestConfig {
  /**
   * 请求配置
   * 请求支持json及form格式
   */
  request: {
    // 请求域名及端口号 请勿以/结尾
    origin: string,
    // 公共请求路径
    path: string,
    /**
     * Content-Type 请求媒体类型 有效值如下
     * 设置这个值将用户post请求的时候设置请求body类型
     * application/json
     * application/x-www-form-urlencoded
     */
    contentType: string,
    /**
     * 公共请求header
     * 可以传入函数或者对象 函数需要返回一个对象
     */
    header: object | ((option: object) => object),
    /**
     * 要携带在请求上的参数
     * 根据method请求类型 参数自动设置在GET或者POST
     * 可以传入函数或者对象 函数需要返回一个对象
     */
    data: object | (() => void),
    /**
     * 要携带在请求url上的参数
     * 即使使用POST请求时 也在GET参数上
     * 可以传入函数或者对象 函数需要返回一个对象
     */
    getData: object | (() => void)
  },
  /**
   * 返回结果配置
   * 返回结果仅支持JSON格式数据
   */
  result: {
    /**
     * 成功的code
     * code对不上，请求将会走catch方法
     */
    successCode: number,
    /**
     * 请求失败的标准code
     * 这个code将用于内部使用
     */
    errorCode: number,
    /**
     * 返回值获取code字段
     * 多级请用数组表示
     * 可以传入函数处理数据
     */
    code: string | string[] | (() => void),
    /**
     * 返回值获取提示信息的字段
     * 多级请用数组表示
     * 可以传入函数处理数据
     */
    message: string | string[] | (() => void),
    /**
     * 要返回到请求结果的字段
     * 当code对比成功时返回此值
     * 多级请用数组表示
     * 可以传入函数处理数据
     */
    data: string | string[] | (() => void),
  },
  /**
   * 上传配置
   * 上传的请求头将强制设置为 文件流
   */
  upload: {
    // 上传api api后可以携带参数
    api: string,
    // 上传文件时的字段名，因小程序限制，单次上传仅能上传一个文件所以只能设置一个名称
    requestField: string | string[] | (() => void),
    // 返回值的图片路径的url 如果有多级可以配置数组 如[0, url] 或者函数
    resultField: string | string[] | (() => void),
  }
}

declare namespace Request {
  interface method {
    /** GET请求 */
    GET
    /** POST请求 */
    POST
    /** PUT请求 */
    PUT
    /** DELETE请求 */
    DELETE
  }

  interface RequestOption {
    /** 请求链接 相对地址 */
    url: string
    /** 附加header */
    header?: object
    /** 请求数据 根据method会加在对应位置 */
    data?: object
    /** 请求类型 */
    method?: keyof method
    /** 请求超时时间（ms） 默认30000 */
    tomeout?: number
    /**
     * 防止重复请求的时间间隔，在这个事件内如果发生相同参数的请求将被拦截触发catch
     * catch将返回，下面的数据，如果你不想使用，可以把这个值设置为0
     * ```javascript
     * { code: 3, message: '重复请求' }
     * ```
     * @default 500
     */
    repeatTime?: number
    /**
     * 是否在请求过程中显示loading
     * 传入一个字符串，将在请求的时候显示这个字符串
     * 传入一个loading函数，将会执行这个函数，并且要求这个函数返回这个停止loading的函数
     */
    loading?: boolean | string | (() => () => void)
    /**
     * 是否在请求至catch的时候toast一个错误提示
     */
    toast?: boolean
    /** 请求配置 用于覆盖默认配置 */
    config?: RequestConfig,
    /** 中间件 用于覆盖默认配置的中间件 */
    middle?: middle
  }


  interface middle {
    /**
     * 请求参数中间件 在发起请求之前将处理过的请求参数传入
     * @param callback
     */
    before: (callback: (requestParams: {
      url: string,
      contentType: string,
      query: object,
      body: object | null,
      header: object,
      method: keyof Request.method,
      timeout: number
    }, params: Request.RequestOption) => object | Promise<object>) => void

    result: (callback: (result: object, params: Request.RequestOption) => object | Promise<object>) => void
    error: (callback: (error: {
      code: number,
      message: string
    } | object, params: Request.RequestOption) => object | Promise<object>) => void
  }



  interface RequestTask extends Promise<RequestTask> {
    /** 取消请求 */
    abort(): void
  }

  interface ThrottleRequestTask extends Promise<ThrottleRequestTask> {

  }

  interface functions {
    /**
     * 发起请求函数
     * @param option 填写一个url或者一个请求配置
     * @example
     * ```javascript
     * request('index/index/list').then(res => {
     *  console.log(res)
     * })
     * request({
     *  url: 'index/index/list'
     * }).then(res => {
     *  console.log(res)
     * })
     * ```
     */
    request(option: string | RequestOption): RequestTask

    /**
     * 发起一个节流请求函数
     * @param option 请求参数同 request
     * @param mark 当前标识 当你的url和data均相同时，可以添加一个mark区分他们
     * @example
     * ```javascript
     * throttleRequest({
     *  url: 'api/test'
     * }).then(res => {
     *  // then里面的数据是经过节流处理的
     * }).catch(err => {
     *  // err.code === 1 // 过快请求
     *  // err.code === 2 // 请求被覆盖
     * })
     * ```
     */
    throttleRequest(option: RequestOption, mark?: string): ThrottleRequestTask
  }

}

/**
 * 获取完成的url
 * @param url api
 * @param data 要加在url上的get参数
 * @param params 请求参数
 */
export function getUrl(url: string, data: object, params: Request.RequestOption): string


declare namespace Upload {

  /** 上传参数 */
  interface Option {
    /**
     * 最大数量
     * 仅在类型为image时有效
     * @default 1
     */
    count?: number
    /** 用户替换默认设置的api */
    api?: string
    /** 用户替换默认的上传字段 */
    requestField?: string | string[] | (() => void)
    /** 用户替换默认的返回值字段 */
    resultField?: string | string[] | (() => void)
    /** 选择图片的来源 */
    sourceType?: keyof sourceType[]
    /** 图片压缩类型 */
    sizeType?: (keyof sizeType)[]
    /** 视频压缩 */
    compressed?: boolean
    /** 拍摄时的最大时长 单位秒 */
    maxDuration?: number
    /** 默认拉起的是前置或者后置摄像头。部分 Android 手机下由于系统 ROM 不支持无法生效 */
    camera?: keyof camera
    /** 请求配置 */
    config?: RequestConfig
    /** 中间件 */
    middle?: middle
    /** 请求超时 */
    timeout?: number
  }

  /**
   * 上传类型
   */
  interface Type {
    /** 图片 */
    'image',
    /** 视频 */
    'video'
  }


  /**
   * 来源
   */
  interface sourceType {
    /** 从相册选图 */
    album
    /** 使用相机 */
    camera
    /** 使用前置摄像头(仅H5纯浏览器使用) */
    user
    /** 使用后置摄像头(仅H5纯浏览器) */
    environment
  }

  /**
   * 图片压缩
   */
  interface sizeType {
    /** 原图 */
    original
    /** 压缩图 */
    compressed
  }

  /**
   * 摄像头
   */
  interface camera {
    /** 默认拉起后置摄像头 */
    back
    /** 默认拉起前置摄像头 */
    front

  }

  /**
   * 临时文件
   */
  interface File {
    /** 文件路径 */
    path: string
    /** 文件大小 */
    size: number
  }

  interface middle {
    /**
     * 请求参数中间件 在发起请求之前将处理过的请求参数传入
     * @param callback
     */
    before(callback: (requestParams: {
      url: string,
      data: object | string,
      header: object,
      method: keyof Request.method,
      timeout: number
    }, params: Request.RequestOption) => object | Promise<object>): void
    result(callback: (result: object[], params: Request.RequestOption) => object[] | Promise<object[]>): void
    error(callback: (error: {
      code: number,
      message: string
    } | object, params: Request.RequestOption) => object | Promise<object>): void
  }


  namespace uploadTask {
    /** 上传进度回调数据 */
    interface ProgressOption {
      /** 上传进度百分比 */
      progress: number
      /** 预期需要上传的数据总长度，单位 Bytes */
      totalBytesExpectedToSend: number
      /** 已经上传的数据长度，单位 Bytes */
      totalBytesSent: number
    }
  }

  interface UploadTask extends Promise<UploadTask> {
    /** 取消请求 */
    abort(): void
    /**
     * 监听上传进度
     * @param callback 回调函数
     */
    progress(callback: (res: uploadTask.ProgressOption) => void): UploadTask
    /**
     * 选择完成后 开始上传通知
     * @param callback
     */
    start(callback: () => void): UploadTask
  }

  interface functions {
    /**
       * 图片及视频上传方法，包含从选择到上传两个过程
       * @param type 类型 支持图片或者视频
       * @param option 选项
       * @example
       * ```javascript
       * upload('image', { count: 1, sourceType: ['album', 'camera'] })
       * upload('video', { sourceType: ['album', 'camera'] })
       * ```
       */
    upload(type: keyof Upload.Type, option: Upload.Option): UploadTask

    /**
     * 直接上传已经选择的文件
     * @param files 类型 支持图片或者视频
     * @param option 选项
     * @example
     * ```javascript
     * uploadTempFile([{ path: '' }])
     * ```
     */
    uploadTempFile(files: Upload.File[], option: Upload.Option): UploadTask
  }
}

export function createRequest(config: {
  config: RequestConfig,
  middle: {
    before: Request.middle["before"][]
    result: Request.middle["result"][]
    error: Request.middle["error"][]
  }
}): {
  middle: {
    /**
     * 请求前中间件
     * @param callback 回调
     * @param sort 排序 数字小的先执行 默认为0
     * @param common 是否用在全局
     * @returns
     */
    before: (callback: Request.middle["before"], sort: boolean, common: boolean) => {
      remove: () => void
    }
    /**
     * 请求结果中间件
     * @param callback 回调
     * @param sort 排序 数字小的先执行 默认为0
     * @param common 是否用在全局
     * @returns
     */
    result: (callback: Request.middle["result"], sort: boolean, common: boolean) => {
      remove: () => void
    }
    /**
     * 请求错误中间件
     * @param callback 回调
     * @param sort 排序 数字小的先执行 默认为0
     * @param common 是否用在全局
     * @returns
     */
    error: (callback: Request.middle["error"], sort: boolean, common: boolean) => {
      remove: () => void
    }
  },
  request: Request.functions['request']
  throttleRequest: Request.functions['throttleRequest']
}

export function createUpload(config: {
  config: RequestConfig,
  middle: {
    before: Upload.middle['before'][]
    result: Upload.middle['result'][]
    error: Upload.middle['error'][]
  }
}): {
  middle: {
    /**
     * 开始上传前中间件
     * @param callback 回调
     * @param sort 排序 数字小的先执行 默认为0
     * @param common 是否用在全局
     * @returns
     */
    before: (callback: Upload.middle['before'], sort: boolean, common: boolean) => {
      remove: () => void
    }
    /**
     * 上传结果中间件
     * @param callback 回调
     * @param sort 排序 数字小的先执行 默认为0
     * @param common 是否用在全局
     * @returns
     */
    result: (callback: Upload.middle['result'], sort: boolean, common: boolean) => {
      remove: () => void
    }
    /**
     * 上传错误中间件
     * @param callback 回调
     * @param sort 排序 数字小的先执行 默认为0
     * @param common 是否用在全局
     * @returns
     */
    error: (callback: Upload.middle['error'], sort: boolean, common: boolean) => {
      remove: () => void
    }
  },
  upload: Upload.functions['upload']
  uploadTempFile: Upload.functions['uploadTempFile']
}
