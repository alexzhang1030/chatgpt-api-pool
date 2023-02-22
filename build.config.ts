import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  rollup: {
    emitCJS: true,
    cjsBridge: true,
    esbuild: {
      target: 'es2019',
    },
    inlineDependencies: true,
  },
  declaration: true,
  externals: ['chatgpt', 'consola', 'nodemailer'],
  clean: true,
})
