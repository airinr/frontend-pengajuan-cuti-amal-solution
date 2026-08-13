import { useState } from 'react'
import { createApp } from 'vue'
import VueCounter from './components/VueCounter.vue'

function VueWrapper({ component, props }: { component: any; props?: Record<string, any> }) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null)
  const mountRef = (el: HTMLDivElement | null) => {
    if (el && !ref) {
      const vueApp = createApp(component, props || {})
      vueApp.mount(el)
      setRef(el)
    }
  }

  return <div ref={mountRef} />
}

function App() {
  const [reactCount, setReactCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            React + Vue + TailwindCSS
          </h1>
          <p className="text-gray-500">
            Powered by Vite
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">React Component</h2>
            <p className="text-gray-600 mb-4">
              Counter built with React hooks and styled with TailwindCSS.
            </p>
            <button
              onClick={() => setReactCount(c => c + 1)}
              className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Count: {reactCount}
            </button>
          </div>

          <div>
            <VueWrapper
              component={VueCounter}
              props={{
                title: 'Vue Component',
                description: 'Counter built with Vue 3 Composition API and styled with TailwindCSS.',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
