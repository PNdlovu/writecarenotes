import { rest } from 'msw'
import { setupServer } from 'msw/node'

export const createApiHandler = (path: string, method: 'get' | 'post' | 'put' | 'delete', response: any) => {
  return rest[method](`/api${path}`, (req, res, ctx) => {
    return res(ctx.json(response))
  })
}

export const createApiError = (path: string, method: 'get' | 'post' | 'put' | 'delete', statusCode: number, error: string) => {
  return rest[method](`/api${path}`, (req, res, ctx) => {
    return res(
      ctx.status(statusCode),
      ctx.json({ error })
    )
  })
}

export const createMockServer = (handlers: any[]) => {
  const server = setupServer(...handlers)

  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  return server
}

export const mockApiResponse = {
  success: true,
  data: null,
  message: '',
}

export const mockApiError = {
  success: false,
  error: 'An error occurred',
  message: 'Something went wrong',
}
