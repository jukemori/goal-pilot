class PerformanceAnalysisPlugin {
  constructor(options = {}) {
    this.options = {
      enabled: process.env.NODE_ENV === 'development',
      maxAssetSize: 250 * 1024, // 250KB
      maxEntrypointSize: 500 * 1024, // 500KB
      ...options
    }
  }

  apply(compiler) {
    if (!this.options.enabled) return

    compiler.hooks.done.tap('PerformanceAnalysisPlugin', (stats) => {
      const compilation = stats.compilation
      const assets = compilation.assets
      const entrypoints = compilation.entrypoints

      console.log('\n📊 Performance Analysis Report')
      console.log('=====================================')

      // Analyze asset sizes
      const assetSizes = Object.keys(assets).map(name => ({
        name,
        size: assets[name].size(),
        type: this.getAssetType(name)
      })).sort((a, b) => b.size - a.size)

      // Log large assets
      const largeAssets = assetSizes.filter(asset => asset.size > this.options.maxAssetSize)
      if (largeAssets.length > 0) {
        console.log('\n⚠️  Large Assets (>250KB):')
        largeAssets.forEach(asset => {
          const sizeKB = (asset.size / 1024).toFixed(2)
          const emoji = asset.size > this.options.maxAssetSize * 2 ? '🔴' : '🟡'
          console.log(`  ${emoji} ${asset.name}: ${sizeKB}KB`)
        })
      }

      // Analyze chunks
      const chunks = Array.from(compilation.chunks).map(chunk => ({
        name: chunk.name || 'unnamed',
        size: chunk.size(),
        modules: chunk.getNumberOfModules(),
        id: chunk.id
      })).sort((a, b) => b.size - a.size)

      console.log('\n📦 Chunk Analysis:')
      chunks.slice(0, 10).forEach(chunk => {
        const sizeKB = (chunk.size / 1024).toFixed(2)
        console.log(`  📦 ${chunk.name}: ${sizeKB}KB (${chunk.modules} modules)`)
      })

      // Analyze entrypoints
      console.log('\n🚀 Entrypoint Analysis:')
      for (const [name, entrypoint] of entrypoints.entries()) {
        const size = entrypoint.getSize()
        const sizeKB = (size / 1024).toFixed(2)
        const status = size > this.options.maxEntrypointSize ? '🔴' : '🟢'
        console.log(`  ${status} ${name}: ${sizeKB}KB`)
      }

      // Analyze modules contributing most to bundle size
      const modules = Array.from(compilation.modules)
        .filter(module => module.size && module.size() > 10 * 1024) // >10KB
        .map(module => ({
          name: this.getModuleName(module),
          size: module.size(),
          reasons: module.reasons?.length || 0
        }))
        .sort((a, b) => b.size - a.size)

      if (modules.length > 0) {
        console.log('\n📚 Large Modules (>10KB):')
        modules.slice(0, 10).forEach(module => {
          const sizeKB = (module.size / 1024).toFixed(2)
          console.log(`  📚 ${module.name}: ${sizeKB}KB (${module.reasons} reasons)`)
        })
      }

      // Bundle composition analysis
      const totalSize = assetSizes.reduce((total, asset) => total + asset.size, 0)
      const jsSize = assetSizes.filter(a => a.type === 'js').reduce((total, asset) => total + asset.size, 0)
      const cssSize = assetSizes.filter(a => a.type === 'css').reduce((total, asset) => total + asset.size, 0)

      console.log('\n🎯 Bundle Composition:')
      console.log(`  📊 Total: ${(totalSize / 1024).toFixed(2)}KB`)
      console.log(`  📊 JavaScript: ${(jsSize / 1024).toFixed(2)}KB (${((jsSize / totalSize) * 100).toFixed(1)}%)`)
      console.log(`  📊 CSS: ${(cssSize / 1024).toFixed(2)}KB (${((cssSize / totalSize) * 100).toFixed(1)}%)`)

      // Performance recommendations
      console.log('\n💡 Performance Recommendations:')
      if (largeAssets.length > 0) {
        console.log(`  • Consider code splitting for ${largeAssets.length} large asset(s)`)
      }
      if (totalSize > 1024 * 1024) { // >1MB
        console.log('  • Bundle size is quite large, consider lazy loading')
      }
      if (chunks.length > 20) {
        console.log('  • Many chunks detected, consider chunk optimization')
      }

      console.log('=====================================\n')
    })
  }

  getAssetType(name) {
    if (name.endsWith('.js')) return 'js'
    if (name.endsWith('.css')) return 'css'
    if (/\.(png|jpg|jpeg|gif|svg|webp)$/.test(name)) return 'image'
    if (/\.(woff|woff2|ttf|eot)$/.test(name)) return 'font'
    return 'other'
  }

  getModuleName(module) {
    if (module.context && module.rawRequest) {
      return module.rawRequest
    }
    if (module.userRequest) {
      return module.userRequest.replace(process.cwd(), '.')
    }
    if (module.identifier) {
      return module.identifier().replace(process.cwd(), '.')
    }
    return 'unknown'
  }
}

module.exports = PerformanceAnalysisPlugin