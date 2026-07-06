interface MainStageProps {
  showBrand: boolean
}

export const MainStage = ({ showBrand: _showBrand }: MainStageProps) => {
  return (
    <main className="relative flex min-h-0 flex-1 flex-col items-center justify-center" />
  )
}
