import { Sidebar } from './components/Sidebar'
import { MainStage } from './components/Stage'

const App = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-carbon text-foreground">
      <Sidebar />
      <MainStage />
    </div>
  )
}

export default App
