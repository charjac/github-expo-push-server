export const connectDatabase = (env: any) => {
  return Promise.resolve({
    save: (type: any, data: any, opt: any) => ({}),
    find: (type: any) => [],
    findOneAndUpdate: (type: any, query: any, data: any) => ({}),
  })
}
